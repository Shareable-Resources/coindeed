// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";


/**
 * @dev Interface of the Lending pool.
 */
interface ILendingPool{

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
        uint256 baseRatePerYear,
        uint256 _reserveFactorMantissa
    ) external;

    function createPool(
        address _tokenAddress
    ) external;

    function addNewDeed (address _address) external;

    function removeExpireDeed (address _address) external;

    // Stake tokens to Pool
    function deposit(address _tokenAddress, uint256 _amount)
    external
    payable;

    // Borrow
    function borrow(address _tokenAddress, uint256 _amount) external;

    // Pay
    function repay(address _tokenAddress, uint256 _amount)
    external
    payable;

    // Withdraw tokens from STAKING.
    function withdraw(address _tokenAddress, uint256 _amount) external;

}