//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interface/IToken.sol";
import "./interface/ICoinDeed.sol";
import "./interface/ILendingPool.sol";
import "./interface/ICoinDeedFactory.sol";
import "./interface/IWholesaleFactory.sol";
import "./interface/ICoinDeedDao.sol";
import "./interface/ICoinDeedAddressesProvider.sol";
import {CoinDeedUtils} from "./libraries/CoinDeedUtils.sol";
import {CoinDeedAddressesProviderUtils} from "./libraries/CoinDeedAddressesProviderUtils.sol";
import "./interface/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CoinDeed is ICoinDeed, AccessControl {
    using SafeERC20 for IERC20;
    using CoinDeedAddressesProviderUtils for ICoinDeedAddressesProvider;

    uint256 public constant BASE_DENOMINATOR = 10_000;
    // TODO
    address internal constant USDT_ADDRESS = 0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e;

    address public override manager;
    uint256 public override totalFee;
    uint256 public override totalSupply;
    uint256 public override totalStake;
    uint256 public override wholesaleId;
    uint256 public override totalPurchasedToken;
    uint256 public override pendingToken;
    bool public override riskMitigationTriggered;

    ICoinDeedAddressesProvider coinDeedAddressesProvider;

    Pair public pair;
    ExecutionTime public override executionTime;
    DeedParameters public override deedParameters;
    RiskMitigation public override riskMitigation;
    BrokerConfig public override brokerConfig;
    DeedState public override state;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public buyIns;

    constructor(
        address manager_,
        address coinDeedAddressesProvider_,
        uint256 stakingAmount_,
        Pair memory pair_,
        DeedParameters memory deedParameters_,
        ExecutionTime memory executionTime_,
        RiskMitigation memory riskMitigation_,
        BrokerConfig memory brokerConfig_) {

        coinDeedAddressesProvider = ICoinDeedAddressesProvider(coinDeedAddressesProvider_);

        _setupRole(DEFAULT_ADMIN_ROLE, manager_);

        manager = manager_;
        pair = pair_;

        _edit(deedParameters_);
        _editExecutionTime(executionTime_);
        _editRiskMitigation(riskMitigation_);
        brokerConfig = brokerConfig_;

        state = DeedState.SETUP;
        _stake(manager, stakingAmount_);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    function _onlyInState(DeedState state_) private view {
        require(state == state_, "WRONG_STATE");
    }

    function _onlyInStates(DeedState[2] memory states) private view {
        bool found = false;

        for (uint i = 0; i < states.length; i++) {
            if (state == states[i]) {
                found = true;
            }
        }
        require(found, "WRONG_STATE");
    }

    modifier onlyInState(DeedState state_) {
        _onlyInState(state_);
        _;
    }

    modifier onlyInStates(DeedState[2] memory states) {
        _onlyInStates(states);
        _;
    }

    /// @notice Set the saleId to 0 to unreserve a wholesale
    function reserveWholesale(uint256 saleId) public override {
        require(msg.sender == coinDeedAddressesProvider.coinDeedFactory() || msg.sender == manager, "INVALID_SENDER");

        IWholesaleFactory wholesaleFactory = IWholesaleFactory(coinDeedAddressesProvider.wholesaleFactory());
        if(saleId == 0) {
            wholesaleFactory.cancelReservation(wholesaleId);
        }
        else {
            IWholesaleFactory.Wholesale memory wholesale = wholesaleFactory.getWholesale(saleId);
            require(wholesale.tokenOffered == pair.tokenB, "WRONG_TOKEN_B");
            require(wholesale.tokenRequested == pair.tokenA, "WRONG_TOKEN_A");
            require(wholesale.minSaleAmount < deedParameters.deedSize, "BAD_AMOUNT");
            require(wholesale.deadline > executionTime.buyTimestamp, "BAD_BUY_TIME");
            wholesaleFactory.reserveWholesale(saleId);
        }
        wholesaleId = saleId;
    }

    /** @notice Moves the deed from recruiting to escrow. */
    function ready() onlyInState(DeedState.SETUP) external override {
        require(msg.sender == manager || block.timestamp > executionTime.recruitingEndTimestamp, "READY_NOT_ELIGIBLE");
        _checkIfDeedIsReady();
    }

    function _checkIfDeedIsReady() internal {
        // Provide address provider to allow calculations with oracle
        ICoinDeedFactory coinDeedFactory = ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory());
        require(coinDeedAddressesProvider.readyCheck(
                pair.tokenA,
                totalStake,
                coinDeedFactory.stakingMultiplier(),
                deedParameters),
            "Deed is not ready"
        );
        state = DeedState.READY;
        coinDeedFactory.emitStateChanged(state);
    }

    function _stake(address supplier, uint256 amount) internal {
        stakes[supplier] += amount;
        totalStake += amount;
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitStakeAdded(supplier, amount);
    }

    /** @notice Stake as a broker in the recruiting phase. */
    function stake(uint256 amount) onlyInState(DeedState.SETUP) external override {
        require(block.timestamp < executionTime.recruitingEndTimestamp, "RECRUITING_ENDED");
        require(msg.sender == manager || brokerConfig.allowed, "NO_BROKERS");
        IToken(coinDeedAddressesProvider.deedToken()).transferFrom(msg.sender, address(this), amount);
        _stake(msg.sender, amount);
    }

    function editBrokerConfig(BrokerConfig memory brokerConfig_) onlyRole(DEFAULT_ADMIN_ROLE) onlyInState(DeedState.SETUP) public override {
        _editBrokerConfig(brokerConfig_);
    }

    function editRiskMitigation(RiskMitigation memory riskMitigation_) onlyRole(DEFAULT_ADMIN_ROLE) onlyInState(DeedState.SETUP) public override {
        _editRiskMitigation(riskMitigation_);
    }

    function editExecutionTime(ExecutionTime memory executionTime_) onlyRole(DEFAULT_ADMIN_ROLE) onlyInState(DeedState.SETUP) public override {
        _editExecutionTime(executionTime_);
    }

    function editSwapType(uint256 saleId_) onlyRole(DEFAULT_ADMIN_ROLE) onlyInState(DeedState.SETUP) public override {
        _editSwapType(saleId_);
    }

    function editBasicInfo(uint256 deedSize_, uint8 leverage_, uint256 managementFee_, uint256 minimumBuy_, uint256 minimumJoin_) onlyRole(DEFAULT_ADMIN_ROLE) onlyInState(DeedState.SETUP) public override {
        require(totalStake == stakes[msg.sender], "NO_BROKERS");
        _edit(deedSize_, leverage_, managementFee_, minimumBuy_, minimumJoin_);

    }

    /** @notice Buyer exits the deed during the open phase. If paying off debt,
      * user receives their share of the collateral in return for paying off their
      * share of the debt. Otherwise, the entire collateral is sold, debt paid, and the
      * remainder transferred to the buyer. */
    function exitDeed(bool payoff_) onlyInState(DeedState.OPEN) payable public override {
        require(buyIns[msg.sender] > 0, "NO_BUY_IN");
        if(wholesaleId != 0) {
            IWholesaleFactory wholesaleFactory = IWholesaleFactory(coinDeedAddressesProvider.wholesaleFactory());
            IWholesaleFactory.Wholesale memory wholesale = wholesaleFactory.getWholesale(wholesaleId);
            require(block.timestamp >= executionTime.buyTimestamp + wholesale.exitDeedLock, "NOT_EXIT_TIME");
        }

        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        uint256 buyIn_ = buyIns[msg.sender];
        uint256 totalSupply_ = totalSupply;
        pendingToken = pendingToken + lendingPool.pendingToken(pair.tokenB, address(this));
        uint256 pendingToken_ = pendingToken;
        pendingToken = pendingToken - (pendingToken * buyIns[msg.sender] / totalSupply);
        totalSupply -= buyIn_;
        buyIns[msg.sender] = 0;

        coinDeedAddressesProvider.exitDeed(
            pair,
            buyIn_,
            totalSupply_,
            pendingToken_,
            payoff_
        );
    }

    function edit(DeedParameters memory deedParameters_,
        ExecutionTime memory executionTime_,
        RiskMitigation memory riskMitigation_,
        BrokerConfig memory brokerConfig_,
        uint256 saleId_) onlyRole(DEFAULT_ADMIN_ROLE) onlyInState(DeedState.SETUP) public override {

        _edit(deedParameters_);
        _editExecutionTime(executionTime_);
        _editRiskMitigation(riskMitigation_);
        _editBrokerConfig(brokerConfig_);
        _editSwapType(saleId_);
    }

    /** @notice Cancels the deed, allowing users to withdraw their funds and stakes. */
    function cancel() onlyInStates([DeedState.SETUP, DeedState.READY]) external override {
        ICoinDeedFactory coinDeedFactory = ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory());
        uint256 stakeManager = stakes[manager];
        bool isDeedReady = coinDeedAddressesProvider.readyCheck(pair.tokenA, totalStake, coinDeedFactory.stakingMultiplier(), deedParameters);
        require(
            CoinDeedUtils.cancelCheck(state, executionTime, deedParameters, totalSupply, totalStake, stakeManager, isDeedReady),
            "CANT_CANCEL"
        );

        state = DeedState.CANCELED;
        stakes[manager] = 0;
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitStateChanged(state);
        if (wholesaleId > 0) {
            reserveWholesale(0);
        }
        IToken(coinDeedAddressesProvider.deedToken()).transfer(manager, stakeManager);
    }

    /** @notice Broker withdraws their stake. */
    function withdrawStake() external override {
        require(CoinDeedUtils.withdrawStakeCheck(state, executionTime, stakes[msg.sender], msg.sender == manager), "BAD_WITHDRAW");
        uint256 stakeAmount = stakes[msg.sender];    
        uint256 totalManagementFee = totalFee;
        totalFee -= totalFee * (BASE_DENOMINATOR * stakeAmount / totalStake) / BASE_DENOMINATOR;
        stakes[msg.sender] = 0; 
        totalStake -= stakes[msg.sender];

        coinDeedAddressesProvider.withdrawStake(
            pair,
            state,
            stakeAmount,
            totalStake,
            totalManagementFee
        );
    }

    /** @notice Buyer buys in. *amount* is ignored if tokenA is ETH, instead relying on msg.value */
    function buyIn(uint256 amount) onlyInState(DeedState.READY) external payable override {
        require(block.timestamp < executionTime.buyTimestamp, "BUYIN_TIME_OVER");
        require(amount >= deedParameters.minimumJoin, "BAD_BUYIN_AMOUNT");

        IERC20 tokenA = IERC20(pair.tokenA);
        uint256 maxBuyIn = (deedParameters.deedSize / deedParameters.leverage) - totalSupply;
        uint256 buyInAmount = maxBuyIn < amount ? maxBuyIn : amount;

        require(buyInAmount > 0, "DEED_FULL");

        totalSupply += buyInAmount;
        buyIns[msg.sender] += buyInAmount;

        // If tokenA is ETH, the buyin balance is already in msg.value. return any extra
        if(pair.tokenA == address(0x00)) {
            (bool sent, ) = msg.sender.call{value: msg.value - buyInAmount}("");
            require(sent, "FAILED_ETH_TRANSFER");
        }
        // Otherwise take the token A of the buyer
        else {
            tokenA.safeTransferFrom(msg.sender, address(this), buyInAmount);
        }

        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitBuyIn(msg.sender, amount);
    }

    /** @notice Commences the deed. The management fee is collected at this step.
      * The management fee is divided up upon stakers claiming their balance.
      * Set minAmountOut to 0 to set minAmountOut to 97.5% of the chainlink oracle price.
      * if minAmountOut > 0, it cannot be less than 95% of the chainlink oracle price for safety. */
    function buy(uint256 minAmountOut) onlyInState(DeedState.READY) external override {
        (totalFee, totalPurchasedToken) = coinDeedAddressesProvider.buy(
            pair,
            executionTime,
            deedParameters,
            totalSupply,
            wholesaleId,
            minAmountOut
        );
        state = DeedState.OPEN;
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitStateChanged(state);
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitCurrentSupplyValue(totalSupply);
    }

    /** @notice Ends the deed. All the assets deposited in the lending pool are withdrawn and sold.
      * The debt is repaid with the sold assets, and the deed transitions to the closed state.
      * Set minAmountOut to 0 to set minAmountOut to 97.5% of the chainlink oracle price.
      * if minAmountOut > 0, it cannot be less than 95% of the chainlink oracle price for safety.*/
    function sell(uint256 minAmountOut) onlyInState(DeedState.OPEN) external override {
        state = DeedState.CLOSED;
        coinDeedAddressesProvider.sell(pair, executionTime, minAmountOut, totalSupply, pendingToken);
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitStateChanged(state);
                
        //Only dtoken are sent to vault
        uint256 amountDToken = IToken(coinDeedAddressesProvider.deedToken()).balanceOf(address(this)) - totalStake;
        coinDeedAddressesProvider.sendToVault(amountDToken);
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitSendToVault(amountDToken);
    }

    /** @notice Calling this function will have the caller pay off the appropriate amount of debt
      * given the risk mitigation parameters after appropriate risk mitigation validation. The caller receives
      * an amount of collateral equal to the value of the debt paid off with an incentive discount
      * set by the CoinDeedFactory. This is calculated using an oracle feed registry which should
      * be connected to Chainlink oracles.
      * The user is responsible for tracking the position of the deed and making sure that their
      * balances and approvals are set appropriately to take advantage of this function.*/
    function executeRiskMitigation() external payable override onlyInState(DeedState.OPEN) {
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());

        // Check risk mitigation validity and get liquidation amounts
        (uint256 sellAmount, uint256 buyAmount) = coinDeedAddressesProvider.checkRiskMitigationAndGetSellAmount(
            pair, riskMitigation, riskMitigationTriggered);

        // Calculate liquidator discount
        uint256 discount = buyAmount * ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory())
            .liquidationBonus() / BASE_DENOMINATOR;

        // Change states before external contract interactions
        if (riskMitigationTriggered) {
            state = DeedState.CLOSED;
            ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitStateChanged(state);
        }
        riskMitigationTriggered = true;


        // Transfer the debt tokens from the liquidator and repay the debt.
        // If ETH, debt tokens are in msg.value so we return any extra.
        if(pair.tokenA == address(0x00)) {
            payable(msg.sender).transfer(msg.value - (buyAmount - discount));
        }
        else {
            IERC20(pair.tokenA).safeTransferFrom(msg.sender, address(this), buyAmount - discount);
        }
        _repay(buyAmount - discount);

        // Withdraw the appropriate amount of collateral and transfer to liquidator
        lendingPool.withdraw(pair.tokenB, sellAmount);
        _transfer(pair.tokenB, payable(msg.sender), sellAmount);
        ICoinDeedFactory(
            coinDeedAddressesProvider.coinDeedFactory()).emitRiskMitigationTriggered(
                sellAmount, buyAmount, state == DeedState.CLOSED);
    }

    /** @notice Distributes a share of the balance based on the buyin of the sender.
      * @dev The assumption is made that all token A are in this deed contract's token A balance. */
    function claimBalance() onlyInStates([DeedState.CLOSED, DeedState.CANCELED]) external override {
        //assumes totalSupply reflects the total buyins at the time of deed execution
        uint256 claimAmount = CoinDeedUtils.getClaimAmount(
            state,
            pair.tokenA,
            totalSupply,
            totalFee,
            buyIns[msg.sender]);
        totalSupply -= buyIns[msg.sender];
        buyIns[msg.sender] = 0;
        _transfer(
            pair.tokenA,
            payable(msg.sender),
            claimAmount
        );
    }

    function _edit(uint256 deedSize_, uint8 leverage_, uint256 managementFee_, uint256 minimumBuy_, uint256 minimumJoin_) internal {
        require(leverage_ <= ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).maxLeverage(), "BAD_LEVERAGE");
        require(minimumBuy_ > 0 && minimumBuy_ <= BASE_DENOMINATOR, "BAD_MIN_BUY");
        deedParameters.deedSize = deedSize_;
        deedParameters.leverage = leverage_;
        deedParameters.managementFee = managementFee_;
        deedParameters.minimumBuy = minimumBuy_;
        deedParameters.minimumJoin = minimumJoin_;
    }

    function _edit(DeedParameters memory deedParameters_) internal {
        _edit(deedParameters_.deedSize, deedParameters_.leverage, deedParameters_.managementFee, deedParameters_.minimumBuy, deedParameters_.minimumJoin);
    }

    function _editExecutionTime(ExecutionTime memory executionTime_) internal {
        coinDeedAddressesProvider.validateExecutionTime(executionTime_, wholesaleId);
        executionTime = executionTime_;
    }

    function _editRiskMitigation(RiskMitigation memory riskMitigation_) internal {
        coinDeedAddressesProvider.validateRiskMitigation(riskMitigation_, deedParameters.leverage);
        riskMitigation = riskMitigation_;
    }

    function _editBrokerConfig(BrokerConfig memory brokerConfig_) internal {
        if (brokerConfig_.allowed && !brokerConfig.allowed) {
            ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitBrokersEnabled();
        }
        brokerConfig = brokerConfig_;
    }

    function _editSwapType(uint256 saleId_) internal {
        if (wholesaleId != saleId_) {
            if (wholesaleId != 0) {
                require(saleId_ == 0, "ALREADY_RESERVE");
            } else {
                require(saleId_ != 0, "ALREADY_USE_DEX");
            }
            reserveWholesale(saleId_);
        }
    }

    function _transfer(address token, address payable recipient, uint256 amount) internal {
        if (token == address(0x00)) {
            (bool sent, ) = recipient.call{value: amount}("");
            require(sent, "FAILED_ETH");
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }
    }

    function _repay(uint amount) internal {
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        if (pair.tokenA == address(0x00)) {
            lendingPool.repay{value : amount}(pair.tokenA, amount);
        } else {
            if (pair.tokenA == USDT_ADDRESS) {
                IERC20(pair.tokenA).safeApprove(address(lendingPool), 0);
            }
            IERC20(pair.tokenA).safeApprove(address(lendingPool), amount);
            lendingPool.repay(pair.tokenA, amount);
        }
    }

    function getCoinDeedAddressesProvider() external view override returns (address) {
        return address(coinDeedAddressesProvider);
    }
}
