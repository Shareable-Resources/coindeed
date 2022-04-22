//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interface/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "./interface/IDToken.sol";
import "./interface/ICoinDeedDao.sol";
import "./libraries/SafeERC20.sol";
import "./interface/ICoinDeedFactory.sol";
import "./interface/ICoinDeedAddressesProvider.sol";

// import "hardhat/console.sol";

contract CoinDeedDao is
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ICoinDeedDao
{
    using SafeMathUpgradeable for uint256;
    using SafeERC20 for IERC20;

    ICoinDeedAddressesProvider coinDeedAddressesProvider;
    uint256 public constant BASE_DENOMINATOR = 100;
    uint256 public constant INTEREST_FACTOR = 80; //80% minted token transfer to lender
    uint256 public constant baseDTokenMintRate = 1; //Base rate to mint DToken (1 CDT per 1 USD)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    IDToken public dToken;

    /**
     * @notice Function initializer take 3 parameters {_dToken}, {_lendingPool} and {_ethOracle}
     * The first 2 params represent the 2 address of the DToken contract and LendingPool contract
     * The last param take the oracle address of ETH
     */
    function initialize(
        address _dToken,
        address coinDeedAddressesProvider_
    ) public initializer {
        __Ownable_init_unchained();
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        dToken = IDToken(_dToken);
        coinDeedAddressesProvider = ICoinDeedAddressesProvider(
            coinDeedAddressesProvider_
        );
    }

    // Function to receive Ether from lending pool. msg.data must be empty
    receive() external payable {
        if (msg.sender != coinDeedAddressesProvider.lendingPool()) {
            (bool sent, ) = msg.sender.call{value: msg.value}(""); // send ETH back to user if sender isn't lending pool
            require(sent, "Coindeed: Transfer failed");
        }
    }

    modifier onlyLendingPool() {
        require(
            msg.sender == address(coinDeedAddressesProvider.lendingPool()),
            "Coindeed: Only lending pool can call this function"
        );
        _;
    }

    modifier onlyDeed() {
        require(
            ICoinDeedFactory(coinDeedAddressesProvider.coinDeedFactory())
                .isDeed(msg.sender),
            "CoinDeedDAO: Caller is not a Deed"
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

    // Function to claim DToken reward
    function claimDToken(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external override onlyLendingPool {
        _claimDToken(_tokenAddress, _to, _amount);
    }

    function _claimDToken(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) private {
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(
            coinDeedAddressesProvider.feedRegistry()
        );
        uint256 tokenPrice = uint256(
            feedRegistry.latestAnswer(_tokenAddress, Denominations.USD)
        );
        uint256 tokenDecimals = uint256(
            feedRegistry.decimals(_tokenAddress, Denominations.USD)
        );

        uint256 amountTokenEx = _amount
            .mul(tokenPrice)
            .div(10**tokenDecimals)
            .mul(baseDTokenMintRate)
            .mul(INTEREST_FACTOR)
            .div(BASE_DENOMINATOR);
        if (_tokenAddress == address(0)) {
            amountTokenEx = amountTokenEx.mul(10**dToken.decimals()).div(1e18);
        } else {
            amountTokenEx = amountTokenEx.mul(10**dToken.decimals()).div(
                10**IERC20MetadataUpgradeable(_tokenAddress).decimals()
            );
        }
        dToken.mint(_to, amountTokenEx); //Provide the liquidity for DAO contract
        emit Mint(_to, amountTokenEx);
    }

    // Return reward exchange from Oracle
    function exchangRewardToken(address _tokenAddress, uint256 _amount)
        external
        view
        override
        returns (uint256)
    {
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(
            coinDeedAddressesProvider.feedRegistry()
        );
        uint256 tokenPrice = uint256(
            feedRegistry.latestAnswer(_tokenAddress, Denominations.USD)
        );
        uint256 tokenDecimals = uint256(
            feedRegistry.decimals(_tokenAddress, Denominations.USD)
        );

        return
            _amount
                .mul(tokenPrice)
                .div(10**tokenDecimals)
                .mul(baseDTokenMintRate)
                .mul(INTEREST_FACTOR)
                .div(BASE_DENOMINATOR);
    }

    // Function to claim DToken fee
    function claimCoinDeedManagementFee(address _tokenAddress, uint256 _amount)
        external
        payable
        override
        onlyDeed
        returns (uint256)
    {
        if (_tokenAddress == address(0)) {
            require(msg.value == _amount, "CoinDeedDAO: Invalid amount");
        }
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(
            coinDeedAddressesProvider.feedRegistry()
        );
        uint256 tokenPrice = uint256(
            feedRegistry.latestAnswer(_tokenAddress, Denominations.USD)
        );
        uint256 tokenDecimals = uint256(
            feedRegistry.decimals(_tokenAddress, Denominations.USD)
        );

        uint256 amountTokenEx = _amount
            .mul(tokenPrice)
            .div(10**tokenDecimals)
            .mul(baseDTokenMintRate);
        if (_tokenAddress == address(0)) {
            amountTokenEx = amountTokenEx.mul(10**dToken.decimals()).div(1e18);
        } else {
            amountTokenEx = amountTokenEx.mul(10**dToken.decimals()).div(
                10**IERC20MetadataUpgradeable(_tokenAddress).decimals()
            );
            IERC20(_tokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                _amount
            );
        }
        dToken.mint(msg.sender, amountTokenEx); // Mint management fee for Deed
        emit Mint(msg.sender, amountTokenEx);
        return amountTokenEx;
    }

    // Return fee exchange from Oracle
    function getCoinDeedManagementFee(address _tokenAddress, uint256 _amount)
        external
        view
        override
        returns (uint256)
    {
        FeedRegistryInterface feedRegistry = FeedRegistryInterface(
            coinDeedAddressesProvider.feedRegistry()
        );
        uint256 tokenPrice = uint256(
            feedRegistry.latestAnswer(_tokenAddress, Denominations.USD)
        );
        uint256 tokenDecimals = uint256(
            feedRegistry.decimals(_tokenAddress, Denominations.USD)
        );

        uint256 amountTokenEx = _amount
            .mul(tokenPrice)
            .div(10**tokenDecimals)
            .mul(baseDTokenMintRate);
        if (_tokenAddress == address(0)) {
            amountTokenEx = amountTokenEx.mul(10**dToken.decimals()).div(1e18);
        } else {
            amountTokenEx = amountTokenEx.mul(10**dToken.decimals()).div(
                10**IERC20MetadataUpgradeable(_tokenAddress).decimals()
            );
        }
        return amountTokenEx;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
