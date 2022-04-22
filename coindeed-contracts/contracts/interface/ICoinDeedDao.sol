// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IOracle.sol";

/**
 * @dev Interface of the Dao.
 */
interface ICoinDeedDao {
    event Mint(address indexed user, uint256 amount);
    event AddOracleForToken(
        address indexed token,
        address indexed tokenOracle,
        uint256 oracleDecimals
    );

    function setCoinDeedAddressesProvider(address _coinDeedAddressesProvider)
        external;

    /**
     * @notice This function will receive the amount of token that lending pool transfer to
     * @dev It will convert the token to USDT and add it to user account to claim
     * This function take 3 parameters {_tokenAddress}, {_to} and {_amount}
     * The default value of amount should be in wei (1e18)
     */
    function claimDToken(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external;

    /**
     * @notice This function will return amount reward exchange from Oracle
     * @dev It will return reward exchange from Oracle
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function exchangRewardToken(address _tokenAddress, uint256 _amount)
        external
        view
        returns (uint256);

    /**
     * @notice This function will receive the amount of token that lending pool transfer to Deed
     * @dev It will return reward exchange from Oracle
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function claimCoinDeedManagementFee(address _tokenAddress, uint256 _amount)
        external
        payable
        returns (uint256);

    /**
     * @notice This function will return fee exchange from Oracle
     * @dev It will return fee exchange to Dtoken from Oracle
     * This function take 2 parameters {_tokenAddress} and {_amount}
     */
    function getCoinDeedManagementFee(address _tokenAddress, uint256 _amount)
        external
        view
        returns (uint256);
}
