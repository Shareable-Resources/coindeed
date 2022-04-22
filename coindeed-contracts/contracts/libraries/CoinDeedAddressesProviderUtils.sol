// SPDX-License-Identifier: Unlicense

/** This library exists mostly as a space saving measure for now.
  * The logic probably needs more separating than just this*/

//TODO: Check if it would be better to just use storage rather than memory when retrieving data from the coindeed
//TODO: MAKE SURE TO REVIEW THE CODE FOR CHECK EFFECT INTERACTIONS ORDERING
//TODO: Move all functions the require _repay here

pragma solidity >=0.8.0;

import "../interface/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "../interface/IToken.sol";
import "../interface/ICoinDeed.sol";
import "../interface/ICoinDeedFactory.sol";
import "../interface/ICoinDeedAddressesProvider.sol";
import "../interface/ICoinDeedDao.sol";
import "../interface/ILendingPool.sol";
import "../interface/IWholesaleFactory.sol";

library CoinDeedAddressesProviderUtils {
    using SafeERC20 for IERC20;

    uint256 public constant BASE_DENOMINATOR = 10_000;
    // TODO
    address internal constant USDT_ADDRESS = 0xd35d2e839d888d1cDBAdef7dE118b87DfefeD20e;

    function tokenRatio(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        address tokenA,
        uint256 tokenAAmount,
        address tokenB
    ) public view returns (uint256 tokenBAmount){
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(coinDeedAddressesProvider.feedRegistry());
        uint256 answerA = uint256(feedRegistry.latestAnswer(tokenA, Denominations.USD));
        uint256 answerB = uint256(feedRegistry.latestAnswer(tokenB, Denominations.USD));
        uint8 decimalsA = feedRegistry.decimals(tokenA, Denominations.USD) + 18; //Case token A is ETH
        if(tokenA != address(0)) {
            decimalsA = feedRegistry.decimals(tokenA, Denominations.USD) + IERC20MetadataUpgradeable(tokenA).decimals();
        }     
        uint8 decimalsB = feedRegistry.decimals(tokenB, Denominations.USD) + 18; //Case token B is ETH
        if(tokenB != address(0)) {
            decimalsB = feedRegistry.decimals(tokenB, Denominations.USD) + IERC20MetadataUpgradeable(tokenB).decimals();
        }     
        require(answerA > 0 && answerB > 0, "Invalid oracle answer");
        //Rearrangement of tokenAAmount * answerA/decimalsA / answerB/decimalsB
        return tokenAAmount * answerA * (10 ** decimalsB)/ (10 ** decimalsA) / answerB;
    }

    function readyCheck(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        address tokenA,
        uint256 totalStake,
        uint256 stakingMultiplier,
        ICoinDeed.DeedParameters memory deedParameters
    ) external view returns (bool){
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(coinDeedAddressesProvider.feedRegistry());
        uint256 tokenAPrice = uint256(feedRegistry.latestAnswer(tokenA, Denominations.USD));
        // Get token A feed registry decimals here
        uint8 tokenADecimals = feedRegistry.decimals(tokenA, Denominations.USD);
        uint8 decimalsToAdd = 0; //Number of decimals to add to convert to dtoken decimals
        if(tokenA != address(0)) {
            decimalsToAdd = 18 - IERC20MetadataUpgradeable(tokenA).decimals();
        }
        require(tokenAPrice > 0, "Invalid oracle answer");
        if (
            // Left side represents the amount of deedToken needing to be staked
            // Right side represents the dollar value of the deed when full times the staking factor
            totalStake >=
            deedParameters.deedSize / deedParameters.leverage * // Proportion of deed size that is equity
            tokenAPrice / (10 ** tokenADecimals) * // Oracle Price in USD of down payment token
            (10 ** (decimalsToAdd)) * //Add decimals to convert to dtoken decimals
            stakingMultiplier / 1e18 // Staking multiplier
        )
        {
            return true;
        }
        return false;
    }

    // Token B is the collateral token
    // Token A is the debt token
    function checkRiskMitigationAndGetSellAmount(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        ICoinDeed.RiskMitigation memory riskMitigation,
        bool riskMitigationTriggered
    ) external view returns (uint256 sellAmount, uint256 buyAmount) {
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        uint256 totalDeposit = lendingPool.totalDepositBalance(pair.tokenB, address(this));
        uint256 totalBorrow = lendingPool.totalBorrowBalance(pair.tokenA, address(this));
        // Debt value expressed in collateral token units
        uint256 totalBorrowInDepositToken = tokenRatio(
            coinDeedAddressesProvider,
            pair.tokenA,
            totalBorrow,
            pair.tokenB);

        require(checkRiskMitigation(
            riskMitigation,
            totalDeposit,
            totalBorrowInDepositToken,
            riskMitigationTriggered
        ), "Risk Mitigation isnt required.");

        /** To figure out how much to sell, we use the following formula:
          * a = collateral tokens
          * d = debt token value expressed in collateral token units
          * (e.g. for ETH collateral and BTC debt, how much ETH the BTC debt is worth)
          * s = amount of collateral tokens to sell
          * l_1 = current leverage = a/(a - d)
          * l_2 = risk mitigation target leverage = (a - s)/(a - d)
          * e = equity value expressed in collateral token units = a - d
          * From here we derive s = [a/e - l_2] * e
          *
          * If risk mitigation has already been triggered, sell the entire deed
        **/
        uint256 equityInDepositToken;
        if(totalDeposit > totalBorrowInDepositToken) {
            equityInDepositToken = totalDeposit - totalBorrowInDepositToken;
            if (!riskMitigationTriggered) {
                sellAmount = ((BASE_DENOMINATOR * totalDeposit / equityInDepositToken) -
                (BASE_DENOMINATOR * riskMitigation.leverage)) *
                equityInDepositToken / BASE_DENOMINATOR;
            }
            else {
                sellAmount = totalDeposit;
            }
        }
        //Logic taken if insolvent, don't let it get to this point
        else {
            sellAmount = totalDeposit;
        }
        buyAmount = tokenRatio(
            coinDeedAddressesProvider,
            pair.tokenB,
            sellAmount,
            pair.tokenA);

        return (sellAmount, buyAmount);
    }

    /** With leverage L, the ratio of total value of assets / debt is L/L-1.
      * To track an X% price drop, we set the mitigation threshold to (1-X) * L/L-1.
      * For example, if the initial leverage is 3 and we track a price drop of 5%,
      * risk mitigation can be triggered when the ratio of assets to debt falls
      * below 0.95 * 3/2 = 0.1485. */
    function checkRiskMitigation(
        ICoinDeed.RiskMitigation memory riskMitigation,
        uint256 totalDeposit,
        uint256 totalBorrowInDepositToken,
        bool riskMitigationTriggered
    ) internal pure returns (bool) {
        uint256 trigger = riskMitigationTriggered ?
            riskMitigation.secondTrigger :
            riskMitigation.trigger;
        uint256 mitigationThreshold =
            (BASE_DENOMINATOR - trigger) *
            riskMitigation.leverage /
            (riskMitigation.leverage - 1);
        uint256 priceRatio =
            totalDeposit *
            BASE_DENOMINATOR /
            totalBorrowInDepositToken;
        return priceRatio < mitigationThreshold;
    }

    // Validates that the tokens have oracles
    function validateTokens(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair
    ) external view returns (bool) {
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(coinDeedAddressesProvider.feedRegistry());
        return(
            feedRegistry.latestAnswer(pair.tokenA, Denominations.USD) > 0 &&
            feedRegistry.latestAnswer(pair.tokenB, Denominations.USD) > 0
        );
    }

    // Validates risk parameters. This is for setting parameters, NOT for actual risk mitigation
    function validateRiskMitigation(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.RiskMitigation memory riskMitigation_,
        uint8 leverage
    ) external view {
        ICoinDeedFactory coinDeedFactory = ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory());
        require(riskMitigation_.trigger <= coinDeedFactory.maxPriceDrop() / leverage, "BAD_TRIG");
        require(riskMitigation_.leverage <= coinDeedFactory.maxLeverage(), "BAD_LEVERAGE");
        require(
            (riskMitigation_.secondTrigger <= coinDeedFactory.maxPriceDrop() / leverage) &&
            (riskMitigation_.secondTrigger >= riskMitigation_.trigger),
            "BAD_TRIG"
        );
    }

    // Validates execution times
    function validateExecutionTime(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.ExecutionTime memory executionTime_,
        uint256 wholesaleId
    ) external {
        require(executionTime_.recruitingEndTimestamp > block.timestamp, "BAD_END");
        require(executionTime_.recruitingEndTimestamp < executionTime_.buyTimestamp, "BAD_BUY");
        require(executionTime_.buyTimestamp < executionTime_.sellTimestamp, "BAD_SELL");

        if (wholesaleId != 0) {
            IWholesaleFactory wholesaleFactory = IWholesaleFactory(coinDeedAddressesProvider.wholesaleFactory());
            IWholesaleFactory.Wholesale memory wholesale = wholesaleFactory.getWholesale(wholesaleId);
            require(wholesale.deadline > executionTime_.buyTimestamp, "BAD_BUY_TIME");
        }
    }

    /** Helps the coindeed buy function. Mostly a contract space saving measure
      * Returns values that are needed to modify the coindeed contract's state
      * Interactions with other contracts are done here instead of in the coindeed */
    function buy(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        ICoinDeed.ExecutionTime memory executionTime,
        ICoinDeed.DeedParameters memory deedParameters,
        uint256 totalSupply,
        uint256 wholesaleId,
        uint256 minAmountOut
    ) external returns (uint256 totalManagementFee, uint256 totalPurchasedToken) {
        totalManagementFee = _validateBuyAndReturnManagementFee(
            pair,
            executionTime,
            deedParameters,
            totalSupply
        );
       totalPurchasedToken = _buyWithLeverageAndDeposit(
            coinDeedAddressesProvider,
            pair,
            deedParameters,
            totalSupply - totalManagementFee,
            wholesaleId,
            minAmountOut
        );
        return (totalManagementFee, totalPurchasedToken);
    }

    /** Helps the buy function. Exists mostly to avoid stack too deep errors
      * Returns the total management fee. */
    function _validateBuyAndReturnManagementFee(
        ICoinDeed.Pair memory pair,
        ICoinDeed.ExecutionTime memory executionTime,
        ICoinDeed.DeedParameters memory deedParameters,
        uint256 totalSupply
    ) internal view returns (uint256 totalManagementFee) {
        // Can trigger buy early if deed is full
        require(totalSupply >= deedParameters.deedSize * deedParameters.minimumBuy / BASE_DENOMINATOR / deedParameters.leverage, "MIN_BUY");
        if (totalSupply < deedParameters.deedSize / deedParameters.leverage) {
            require(executionTime.buyTimestamp <= block.timestamp, "BAD_BUY_TIME");
        }

        totalManagementFee = totalSupply * deedParameters.managementFee / BASE_DENOMINATOR;
        uint256 remainder = totalSupply - totalManagementFee;

        if (pair.tokenA == address(0x00)) {
            require(remainder <= address(this).balance, "LOW_ETHER");
        } else {
            require(remainder <= IERC20(pair.tokenA).balanceOf(address(this)), "LOW_TOKENS");
        }
        return totalManagementFee;
    }

    /** Helps the buy function after management fees are deducted.
      * Borrows (leverage - 1) * buyIn from the lending pool
      * Sells leverage * buyIn of tokenA with the specified wholesale first,
      * and swaps the rest on uniswap. Deposits the tokens received into the lending pool.
      * @dev Relies on the lending pool to bubble an error if there's no liquidity. */
    function _buyWithLeverageAndDeposit(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        ICoinDeed.DeedParameters memory deedParameters,
        uint256 buyIn,
        uint256 wholesaleId,
        uint256 minAmountOut
    ) internal returns (uint256 amountReceived) {
        uint256 totalLoan = buyIn * (deedParameters.leverage - 1);
        // Borrow the token A if leverage > 1
        if (totalLoan > 0) {
            ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
            lendingPool.borrow(pair.tokenA, totalLoan);
        }
        // Try to sell through a wholesale first
        uint256 amountSent = _wholesaleSwap(
            coinDeedAddressesProvider,
            pair,
            wholesaleId,
            buyIn * deedParameters.leverage);
        amountReceived = pair.tokenB == address(0) ? address(this).balance : IERC20(pair.tokenB).balanceOf(address(this));
        // Sell the rest through a dex
        if (amountSent < buyIn * deedParameters.leverage) {
            amountReceived += _dexSwap(
                coinDeedAddressesProvider, 
                pair.tokenA, 
                pair.tokenB, 
                buyIn * deedParameters.leverage - amountSent,
                minAmountOut);
        }
        // Deposit the tokens received
        _deposit(coinDeedAddressesProvider, pair.tokenB, amountReceived);
        ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitSwapExecuted(
            amountReceived, 
            FeedRegistryInterface(coinDeedAddressesProvider.feedRegistry()).latestAnswer(
                pair.tokenB,
                Denominations.USD
            )
        );
        return amountReceived;
    }

    /** Withdraw and sell the entire deposit balance.
      * Repay the smaller between the total debt or the total received from selling.
      * Specify 0 in minAmountOut to default to 2.5% slippage using chainlink oracles */
    function sell(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        ICoinDeed.ExecutionTime memory executionTime,
        uint256 minAmountOut,
        uint256 totalSupply,
        uint256 pendingToken
    ) external {
        if(totalSupply != 0) {
          require(block.timestamp >= executionTime.sellTimestamp, "NOT_TIME");
        }
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());

        (uint256 amountToSwap, uint256 amountToWithdraw) = _getTotalTokenB(address(coinDeedAddressesProvider), pair.tokenB);
        uint256 totalBorrow = lendingPool.totalBorrowBalance(pair.tokenA, address(this));

        lendingPool.withdraw(pair.tokenB, amountToWithdraw);
        if(pendingToken > 0) {
            amountToSwap = amountToSwap + pendingToken;
        }

        uint256 amountReceived = _dexSwap(
            coinDeedAddressesProvider,
            pair.tokenB,
            pair.tokenA,
            amountToSwap,
            minAmountOut);

        _repay(
            coinDeedAddressesProvider,
            pair.tokenA,
            totalBorrow < amountReceived ? totalBorrow : amountReceived
        );
    }

    /** Validation should already be done.
      * @dev UPDATE THE STAKES IN THE DEED CONTRACT BEFORE THIS.
      * Google 'check effect interactions' for more info */
    function withdrawStake(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        ICoinDeed.DeedState state,
        uint256 stake,
        uint256 totalStake,
        uint256 totalFee
    ) external
    {
        IToken deedToken = IToken(coinDeedAddressesProvider.deedToken());
        ICoinDeedDao coinDeedDao = ICoinDeedDao(coinDeedAddressesProvider.coinDeedDao());
        // There's only a management fee if the deed passes through all the phases
        uint256 managementFeeConverted;
        if (state == ICoinDeed.DeedState.CLOSED) {
            // The math looks a little weird because I want to avoid overflow and rounding to zero.
            // The intended math is totalManagementFee = totalFee * (stake/totalStake)
            uint256 totalManagementFee = totalFee * (BASE_DENOMINATOR * stake / totalStake) / BASE_DENOMINATOR ;
            uint256 amount;
            if (pair.tokenA == address(0x00)) {
                amount = coinDeedDao.claimCoinDeedManagementFee{value: totalManagementFee}(pair.tokenA, totalManagementFee);
            } else {
                if (pair.tokenA == USDT_ADDRESS) {
                    IERC20(pair.tokenA).safeApprove(address(coinDeedDao), 0);
                }
                IERC20(pair.tokenA).safeApprove(address(coinDeedDao), totalManagementFee);
                amount = coinDeedDao.claimCoinDeedManagementFee(pair.tokenA, totalManagementFee);
            }
            // Take the platform cut
            uint256 platformFee = amount * ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).platformFee() / BASE_DENOMINATOR;
            managementFeeConverted = amount - platformFee;
            deedToken.transfer(coinDeedAddressesProvider.treasury(), platformFee);
        }
        // Give their stakes
        deedToken.transfer(msg.sender, stake + managementFeeConverted);
    }

    /** User exits the deed.
      * Withdraw the user's share of the total deposit of the deed
      * Swap the user's collateral for the debt token
      * Repay the user's share of the total borrow of the deed
      * Transfer the rest to sender*/
    function exitDeed(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        uint256 buyIn,
        uint256 totalSupply,
        uint256 pendingToken,
        bool payOff
    ) external {
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        (, uint256 depositAmount) = _getTotalTokenB(address(coinDeedAddressesProvider), pair.tokenB);
        uint256 interestEarned = pendingToken * buyIn / totalSupply;
        uint256 actualWithdraw = depositAmount * buyIn / totalSupply;
        uint256 exitAmount = actualWithdraw + interestEarned;
        if (actualWithdraw > 0) {
            lendingPool.withdraw(pair.tokenB, actualWithdraw);
        }

        uint256 userBorrow = lendingPool.totalBorrowBalance(
            pair.tokenA, address(this)
        ) * buyIn / totalSupply;

        if (payOff) {
            if (userBorrow > 0) {
                if (pair.tokenA == address(0x00)) {
                    require(msg.value >= userBorrow, "BAD_REPAY");
                    if (msg.value > userBorrow) {
                        (bool sent, ) = msg.sender.call{value: msg.value - userBorrow}("");
                        require(sent, "FAILED_ETH_TRANSFER");
                    } //Transfer ETH back to sender if the value exceed borrow amount
                } else {
                    IERC20(pair.tokenA).safeTransferFrom(msg.sender, address(this), userBorrow);
                }
                _repay(
                    coinDeedAddressesProvider,
                    pair.tokenA,
                    userBorrow
                );
            }

            IERC20 token = IERC20(pair.tokenB);
            token.safeTransfer(msg.sender, exitAmount);
            ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitPayOff(msg.sender, exitAmount);
        } else {
            uint256 amountReceived = _dexSwap(
                coinDeedAddressesProvider,
                pair.tokenB,
                pair.tokenA,
                exitAmount,
                0
            );

            // Logic to take if solvent
            if (amountReceived > userBorrow) {
                _repay(
                    coinDeedAddressesProvider,
                    pair.tokenA,
                    userBorrow
                );
                if (pair.tokenA == address(0x00)) {
                    payable(msg.sender).transfer(amountReceived - userBorrow);
                } else {
                    IERC20 token = IERC20(pair.tokenA);
                    token.safeTransfer(msg.sender, amountReceived - userBorrow);
                }
            }
            /** Logic to take if insolvent
            * There is no incentive to call this function
            * if the position is insolvent. Don't let it get to this point.*/
            else {
                _repay(
                    coinDeedAddressesProvider,
                    pair.tokenA,
                    amountReceived
                );
            }
            ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory()).emitExitDeed(msg.sender, exitAmount);
        }
    }

    /** Transfer all remaining dtoken in deed after deed complete
      * This function should only be called after all manager/broker have withdraw their stake out of the deed*/
    function sendToVault(ICoinDeedAddressesProvider coinDeedAddressesProvider, uint256 amount) external {
        IToken deedToken = IToken(coinDeedAddressesProvider.deedToken());
        if (amount > 0) {
                deedToken.transfer(coinDeedAddressesProvider.vault(), amount);
        }
    }

    /** Uses the *wholesaleId* to sell the *amount* of tokens requested by the wholesale
      * Operates under the assumption that the wholesale has the right tokens for the deed*/
    function _wholesaleSwap(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        ICoinDeed.Pair memory pair,
        uint256 wholesaleId,
        uint256 amount
    ) internal returns (uint256 amountIn) {
        IWholesaleFactory.Wholesale memory wholesale;
        if (wholesaleId != 0) {
            IWholesaleFactory wholesaleFactory = IWholesaleFactory(coinDeedAddressesProvider.wholesaleFactory());
            wholesale = wholesaleFactory.getWholesale(wholesaleId);

            if (amount <= wholesale.requestedAmount) {
                amountIn = amount;
            } else {
                amountIn = wholesale.requestedAmount;
            }

            if (pair.tokenA == address(0x00)) {
                wholesaleFactory.executeWholesale{value : amountIn}(wholesaleId, amountIn);
            } else {
                IERC20(pair.tokenA).safeApprove(address(wholesaleFactory), amountIn);
                wholesaleFactory.executeWholesale(wholesaleId, amountIn);
            }
        }
    }

    /** Swaps on uniswap.
      * Use minAmountOut to control for frontrunning. If provided 0,
      * will revert if amount received is less than 97.5% less than oracle price*/
    function _dexSwap(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal returns (uint256 amountOut) {
        uint256 tokenOutTarget = tokenRatio(
            coinDeedAddressesProvider,
            tokenIn,
            amountIn,
            tokenOut);
        if(minAmountOut == 0) {
            minAmountOut = tokenOutTarget * 9750 / BASE_DENOMINATOR;
        }
        /* TODO RE-ENABLE THIS BLOCK WHEN TESTING IS MORE MATURE.
         * It's too cumbersome in a testing environment to maintain prices for test tokens
        else {
            require(minAmountOut > tokenOutTarget * 9500 / BASE_DENOMINATOR, "UNSAFE_MIN_AMOUNT_OUT");
        }*/
        if (amountIn > 0) {
            if (tokenIn == address(0x00)) {
                return _swapEthToToken(coinDeedAddressesProvider, amountIn, tokenOut, minAmountOut);
            } else if (tokenOut == address(0x00)){
                return _swapTokenToEth(coinDeedAddressesProvider, amountIn, tokenIn, minAmountOut);
            } else {
                return _swapTokenToToken(coinDeedAddressesProvider, tokenIn, amountIn, tokenOut, minAmountOut);
            }
        }
        return 0;
    }

    function _swapTokenToToken(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        address token1Address,
        uint256 amount,
        address token2Address,
        uint256 minAmountOut
    ) internal returns (uint256 amountReceived){
        IUniswapV2Router01 uniswapRouter1 = IUniswapV2Router01(coinDeedAddressesProvider.swapRouter());
        IERC20 token1 = IERC20(token1Address);
        if (address(token1) == USDT_ADDRESS) {
            token1.safeApprove(address(uniswapRouter1), 0);
        }
        token1.safeApprove(address(uniswapRouter1), amount);
        address[] memory path = new address[](2);
        path[0] = token1Address;
        path[1] = token2Address;

        uint[] memory amounts = uniswapRouter1.swapExactTokensForTokens(amount, minAmountOut, path, address(this), block.timestamp + 15);
        return amounts[1];
    }

    function _swapEthToToken(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        uint256 amount,
        address token,
        uint256 minAmountOut
    ) internal returns (uint256 amountReceived){
        IUniswapV2Router01 uniswapRouter1 = IUniswapV2Router01(coinDeedAddressesProvider.swapRouter());
        address[] memory path = new address[](2);
        path[0] = uniswapRouter1.WETH();
        path[1] = address(token);

        uint[] memory amounts = uniswapRouter1.swapExactETHForTokens{value : amount}(minAmountOut, path, address(this), block.timestamp + 15);
        return amounts[1];
    }

    function _swapTokenToEth(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        uint256 amount,
        address tokenAddress,
        uint256 minAmountOut
    ) internal returns (uint256 amountReceived){
        IUniswapV2Router01 uniswapRouter1 = IUniswapV2Router01(coinDeedAddressesProvider.swapRouter());
        address[] memory path = new address[](2);
        path[0] = address(tokenAddress);
        path[1] = uniswapRouter1.WETH();

        IERC20 token = IERC20(tokenAddress);
        if (address(token) == USDT_ADDRESS) {
            token.safeApprove(address(uniswapRouter1), 0);
        }
        token.safeApprove(address(uniswapRouter1), amount);

        uint[] memory amounts = uniswapRouter1.swapExactTokensForETH(amount, minAmountOut, path, address(this), block.timestamp + 15);
        return amounts[1];
    }

    function _repay(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        address tokenAddress,
        uint amount
    ) internal {
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        if (amount > 0) {
            if (tokenAddress == address(0x00)) {
                lendingPool.repay{value : amount}(tokenAddress, amount);
            } else {
                if (tokenAddress == USDT_ADDRESS) {
                    IERC20(tokenAddress).safeApprove(address(lendingPool), 0);
                }
                IERC20(tokenAddress).safeApprove(address(lendingPool), amount);
                lendingPool.repay(tokenAddress, amount);
            }
        }
    }

    function _deposit(
        ICoinDeedAddressesProvider coinDeedAddressesProvider,
        address tokenAddress,
        uint256 amount
    ) internal {
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        if (lendingPool.poolActive(tokenAddress)) {
            if (tokenAddress == address(0x00)) {
                lendingPool.deposit{value : amount}(tokenAddress, amount);
            } else {
                IERC20(tokenAddress).safeApprove(address(lendingPool), amount);
                lendingPool.deposit(tokenAddress, amount);
            }
        }
    }

    function _getTotalTokenB(address addressProvider, address tokenB) internal view returns (uint256 returnAmount, uint256 depositAmount) {
        ICoinDeedAddressesProvider coinDeedAddressesProvider = ICoinDeedAddressesProvider(addressProvider);
        ILendingPool lendingPool = ILendingPool(coinDeedAddressesProvider.lendingPool());
        if (lendingPool.poolActive(tokenB)) {
            returnAmount = lendingPool.totalDepositBalance(tokenB, address(this));
            depositAmount = lendingPool.depositAmount(tokenB, address(this));
        } else {
            returnAmount = IERC20(tokenB).balanceOf(address(this));
        }
    }
}