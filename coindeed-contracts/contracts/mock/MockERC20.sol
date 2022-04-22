//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 decimal;
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 supply_,
        uint8 decimal_
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, supply_);
        _setDecimals(decimal_);
    }
    function decimals() public view virtual override returns (uint8) {
        return decimal;
    }
    function _setDecimals(uint8 decimal_) internal {
        decimal = decimal_;
    }
}