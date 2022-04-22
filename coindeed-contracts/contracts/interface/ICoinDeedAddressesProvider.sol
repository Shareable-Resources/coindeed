// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICoinDeedAddressesProvider {
    event FeedRegistryChanged(address feedRegistry);
    event SwapRouterChanged(address router);
    event LendingPoolChanged(address lendingPool);
    event CoinDeedFactoryChanged(address coinDeedFactory);
    event WholesaleFactoryChanged(address wholesaleFactory);
    event DeedTokenChanged(address deedToken);
    event CoinDeedDeployerChanged(address coinDeedDeployer);
    event TreasuryChanged(address treasury);
    event CoinDeedDaoChanged(address coinDeedDao);
    event VaultChanged(address vault);

    function feedRegistry() external view returns (address);
    function swapRouter() external view returns (address);
    function lendingPool() external view returns (address);
    function coinDeedFactory() external view returns (address);
    function wholesaleFactory() external view returns (address);
    function deedToken() external view returns (address);
    function coinDeedDeployer() external view returns (address);
    function treasury() external view returns (address);
    function coinDeedDao() external view returns (address);
    function vault() external view returns (address);
} 