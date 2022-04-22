//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interface/ICoinDeedFactory.sol";
import "./interface/ILendingPool.sol";
import "./interface/ICoinDeedDeployer.sol";
import "./interface/ICoinDeed.sol";
import "./interface/ICoinDeedAddressesProvider.sol";

contract CoinDeedFactory is ICoinDeedFactory, AccessControl {
    ICoinDeedAddressesProvider public coinDeedAddressesProvider;
    address public coinDeedAdmin;
    uint8 public override maxLeverage = 25;
    uint256 public override platformFee;
    uint256 public override stakingMultiplier;
    uint256 public override maxPriceDrop = 8000;
    uint256 public override liquidationBonus = 500;
    uint256 public override deedCount;

    mapping(address => bool) public tokenPermissions;
    mapping(address => bool) public override isDeed;
    bool internal processing = false;

    mapping(uint256 => address) public override coinDeedAddresses;

    uint256 public constant BASE_DENOMINATOR = 10_000;

    constructor(
        address coinDeedAddressesProviderAddress,
        uint256 _platformFee,
        uint256 _stakingMultiplier) {
        coinDeedAddressesProvider = ICoinDeedAddressesProvider(coinDeedAddressesProviderAddress);
        coinDeedAdmin = msg.sender;
        platformFee = _platformFee;
        stakingMultiplier = _stakingMultiplier;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    //TODO use exchange swap stakingToken to deedToken
    //TODO Check if any rules on leverage size?
    function createDeed(
        ICoinDeed.Pair calldata pair,
        uint256 stakingAmount,
        uint256 wholesaleId,
        ICoinDeed.DeedParameters calldata deedParameters,
        ICoinDeed.ExecutionTime calldata executionTime,
        ICoinDeed.RiskMitigation calldata riskMitigation,
        ICoinDeed.BrokerConfig calldata brokerConfig
    ) external override onlyNotProcessing returns (address) {
        IERC20 deedToken = IERC20(coinDeedAddressesProvider.deedToken());
        require(
            deedToken.allowance(msg.sender, address(this)) >= stakingAmount,
            "Allowance from ERC20 is not enough for staking."
        );
        require(
            pair.tokenA != pair.tokenB,
            "Trading pairs can not be the same token"
        );
        require(
            deedParameters.leverage <= maxLeverage,
            "Leverage can not be bigger than MaxLeverage."
        );
        require(
            tokenPermissions[pair.tokenA] && tokenPermissions[pair.tokenB],
            "Not on permissioned token list"
        );

        require(ILendingPool(coinDeedAddressesProvider.lendingPool()).poolActive(pair.tokenA), "LendingPool does not exist.");

        // Coded this way to prevent re-entry ruining ID number tracking
        uint256 deedCount_ = deedCount;
        deedCount += 1;
        address coinDeedAddress = ICoinDeedDeployer(coinDeedAddressesProvider.coinDeedDeployer()).deploy(
            msg.sender,
            address(coinDeedAddressesProvider),
            stakingAmount,
            pair,
            deedParameters,
            executionTime,
            riskMitigation,
            brokerConfig
        );

        isDeed[coinDeedAddress] = true;
        coinDeedAddresses[deedCount_] = coinDeedAddress;
        deedToken.transferFrom(msg.sender, coinDeedAddress, stakingAmount);

        emit DeedCreated(deedCount_, coinDeedAddress, msg.sender, deedParameters.leverage, wholesaleId, executionTime.recruitingEndTimestamp, executionTime.buyTimestamp, executionTime.sellTimestamp);

        if (wholesaleId > 0) {
            ICoinDeed(coinDeedAddress).reserveWholesale(wholesaleId);
        }

        return coinDeedAddress;
    }

    modifier onlyDeedOrProcessing() {
        require(isDeed[msg.sender] || processing, "Caller is not a Deed");
        _;
    }

    modifier onlyDeed() {
        require(isDeed[msg.sender], "Caller is not a Deed");
        _;
    }

    modifier onlyNotProcessing() {
        require(!processing, "Invalid processing");
        processing = true;
        _;
        processing = false;
    }

    function setMaxLeverage(uint8 _maxLeverage)
    public
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
    {
        maxLeverage = _maxLeverage;
    }

    function setStakingMultiplier(uint256 _stakingMultiplier) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        stakingMultiplier = _stakingMultiplier;
    }

    function setPlatformFee(uint256 _platformFee) public override  onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_platformFee <= BASE_DENOMINATOR, "Invalid platform fee");
        platformFee = _platformFee;
    }

    function setMaxPriceDrop(uint256 _maxPriceDrop) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxPriceDrop < BASE_DENOMINATOR, "Invalid max price drop");
        maxPriceDrop = _maxPriceDrop;
    }

    function setLiquidationBonus(uint256 _liquidationBonus) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_liquidationBonus < BASE_DENOMINATOR, "Invalid liquidation bonus");
        liquidationBonus = _liquidationBonus;
    }

    function permitToken(address token)
    public
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
    {
        tokenPermissions[token] = true;
    }

    function unpermitToken(address token)
    public
    override
    onlyRole(DEFAULT_ADMIN_ROLE)
    {
        tokenPermissions[token] = false;
    }

    function emitStakeAdded(
        address broker,
        uint256 amount
    ) external onlyDeedOrProcessing override {
        emit StakeAdded(
            msg.sender,
            broker,
            amount
        );
    }

    function emitStateChanged(
        ICoinDeed.DeedState state
    ) external onlyDeed override {
        emit StateChanged(
            msg.sender,
            state
        );
    }

    function emitDeedCanceled(
        address deedAddress
    ) external onlyDeed override {
        emit DeedCanceled(
            msg.sender,
            deedAddress
        );
    }

    function emitSwapExecuted(
        uint256 tokenBought,
        int256 oracleAnswer
    ) external onlyDeed override {
        emit SwapExecuted(
            msg.sender,
            tokenBought,
            oracleAnswer
        );
    }

    function emitBuyIn(
        address buyer,
        uint256 amount
    ) external onlyDeed override {
        emit BuyIn(
            msg.sender,
            buyer,
            amount
        );
    }

    function emitExitDeed(
        address buyer,
        uint256 amount
    ) external onlyDeed override {
        emit ExitDeed(
            msg.sender,
            buyer,
            amount
        );
    }

    function emitPayOff(
        address buyer,
        uint256 amount
    ) external onlyDeed override {
        emit PayOff(
            msg.sender,
            buyer,
            amount
        );
    }

    function emitLeverageChanged(
        address salePercentage
    ) external onlyDeed override {
        emit LeverageChanged(
            msg.sender,
            salePercentage
        );
    }

    function emitRiskMitigationTriggered(
        uint256 collateralAmount,
        uint256 debtAmount,
        bool level
    ) external onlyDeed override {
        emit RiskMitigationTriggered(
            msg.sender,
            collateralAmount,
            debtAmount,
            level
        );
    }

    function emitBrokersEnabled() external override {
        emit BrokersEnabled(
            msg.sender
        );
    }

    function emitSendToVault(uint256 amount) external override {
        emit SendToVault(
            msg.sender,
            amount
        );
    }

    function emitCurrentSupplyValue(uint256 amount) external override {
        emit CurrentSupplyValue(msg.sender, amount);
    }

    function getCoinDeedAddressesProvider() external view override returns (address) {
        return address(coinDeedAddressesProvider);
    }
}
