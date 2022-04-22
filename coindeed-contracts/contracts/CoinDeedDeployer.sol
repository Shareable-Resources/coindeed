//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interface/ICoinDeedDeployer.sol";
import "./CoinDeed.sol";

contract CoinDeedDeployer is ICoinDeedDeployer {
    function deploy(
        address manager,
        address coinDeedAddressesProvider,
        uint256 stakingAmount,
        ICoinDeed.Pair memory pair,
        ICoinDeed.DeedParameters memory deedParameters,
        ICoinDeed.ExecutionTime memory executionTime,
        ICoinDeed.RiskMitigation memory riskMitigation,
        ICoinDeed.BrokerConfig memory brokerConfig
    ) external override returns (address) {
        CoinDeed coinDeed = new CoinDeed(
            manager,
            coinDeedAddressesProvider,
            stakingAmount,
            pair,
            deedParameters,
            executionTime,
            riskMitigation,
            brokerConfig
        );
        return address(coinDeed);
    }
}