// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the Dao.
 */
interface IDao {
    event Transfer(address indexed user, uint256 amount);

    function addOracleForToken(address _token, address _tokenOracle) external;
    function createDTokenLiquidity() external;
    function receiveRewardTokenFromPool(address _userAddress, address _tokenAddress, uint256 _amount) external;
    function claimDToken(address _to) external;
    function getPendingDToken(address _userAddress) external returns(uint256);
}