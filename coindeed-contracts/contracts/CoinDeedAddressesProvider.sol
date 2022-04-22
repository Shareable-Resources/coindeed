// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.0;

import "./interface/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interface/ICoinDeedAddressesProvider.sol";

contract CoinDeedAddressesProvider is AccessControlUpgradeable, ICoinDeedAddressesProvider{
    address public override lendingPool;
    address public override coinDeedFactory;
    address public override feedRegistry;
    address public override swapRouter;
    address public override wholesaleFactory;
    address public override deedToken;
    address public override coinDeedDeployer;
    address public override treasury;
    address public override coinDeedDao;
    address public override vault;

    function initialize() public initializer {
        swapRouter = 0xf164fC0Ec4E93095b804a4795bBe1e041497b92a;
        feedRegistry = 0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf;
    }
    function setFeedRegistry(address _feedRegistry) public {
        feedRegistry = _feedRegistry;
        emit FeedRegistryChanged(feedRegistry);
    }
    function setSwapRouter(address _swapRouter) public {
        swapRouter = _swapRouter;
        emit SwapRouterChanged(swapRouter);
    }
    function setLendingPool(address _lendingPool) public {
        lendingPool = _lendingPool;
        emit LendingPoolChanged(lendingPool);
    }
    function setCoinDeedFactory(address _coinDeedFactory) public {
        coinDeedFactory = _coinDeedFactory;
        emit CoinDeedFactoryChanged(coinDeedFactory);
    }
    function setWholesaleFactory(address _wholesaleFactory) public {
        wholesaleFactory = _wholesaleFactory;
        emit WholesaleFactoryChanged(wholesaleFactory);
    }
    function setDeedToken(address _deedToken) public {
        deedToken = _deedToken;
        emit DeedTokenChanged(deedToken);
    }
    function setCoinDeedDeployer(address _coinDeedDeployer) public {
        coinDeedDeployer = _coinDeedDeployer;
        emit CoinDeedDeployerChanged(coinDeedDeployer);
    }
    function setTreasury(address _treasury) public {
        treasury = _treasury;
        emit TreasuryChanged(treasury);
    }
    function setCoinDeedDao(address _coinDeedDao) public {
        coinDeedDao = _coinDeedDao;
        emit CoinDeedDaoChanged(coinDeedDao);
    }
    function setVault(address _vault) public {
        vault = _vault;
        emit VaultChanged(vault);
    }
}