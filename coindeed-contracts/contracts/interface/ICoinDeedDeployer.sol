//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ICoinDeed.sol";

interface ICoinDeedDeployer {

    function deploy(
        address manager,
        address coinDeedAddressesProvider,
        uint256 stakingAmount,
        ICoinDeed.Pair memory pair,
        ICoinDeed.DeedParameters memory deedParameters,
        ICoinDeed.ExecutionTime memory executionTime,
        ICoinDeed.RiskMitigation memory riskMitigation,
        ICoinDeed.BrokerConfig memory brokerConfig
    ) external returns (address);

}
