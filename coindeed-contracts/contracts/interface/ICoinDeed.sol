//SPDX-License-Identifier: Unlicense
/** @title Interface for CoinDeed
  * @author Bitus Labs
 **/
pragma solidity ^0.8.0;

interface ICoinDeed {


    enum DeedState {SETUP, READY, OPEN, CLOSED, CANCELED}

    /// @notice Class of all initial deed creation parameters.
    struct DeedParameters {
        uint256 deedSize;
        uint8 leverage;
        uint256 managementFee;
        uint256 minimumBuy;
        uint256 minimumJoin;
    }

    struct Pair {address tokenA; address tokenB;}

    /// @notice Stores all the timestamps that must be checked prior to moving through deed phases.
    struct ExecutionTime {
        uint256 recruitingEndTimestamp;
        uint256 buyTimestamp;
        uint256 sellTimestamp;
    }

    /** @notice Risk mitigation can be triggered twice. *trigger* and *secondTrigger* are the percent drops that the collateral asset
      * can drop compared to the debt asset before the position is eligible for liquidation. The first mitigation is a partial
      * liquidation, liquidating just enough assets to return the position to the *leverage*. */
    struct RiskMitigation {
        uint256 trigger;
        uint256 secondTrigger;
        uint8 leverage;
    }

    /// @notice Stores all the parameters related to brokers
    struct BrokerConfig {
        bool allowed;
    }


    /// @notice Reserve a wholesale to swap on execution time
    function reserveWholesale(uint256 wholesaleId_) external;

    /// @notice Add stake by deed manager or brokers. If brokersEnabled for the deed anyone can call this function to be a broker
    function stake(uint256 amount) external;

    /// @notice Moves the deed from setup to the ready state. Only manager can call this function.
    function ready() external;

    /// @notice Brokers can withdraw their stake
    function withdrawStake() external;

    /// @notice Edit Broker Config
    function editBrokerConfig(BrokerConfig memory brokerConfig_) external;

    /// @notice Edit RiskMitigation
    function editRiskMitigation(RiskMitigation memory riskMitigation_) external;

    /// @notice Edit ExecutionTime
    function editExecutionTime(ExecutionTime memory executionTime_) external;

    /// @notice Edit DeedInfo
    function editBasicInfo(uint256 deedSize, uint8 leverage, uint256 managementFee, uint256 minimumBuy, uint256 minimumJoin) external;

    /// @notice Edit SwapType
    function editSwapType(uint256 saleId_) external;

    /// @notice Returns the deed manager
    function manager() external view returns (address);

    /// @notice Returns the total fee
    function totalFee() external view returns (uint256);

    /// @notice Returns the total purchased token
    function totalPurchasedToken() external view returns (uint256);

    /// @notice Returns the total supply
    function totalSupply() external view returns (uint256);

    /// @notice Returns the total stake
    function totalStake() external view returns (uint256);

    /// @notice Returns the total pending token 
    function pendingToken() external view returns (uint256);

    /// @notice Returns the wholesale ID assigned to this deed
    function wholesaleId() external view returns (uint256);

    /// @notice Returns whether risk mitigation has been triggered
    function riskMitigationTriggered() external view returns (bool);

    function getCoinDeedAddressesProvider() external view returns (address);

    function deedParameters() external view returns (
      uint256 deedSize,
      uint8 leverage,
      uint256 managementFee,
      uint256 minimumBuy,
      uint256 minimumJoin
    );

    function executionTime() external view returns (
      uint256 recruitingEndTimestamp,
      uint256 buyTimestamp,
      uint256 sellTimestamp
    );

    function riskMitigation() external view returns (
      uint256 trigger,
      uint256 secondTrigger,
      uint8 leverage
    );

    function brokerConfig() external view returns (bool allowed);

    function state() external view returns (DeedState);

    /// @notice Edit all deed parameters. Use previous parameters if unchanged.
    function edit(DeedParameters memory deedParameters_,
        ExecutionTime memory executionTime_,
        RiskMitigation memory riskMitigation_,
        BrokerConfig memory brokerConfig_,
        uint256 saleId_) external;

    /** @notice Initial swap for the deed to buy the tokens
      * After validating the deed's eligibility to move to the OPEN phase,
      * the management fee is subtracted, and then the deed contract is loaned
      * enough of the buyin token to bring it to the specified leverage.
      * The deed then swaps the tokens into the collateral token and deposits
      * it into the lending pool to earn additional yield. The deed is now
      * in the open state.
      * @dev There is no economic incentive built in to call this function.
      * No safety check for swapping assets */
    function buy(uint256 minAmountOut) external;

    /** @notice Sells the entire deed's collateral
      * After validating that the sell execution time has passed,
      * withdraws all collateral from the lending pool, sells it for the debt token,
      * and repays the loan in full. This closes the deed.
      * @dev There is no economic incentive built in to call this function.
      * No safety check for swapping assets */
    function sell(uint256 minAmountOut) external;

    /// @notice Cancels deed if it is in the setup or ready phase
    function cancel() external;

    /// @notice Buyers buys into the deed. Amount is ignored for ETH.
    function buyIn(uint256 amount) external payable;

    /// @notice Buyers claims their balance if the deed is completed.
    function claimBalance() external;

    /** @notice Executes risk mitigation
      * Validates that the position is eligible for liquidation,
      * and then liquidates the appropriate amount of collateral depending on
      * whether risk mitigation has already been triggered.
      * If this is the second risk mitigation, closes the deed.
      * Allocates a liquidation bonus from the collateral to the caller. */
    function executeRiskMitigation() external payable;

    /** @notice Message sender exits the deed
      * When the deed is open, this withdraws the buyer's share of collateral
      * and sells the entire amount. From this amount, repay the buyer's share of the debt
      * and return the rest to sender */
    function exitDeed(bool _payoff) payable external;
}