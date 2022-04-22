// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "../Exponential.sol";
import "../ErrorReporter.sol";

/**
 * @dev Interface of the Lending pool.
 */
interface ILendingPool {
    /// @notice Info of each user.
    struct UserAssetInfo {
        uint256 amount; // How many tokens the lender has provided
        uint256 supplyIndex; // Reward debt. See explanation below.
    }

    /// @notice Info of each deed.
    struct DeedInfo {
        uint256 borrow;
        uint256 totalBorrow;
        uint256 borrowIndex;
        bool isValid;
    }

    /// @notice Info of each pool.
    struct PoolInfo {
        uint256 totalBorrows;
        uint256 totalReserves;
        uint256 borrowIndex;
        uint256 supplyIndex;
        uint256 accrualBlockNumber;
        bool isCreated;
        uint256 decimals;
        uint256 supplyIndexDebt;
        uint256 accSupplyTokenPerShare;
    }

    event PoolAdded(address indexed token, uint256 decimals);
    event PoolUpdated(
        address indexed token,
        uint256 decimals,
        address oracle,
        uint256 oracleDecimals
    );
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);

    /**
     * @notice Event emitted when interest is accrued
     */
    event AccrueInterest(
        uint256 cashPrior,
        uint256 interestAccumulated,
        uint256 borrowIndex,
        uint256 totalBorrows,
        uint256 totalReserves,
        uint256 supplyIndex
    );

    function initialize(
        address _dao,
        uint256 multiplierPerYear,
        uint256 baseRatePerYear
    ) external;

    function setCoinDeedAddressesProvider(address _coinDeedAddressesProvider)
        external;

    /**
     * @notice This function will add a pool into market
     * @dev It will initialize the components of a pool
     * This function take a parameter {_tokenAddress}
     */
    function createPool(address _tokenAddress) external;

    /**
     * @dev Testing service for testers
     * This function take a parameter {_address}
     */
    function addNewDeed(address _address) external;

    /**
     * @notice This function will supplying assets to the pool
     * @dev It will Stake tokens to Pool
     * Reverts upon any failure
     * Accrues interest whether or not the operation succeeds, unless reverted
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function deposit(address _tokenAddress, uint256 _amount) external payable;

    /**
     * @notice This function will borrowing assets to the pool
     * @dev Deed will Borrow tokens from Pool
     * Reverts upon any failure
     * Accrues interest whether or not the operation succeeds, unless reverted
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function borrow(address _tokenAddress, uint256 _amount) external;

    /**
     * @notice Deed repays a borrow
     * @dev repay
     * Reverts upon any failure
     * Accrues interest whether or not the operation succeeds, unless reverted
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function repay(address _tokenAddress, uint256 _amount) external payable;

    /**
     * @notice This function will withdrawing assets to the pool
     * @dev It will Withdraw tokens to Pool
     * Reverts upon any failure
     * Accrues interest whether or not the operation succeeds, unless reverted
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function withdraw(address _tokenAddress, uint256 _amount) external;

    /**
     * @notice Transfer all the claimable amount of deed token to the lender wallet address.
     * @dev It will call to DAO contract
     * Reverts upon any failure
     * Accrues interest whether or not the operation succeeds, unless reverted
     * This function take a parameter {_tokenAddress}
     */
    function claimDToken(address _tokenAddress) external;

    /// @notice Returns total interest and amount supplied
    function totalBorrowBalance(address _token, address _deed)
        external
        view
        returns (uint256);

    /// @notice Returns total interest and amount borrowed
    function totalDepositBalance(address _token, address _lender)
        external
        view
        returns (uint256);

    /// @notice Returns amount of tokens to borrow
    function borrowAmount(address _lender) external view returns (uint256);

    /// @notice Returns amount of tokens to deposit
    function depositAmount(address _token, address _lender) external view returns (uint256);

    /// @notice Returns rewarded token that  lender earned.
    function pendingToken(address _token, address _lender)
        external
        view
        returns (uint256);
    
    /// @notice Returns rewarded deed token that  lender earned.
    function pendingDToken(address _token, address _lender)
        external
        view
        returns (uint256);

    /// @notice Returns the existence of pool
    function poolActive(address _token) external view returns (bool);
}
