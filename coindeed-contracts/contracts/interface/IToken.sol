//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IToken is IERC20, IAccessControl, IERC165 {
    function mint(address _to, uint256 _amount) external;

    function burn(address _account, uint256 _amount) external;
}
