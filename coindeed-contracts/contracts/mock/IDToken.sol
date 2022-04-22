// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

/**
 * @dev Interface of the DToken.
 */
interface IDToken {
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint256);

    function transfer(address recipient, uint256 amount)
    external
    returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function mint(address _to, uint256 _amount) external;
}