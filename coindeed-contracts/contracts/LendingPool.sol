//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "./libraries/SafeERC20.sol";
import "./interface/ICoinDeedDao.sol";
import "./interface/ICoinDeedFactory.sol";
import "./interface/ILendingPool.sol";
import "./Exponential.sol";
import "./ErrorReporter.sol";
import "./interface/ICoinDeedAddressesProvider.sol";

import "hardhat/console.sol";

contract LendingPool is
    Exponential,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    TokenErrorReporter,
    ReentrancyGuardUpgradeable,
    ILendingPool
{
    using SafeERC20 for IERC20;
    using SafeMathUpgradeable for uint256;

    ICoinDeedAddressesProvider coinDeedAddressesProvider;
    uint256 public constant BASE_DENOMINATOR = 1000000;
    uint256 public constant COLLATERAL_FACTOR = 800000; // 80%
    uint256 public constant REWARD_FACTOR = 500000;
    uint256 public constant POOL_DECIMALS = 18;
    uint256 public constant RESERVE_FACTOR_MANTISSA = 0; // accrued interest has not been converted to reserve interest
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    /**
     * @notice The approximate number of blocks per year that is assumed by the interest rate model
     */
    uint256 public constant blocksPerYear = 2102400;

    /**
     * @notice The multiplier of utilization rate that gives the slope of the interest rate
     */
    uint256 public multiplierPerBlock; // 20%

    /**
     * @notice The base interest rate which is the y-intercept when utilization rate is 0
     */
    uint256 public baseRatePerBlock; // 2.5%

    // Info of each pool.
    mapping(address => PoolInfo) public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(address => DeedInfo) public deedInfo;
    // How many amountToken the user has provided
    mapping(address => mapping(address => UserAssetInfo)) public userAssetInfo;

    function initialize(
        address _coinDeedAddressesProvider,
        uint256 multiplierPerYear,
        uint256 baseRatePerYear
    ) public override initializer {
        __Ownable_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        coinDeedAddressesProvider = ICoinDeedAddressesProvider(
            _coinDeedAddressesProvider
        );

        // ETH
        PoolInfo storage poolETH = poolInfo[address(0)];
        poolETH.decimals = 18;
        poolETH.isCreated = true;
        poolETH.borrowIndex = mantissaOne;
        poolETH.supplyIndex = mantissaOne;
        poolETH.supplyIndexDebt = mantissaOne;

        // 420480 / 2102400 = 20%
        multiplierPerBlock = multiplierPerYear.div(blocksPerYear);
        // 52560 / 2102400 = 2.5%
        baseRatePerBlock = baseRatePerYear.div(blocksPerYear);
    }

    modifier onlyDeed() {
        require(
            ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory())
                .isDeed(msg.sender),
            "Coindeed: Caller is not a Deed"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Coindeed: caller is not the admin"
        );
        _;
    }

    function setCoinDeedAddressesProvider(address _coinDeedAddressesProvider)
        public
        override
        onlyAdmin
    {
        coinDeedAddressesProvider = ICoinDeedAddressesProvider(
            _coinDeedAddressesProvider
        );
    }

    function createPool(address _tokenAddress) public override onlyAdmin {
        PoolInfo storage pool = poolInfo[_tokenAddress];
        require(!pool.isCreated, "Coindeed: pool exists");
        uint256 tokenDecimals = IERC20MetadataUpgradeable(_tokenAddress)
            .decimals();
        // lending pool
        pool.decimals = tokenDecimals;
        pool.isCreated = true;
        pool.borrowIndex = 10**tokenDecimals;
        pool.supplyIndex = 10**tokenDecimals;
        pool.supplyIndexDebt = 10**tokenDecimals;
        pool.accrualBlockNumber = block.number;

        emit PoolAdded(_tokenAddress, tokenDecimals);
    }

    function addNewDeed(address _address) external override {
        _addNewDeed(_address);
    }

    function _addNewDeed(address _address) internal {
        deedInfo[_address].isValid = true;
    }

    function getBlockDelta(uint256 _from, uint256 _to)
        internal
        pure
        returns (uint256)
    {
        return _to.sub(_from);
    }

    function pendingToken(address _token, address _lender)
        external
        view
        override
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_token];
        UserAssetInfo storage user = userAssetInfo[_lender][_token];
        uint256 supplyIndex = pool.supplyIndex;
        if (pool.totalBorrows != 0) {
            uint256 blockDelta = getBlockDelta(
                pool.accrualBlockNumber,
                getBlockNumber()
            );
            uint256 supplyRatePerBlock = getSupplyRate(
                getCashPrior(_token),
                pool.totalBorrows,
                pool.totalReserves,
                RESERVE_FACTOR_MANTISSA
            ).div(blocksPerYear);
            supplyIndex = supplyRatePerBlock
                .mul(blockDelta)
                .mul(pool.supplyIndex)
                .div(1e18)
                .add(pool.supplyIndex);
        }
        return
            user
                .amount
                .mul(supplyIndex.sub(user.supplyIndex))
                .div(10**pool.decimals)
                .mul(REWARD_FACTOR)
                .div(BASE_DENOMINATOR);
    }

    function pendingDToken(address _token, address _lender)
        external
        view
        override
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_token];
        UserAssetInfo storage user = userAssetInfo[_lender][_token];
        uint256 supplyIndex = pool.supplyIndex;
        if (pool.totalBorrows != 0) {
            uint256 blockDelta = getBlockDelta(
                pool.accrualBlockNumber,
                getBlockNumber()
            );
            uint256 supplyRatePerBlock = getSupplyRate(
                getCashPrior(_token),
                pool.totalBorrows,
                pool.totalReserves,
                RESERVE_FACTOR_MANTISSA
            ).div(blocksPerYear);
            supplyIndex = supplyRatePerBlock
                .mul(blockDelta)
                .mul(pool.supplyIndex)
                .div(1e18)
                .add(pool.supplyIndex);
        }
        return
            ICoinDeedDao(coinDeedAddressesProvider.coinDeedDao())
                .exchangRewardToken(
                    _token,
                    user
                        .amount
                        .mul(supplyIndex.sub(user.supplyIndex))
                        .div(10**pool.decimals)
                        .mul(REWARD_FACTOR)
                        .div(BASE_DENOMINATOR)
                );
    }

    function totalBorrowBalance(address _token, address _deed)
        external
        view
        override
        returns (uint256)
    {
        if (deedInfo[_deed].borrowIndex == 0) {
            return 0;
        }
        PoolInfo storage pool = poolInfo[_token];
        DeedInfo storage deed = deedInfo[_deed];
        uint256 cash = _token == address(0)
            ? address(this).balance
            : IERC20(_token).balanceOf(address(this));
        uint256 borrowIndex = pool.borrowIndex;
        if (
            getBlockNumber() > pool.accrualBlockNumber && pool.totalBorrows != 0
        ) {
            uint256 blockDelta = getBlockDelta(
                pool.accrualBlockNumber,
                getBlockNumber()
            );

            uint256 borrowRatePerBlock = getBorrowRate(
                cash,
                pool.totalBorrows,
                pool.totalReserves
            ).div(blocksPerYear);

            borrowIndex = borrowRatePerBlock
                .mul(blockDelta)
                .mul(borrowIndex)
                .div(1e18)
                .add(borrowIndex);
        }
        return deed.totalBorrow.mul(borrowIndex).div(deed.borrowIndex);
    }

    function totalDepositBalance(address _token, address _lender)
        external
        view
        override
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_token];
        UserAssetInfo storage user = userAssetInfo[_lender][_token];
        uint256 supplyIndex = pool.supplyIndex;
        if (pool.totalBorrows != 0) {
            uint256 blockDelta = getBlockDelta(
                pool.accrualBlockNumber,
                getBlockNumber()
            );
            uint256 supplyRatePerBlock = getSupplyRate(
                getCashPrior(_token),
                pool.totalBorrows,
                pool.totalReserves,
                RESERVE_FACTOR_MANTISSA
            ).div(blocksPerYear);
            supplyIndex = supplyRatePerBlock
                .mul(blockDelta)
                .mul(pool.supplyIndex)
                .div(1e18)
                .add(pool.supplyIndex);
        }
        return
            user
                .amount
                .mul(supplyIndex.sub(user.supplyIndex))
                .div(10**pool.decimals)
                .mul(REWARD_FACTOR)
                .div(BASE_DENOMINATOR)
                .add(user.amount);
    }

    function borrowAmount(address _lender)
        external
        view
        override
        returns (uint256)
    {
        return deedInfo[_lender].borrow;
    }

    function depositAmount(address _token, address _lender)
        external
        view
        override
        returns (uint256)
    {
        return userAssetInfo[_lender][_token].amount;
    }

    function poolActive(address _token) external view override returns (bool) {
        return poolInfo[_token].isCreated;
    }

    //Function for user to claim their DToken
    function claimDToken(address _tokenAddress) external override {
        UserAssetInfo storage userAsset = userAssetInfo[msg.sender][
            _tokenAddress
        ];
        PoolInfo storage pool = poolInfo[_tokenAddress];
        uint256 error = accrueInterest(pool, _tokenAddress);
        require(
            error == uint256(Error.NO_ERROR),
            "Coindeed: accrue interest calculation failed"
        );
        uint256 pending = userAsset
            .amount
            .mul(pool.supplyIndex.sub(userAsset.supplyIndex))
            .div(10**pool.decimals)
            .mul(REWARD_FACTOR)
            .div(BASE_DENOMINATOR);
        if (pending > 0) {
            if (_tokenAddress == address(0)) {
                (bool sent, ) = msg.sender.call{value: pending}(""); // send reward ETH
                require(sent, "Coindeed: Transfer failed");
            } else {
                IERC20(_tokenAddress).safeTransfer(msg.sender, pending); //send reward token
            }
            ICoinDeedDao(coinDeedAddressesProvider.coinDeedDao()).claimDToken(
                _tokenAddress,
                msg.sender,
                pending
            );
        }
        userAsset.supplyIndex = pool.supplyIndex;
    }

    // Stake tokens to Pool
    function deposit(address _tokenAddress, uint256 _amount)
        external
        payable
        override
        nonReentrant
    {
        PoolInfo storage pool = poolInfo[_tokenAddress];
        require(pool.isCreated, "Coindeed: this token is not supported");
        // first deposit of pool
        uint256 cashPool = getCashPrior(_tokenAddress);
        if (cashPool > 0) {
            updatePool(_tokenAddress);
            uint256 error = accrueInterest(pool, _tokenAddress);
            require(
                error == uint256(Error.NO_ERROR),
                "Coindeed: accrue interest calculation failed"
            );
            require(
                pool.accrualBlockNumber == getBlockNumber(),
                "Coindeed: market not fresh"
            );
        }

        UserAssetInfo storage userAsset = userAssetInfo[msg.sender][
            _tokenAddress
        ];

        if (userAsset.amount > 0) {
            // calculate pending token
            uint256 pending = userAsset
                .amount
                .mul(pool.supplyIndex.sub(userAsset.supplyIndex))
                .div(10**pool.decimals)
                .mul(REWARD_FACTOR)
                .div(BASE_DENOMINATOR);
            if (pending > 0) {
                if (_tokenAddress == address(0)) {
                    (bool sent, ) = msg.sender.call{value: pending}(""); // send reward ETH
                    require(sent, "Coindeed: Transfer failed");
                } else {
                    IERC20(_tokenAddress).safeTransfer(msg.sender, pending); //Send reward token
                }
                ICoinDeedDao(coinDeedAddressesProvider.coinDeedDao())
                    .claimDToken(_tokenAddress, msg.sender, pending);
            }
        }
        if (_amount > 0) {
            if (_tokenAddress == address(0)) {
                require(msg.value == _amount, "Coindeed: not enough");
                userAsset.amount = userAsset.amount.add(msg.value);
            } else {
                require(
                    pool.isCreated,
                    "Coindeed: this token is not supported"
                );
                userAsset.amount = userAsset.amount.add(_amount);
                IERC20(_tokenAddress).safeTransferFrom(
                    msg.sender,
                    address(this),
                    _amount
                );
            }
        }

        if (cashPool == 0) {
            uint256 error = accrueInterest(pool, _tokenAddress);
            require(
                error == uint256(Error.NO_ERROR),
                "Coindeed: accrue interest calculation failed"
            );
        }
        userAsset.supplyIndex = pool.supplyIndex;

        // push event
        emit Deposit(msg.sender, _amount);
    }

    // Borrow
    function borrow(address _tokenAddress, uint256 _amount) external override {
        require(
            deedInfo[msg.sender].isValid ||
                ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory())
                    .isDeed(msg.sender),
            "Coindeed: Only deed can borrow from pool"
        );
        PoolInfo storage pool = poolInfo[_tokenAddress];
        DeedInfo storage deed = deedInfo[msg.sender];

        require(pool.isCreated, "Coindeed: this token is not supported");
        bool isFirst = pool.totalBorrows == 0;
        // first borrow of pool
        if (!isFirst) {
            // Re-caculate the accure interest
            uint256 error = accrueInterest(pool, _tokenAddress);
            require(
                error == uint256(Error.NO_ERROR),
                "Coindeed: accrue interest calculation failed"
            );
            // Verify market's block number equals current block number
            require(
                pool.accrualBlockNumber == getBlockNumber(),
                "Coindeed: market not fresh"
            );
        } else {
            pool.accrualBlockNumber = getBlockNumber();
        }

        uint256 totalLQ = _tokenAddress == address(0)
            ? (address(this).balance)
            : IERC20(_tokenAddress).balanceOf(address(this));
        require(
            (totalLQ.mul(COLLATERAL_FACTOR).div(BASE_DENOMINATOR)) >= _amount,
            "Coindeed: not enough liquidity"
        );

        // calculate new borrow balance (add fee)
        (MathError err, uint256 result) = borrowBalanceStoredInternal(
            msg.sender,
            pool.borrowIndex
        );
        require(
            err == MathError.NO_ERROR,
            "Coindeed: borrowBalanceStoredInternal failed"
        );

        if (_tokenAddress == address(0)) {
            (bool sent, ) = msg.sender.call{value: _amount}("");
            require(sent, "Coindeed: Transfer failed");
        } else {
            IERC20(_tokenAddress).safeTransfer(msg.sender, _amount);
        }
        deed.borrowIndex = pool.borrowIndex;
        deed.borrow = deed.borrow.add(_amount);
        deed.totalBorrow = result.add(_amount);
        pool.totalBorrows = pool.totalBorrows.add(_amount);

        emit Borrow(msg.sender, _amount);
    }

    // Pay
    function repay(address _tokenAddress, uint256 _amount)
        external
        payable
        override
        nonReentrant
    {
        require(
            deedInfo[msg.sender].isValid ||
                ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory())
                    .isDeed(msg.sender),
            "Coindeed: Only deed can borrow from pool"
        );
        require(
            deedInfo[msg.sender].totalBorrow > 0,
            "Coindeed: This deed doesn't have any loan from pool"
        );
        PoolInfo storage pool = poolInfo[_tokenAddress];
        require(pool.isCreated, "Coindeed: this token is not supported");
        DeedInfo storage deed = deedInfo[msg.sender];
        // Re-caculate the accure interest
        uint256 error = accrueInterest(pool, _tokenAddress);
        require(
            error == uint256(Error.NO_ERROR),
            "Coindeed: accrue interest calculation failed"
        );
        // Verify market's block number equals current block number
        require(
            pool.accrualBlockNumber == getBlockNumber(),
            "Coindeed: market not fresh"
        );
        // calculate new borrow balance (add fee)
        (MathError err, uint256 result) = borrowBalanceStoredInternal(
            msg.sender,
            pool.borrowIndex
        );
        require(
            err == MathError.NO_ERROR,
            "Coindeed: borrowBalanceStoredInternal failed"
        );

        require(result >= _amount, "Coindeed: exceed borrow amount");

        if (_tokenAddress == address(0)) {
            require(msg.value == _amount, "The amount of ETH is not exact");
        } else {
            IERC20(_tokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                _amount
            );
        }
        if (_amount >= deed.borrow) {
            deed.borrow = 0;
        } else {
            deed.borrow = deed.borrow.sub(_amount);
        }

        deed.totalBorrow = result.sub(_amount);
        pool.totalBorrows = pool.totalBorrows.sub(_amount);
        deed.borrowIndex = pool.borrowIndex;
        emit Repay(msg.sender, _amount);
    }

    // Withdraw tokens from STAKING.
    function withdraw(address _tokenAddress, uint256 _amount)
        external
        override
    {
        UserAssetInfo storage userAsset = userAssetInfo[msg.sender][
            _tokenAddress
        ];
        PoolInfo storage pool = poolInfo[_tokenAddress];

        require(
            userAsset.amount >= _amount,
            "Coindeed: not enough to withdraw"
        );
        updatePool(_tokenAddress);
        uint256 error = accrueInterest(pool, _tokenAddress);
        require(
            error == uint256(Error.NO_ERROR),
            "Coindeed: accrue interest calculation failed"
        );

        uint256 pending = userAsset
            .amount
            .mul(pool.supplyIndex.sub(userAsset.supplyIndex))
            .div(10**pool.decimals)
            .mul(REWARD_FACTOR)
            .div(BASE_DENOMINATOR);
        if (pending > 0) {
            if (_tokenAddress == address(0)) {
                (bool sent, ) = msg.sender.call{value: pending}(""); // send reward ETH
                require(sent, "Coindeed: Transfer failed");
            } else {
                IERC20(_tokenAddress).safeTransfer(msg.sender, pending); //send reward token
            }
            ICoinDeedDao(coinDeedAddressesProvider.coinDeedDao()).claimDToken(
                _tokenAddress,
                msg.sender,
                pending
            );
        }

        if (_amount > 0) {
            if (_tokenAddress == address(0)) {
                userAsset.amount = userAsset.amount.sub(_amount);
                (bool sent, ) = msg.sender.call{value: _amount}(""); // send balance
                require(sent, "Coindeed: Transfer failed");
            } else {
                userAsset.amount = userAsset.amount.sub(_amount);
                IERC20(_tokenAddress).safeTransfer(msg.sender, _amount); // send balance
            }
        }

        userAsset.supplyIndex = pool.supplyIndex;
        // push event
        emit Withdraw(msg.sender, _amount);
    }

    // Return current block number
    function getBlockNumber() internal view returns (uint256) {
        return block.number;
    }

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @dev This excludes the value of the current message, if any
     * @return The quantity of underlying tokens owned by this contract
     */
    function getCashPrior(address _token) internal view returns (uint256) {
        if (_token == address(0)) {
            return address(this).balance.sub(msg.value);
        }
        return IERC20(_token).balanceOf(address(this));
    }

    function borrowBalanceStoredInternal(address account, uint256 borrowIndex)
        internal
        returns (MathError, uint256)
    {
        /* Note: we do not assert that the market is up to date */
        uint256 principalTimesIndex;
        uint256 result;
        MathError err;

        /* Get borrowBalance and borrowIndex */
        DeedInfo storage deed = deedInfo[account];

        /* If borrowBalance = 0 then borrowIndex is likely also 0.
         * Rather than failing the calculation with a division by 0, we immediately return 0 in this case.
         */
        if (deed.totalBorrow == 0) {
            deed.borrowIndex = borrowIndex;
            return (MathError.NO_ERROR, 0);
        }

        /* Calculate new borrow balance using the interest index:
         *  recentBorrowBalance = borrower.borrowBalance * market.borrowIndex / borrower.borrowIndex
         */

        (err, principalTimesIndex) = mulUInt(deed.totalBorrow, borrowIndex);
        if (err != MathError.NO_ERROR) {
            return (err, 0);
        }
        (err, result) = divUInt(principalTimesIndex, deed.borrowIndex);
        if (err != MathError.NO_ERROR) {
            return (err, 0);
        }

        return (MathError.NO_ERROR, result);
    }

    function updatePool(address _token) internal {
        PoolInfo storage pool = poolInfo[_token];
        if (getBlockNumber() <= pool.accrualBlockNumber) {
            return;
        }
        uint256 cash = getCashPrior(_token);
        uint256 totalSupply = cash.add(pool.totalBorrows);
        if (totalSupply == 0) {
            pool.accrualBlockNumber = getBlockNumber();
            return;
        }

        uint256 blockDelta = getBlockDelta(
            pool.accrualBlockNumber,
            getBlockNumber()
        );
        uint256 supplyRatePerBlock = getSupplyRate(
            cash,
            pool.totalBorrows,
            pool.totalReserves,
            RESERVE_FACTOR_MANTISSA
        ).div(blocksPerYear);

        uint256 supplyIndex = supplyRatePerBlock
            .mul(blockDelta)
            .mul(pool.supplyIndex)
            .div(1e18)
            .add(pool.supplyIndex);
        uint256 tokenAccSupply = (supplyIndex.sub(pool.supplyIndexDebt));
        uint256 dividedReward = totalSupply
            .mul(tokenAccSupply.mul(REWARD_FACTOR).div(BASE_DENOMINATOR))
            .div(10**pool.decimals); // Divide tokenReward in half
        if (dividedReward > 0 && dividedReward < cash) {
            //50% used to transfer to DAO
            if (_token == address(0)) {
                (bool sent, ) = address(coinDeedAddressesProvider.coinDeedDao())
                    .call{value: dividedReward}(""); // send ETH to contract DAO
                require(sent, "Coindeed: Transfer failed");
            } else {
                IERC20(_token).safeTransfer(
                    address(coinDeedAddressesProvider.coinDeedDao()),
                    dividedReward
                ); // send token to contract DAO
            }
            // exchange tokenReward
            // The other 50% used to convert reward from USD back to Token that lender deposit in pool
        }
        pool.supplyIndexDebt = supplyIndex;
    }

    struct AccrueInterestVars {
        uint256 blockDelta;
        uint256 simpleInterestFactor;
        uint256 simpleInteresSupplyFactor;
        uint256 interestAccumulated;
        uint256 borrowIndexNew;
        uint256 suplyIndexNew;
        uint256 totalBorrowNew;
        uint256 totalReservesNew;
    }

    function accrueInterest(PoolInfo storage pool, address _token)
        internal
        returns (uint256)
    {
        /* Remember the initial block number */
        uint256 currentBlockNumber = getBlockNumber();
        uint256 accrualBlockNumberPrior = pool.accrualBlockNumber;

        /* Short-circuit accumulating 0 interest */
        if (accrualBlockNumberPrior == currentBlockNumber) {
            return uint256(Error.NO_ERROR);
        }

        /* Read the previous values out of storage */
        uint256 cashPrior = getCashPrior(_token);
        /* Calculate the current borrow interest rate */
        uint256 borrowRatePerBlock = getBorrowRate(
            cashPrior,
            pool.totalBorrows,
            pool.totalReserves
        ).div(blocksPerYear);
        /* Calculate the current supply interest rate */
        uint256 supplyRatePerBlock = getSupplyRate(
            cashPrior,
            pool.totalBorrows,
            pool.totalReserves,
            RESERVE_FACTOR_MANTISSA
        ).div(blocksPerYear);

        AccrueInterestVars memory vars;
        /* Calculate the number of blocks elapsed since the last accrual */
        vars.blockDelta = currentBlockNumber.sub(accrualBlockNumberPrior);

        /*
         * Calculate the interest accumulated into borrows and reserves and the new index:
         *  simpleInterestFactor = borrowRatePerBlock * blockDelta
         *  interestAccumulated = simpleInterestFactor * totalBorrows
         *  totalBorrowsNew = interestAccumulated + totalBorrows
         *  totalReservesNew = interestAccumulated * reserveFactor + totalReserves
         *  borrowIndexNew = simpleInterestFactor * borrowIndex + borrowIndex
         *  simpleInteresSupplyFactor = supplyRatePerBlock * blockDelta
         *  supplyIndexNew = simpleInteresSupplyFactor * supplyIndex + supplyIndex
         */

        vars.simpleInterestFactor = borrowRatePerBlock.mul(vars.blockDelta);
        vars.interestAccumulated = vars
            .simpleInterestFactor
            .mul(pool.totalBorrows)
            .div(1e18);
        vars.simpleInteresSupplyFactor = supplyRatePerBlock.mul(
            vars.blockDelta
        );
        /////////////////////////
        // EFFECTS & INTERACTIONS
        // (No safe failures beyond this point)
        vars.totalBorrowNew = vars.interestAccumulated.add(pool.totalBorrows);
        vars.borrowIndexNew = pool.totalBorrows == 0
            ? pool.borrowIndex
            : vars.simpleInterestFactor.mul(pool.borrowIndex).div(1e18).add(
                pool.borrowIndex
            );

        vars.totalReservesNew = vars
            .interestAccumulated
            .mul(RESERVE_FACTOR_MANTISSA)
            .add(pool.totalReserves);
        vars.suplyIndexNew = vars
            .simpleInteresSupplyFactor
            .mul(pool.supplyIndex)
            .div(1e18)
            .add(pool.supplyIndex);

        /* We write the previously calculated values into storage */
        pool.accrualBlockNumber = currentBlockNumber;
        pool.borrowIndex = vars.borrowIndexNew;
        pool.totalBorrows = vars.totalBorrowNew;
        pool.supplyIndex = vars.suplyIndexNew;
        pool.totalReserves = vars.totalReservesNew;

        emit AccrueInterest(
            cashPrior,
            vars.interestAccumulated,
            vars.borrowIndexNew,
            vars.totalBorrowNew,
            vars.totalReservesNew,
            vars.suplyIndexNew
        );

        return uint256(Error.NO_ERROR);
    }

    /* function white paper */

    /**
     * @notice Calculates the utilization rate of the market: `borrows / (cash + borrows - reserves)`
     * @param cash The amount of cash in the market
     * @param borrows The amount of borrows in the market
     * @param reserves The amount of reserves in the market (currently unused)
     * @return The utilization rate as a mantissa between [0, 1e18]
     */
    function utilizationRate(
        uint256 cash,
        uint256 borrows,
        uint256 reserves
    ) public pure returns (uint256) {
        // Utilization rate is 0 when there are no borrows
        if (borrows == 0) {
            return 0;
        }

        return borrows.mul(1e18).div(cash.add(borrows).sub(reserves));
    }

    /**
     * @notice Calculates the current borrow rate per block, with the error code expected by the market
     * @param cash The amount of cash in the market
     * @param borrows The amount of borrows in the market
     * @param reserves The amount of reserves in the market
     * @return The borrow rate percentage per block as a mantissa (scaled by 1e18)
     */
    function getBorrowRate(
        uint256 cash,
        uint256 borrows,
        uint256 reserves
    ) public view returns (uint256) {
        uint256 ua = utilizationRate(cash, borrows, reserves);
        // BorrowRate = Ua*0.2 + 0.025
        return ua.mul(multiplierPerBlock).div(1e18).add(baseRatePerBlock);
    }

    /**
     * @notice Calculates the current supply rate per block
     * @param cash The amount of cash in the market
     * @param borrows The amount of borrows in the market
     * @param reserves The amount of reserves in the market
     * @param reserveFactorMantissa The current reserve factor for the market
     * @return The supply rate percentage per block as a mantissa (scaled by 1e18)
     */
    function getSupplyRate(
        uint256 cash,
        uint256 borrows,
        uint256 reserves,
        uint256 reserveFactorMantissa
    ) public view returns (uint256) {
        uint256 oneMinusReserveFactor = uint256(1e18).sub(
            reserveFactorMantissa
        );
        uint256 borrowRate = getBorrowRate(cash, borrows, reserves);
        uint256 rateToPool = borrowRate.mul(oneMinusReserveFactor).div(1e18);
        // BorrowRate = Ua*(Ua*0.2 + 0.025)
        return
            utilizationRate(cash, borrows, reserves).mul(rateToPool).div(1e18);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
