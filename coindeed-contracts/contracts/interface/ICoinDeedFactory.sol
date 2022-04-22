//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ICoinDeed.sol";

interface ICoinDeedFactory {


    event DeedCreated(
        uint256 indexed id,
        address indexed deedAddress,
        address indexed manager,
        uint8 leverage,
        uint256 wholesaleId,
        uint256 recruitingEndTimestamp,
        uint256 buyTimestamp,
        uint256 sellTimestamp
    );

    event StakeAdded(
        address indexed coinDeed,
        address indexed broker,
        uint256 indexed amount
    );

    event StateChanged(
        address indexed coinDeed,
        ICoinDeed.DeedState state
    );

    event DeedCanceled(
        address indexed coinDeed,
        address indexed deedAddress
    );

    event SwapExecuted(
        address indexed coinDeed,
        uint256 indexed tokenBought,
        int256 indexed oracleAnswer
    );

    event BuyIn(
        address indexed coinDeed,
        address indexed buyer,
        uint256 indexed amount
    );

    event ExitDeed(
        address indexed coinDeed,
        address indexed buyer,
        uint256 indexed amount
    );

    event PayOff(
        address indexed coinDeed,
        address indexed buyer,
        uint256 indexed amount
    );

    event LeverageChanged(
        address indexed coinDeed,
        address indexed salePercentage
    );

    event BrokersEnabled(
        address indexed coinDeed
    );

    event RiskMitigationTriggered(
        address indexed coinDeed,
        uint256 collateralAmount,
        uint256 debtAmount,
        bool level
    );

    event SendToVault(
        address indexed coinDeed,
        uint256 indexed amount
    );

    event CurrentSupplyValue(
        address indexed coinDeed,
        uint256 indexed amount
    );

    /**
    * DeedManager calls to create deed contract
    */
    function createDeed(ICoinDeed.Pair calldata pair,
        uint256 stakingAmount,
        uint256 wholesaleId,
        ICoinDeed.DeedParameters calldata deedParameters,
        ICoinDeed.ExecutionTime calldata executionTime,
        ICoinDeed.RiskMitigation calldata riskMitigation,
        ICoinDeed.BrokerConfig calldata brokerConfig) external returns (address);

    function setMaxLeverage(uint8 _maxLeverage) external;

    function setStakingMultiplier(uint256 _stakingMultiplier) external;

    function permitToken(address token) external;

    function unpermitToken(address token) external;

    // All the important addresses
    function getCoinDeedAddressesProvider() external view returns (address);

    // The maximum leverage that any deed can have
    function maxLeverage() external view returns (uint8);

    // The fee the platform takes from all buyins before the swap
    function platformFee() external view returns (uint256);

    // The amount of stake needed per dollar value of the buyins
    function stakingMultiplier() external view returns (uint256);

    // The maximum proportion relative price can drop before a position becomes insolvent is 1/leverage.
    // The maximum price drop a deed can list risk mitigation with is maxPriceDrop/leverage
    function maxPriceDrop() external view returns (uint256);

    function deedCount() external view returns (uint256);

    function coinDeedAddresses(uint256 _id) external view returns (address);

    function liquidationBonus() external view returns (uint256);

    function setPlatformFee(uint256 _platformFee) external;

    function setMaxPriceDrop(uint256 _maxPriceDrop) external;

    function setLiquidationBonus(uint256 _liquidationBonus) external;

    function isDeed(address deedAddress) external view returns (bool);

    function emitStakeAdded(
        address broker,
        uint256 amount
    ) external;

    function emitStateChanged(
        ICoinDeed.DeedState state
    ) external;

    function emitDeedCanceled(
        address deedAddress
    ) external;

    function emitSwapExecuted(
        uint256 tokenBought,
        int256 oracleAnswer
    ) external;

    function emitBuyIn(
        address buyer,
        uint256 amount
    ) external;

    function emitExitDeed(
        address buyer,
        uint256 amount
    ) external;

    function emitRiskMitigationTriggered(
        uint256 collateralAmount,
        uint256 debtAmount,
        bool level
    ) external;

    function emitPayOff(
        address buyer,
        uint256 amount
    ) external;

    function emitLeverageChanged(
        address salePercentage
    ) external;

    function emitBrokersEnabled() external;

    function emitSendToVault(uint256 amount) external;

    function emitCurrentSupplyValue(uint256 amount) external;
}