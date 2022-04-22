// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// DToken.
contract MockDToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyMinter(address account) {
        require(
            hasRole(MINTER_ROLE, account),
            "DToken: caller is not the minter"
        );
        _;
    }

    function mint(address _to, uint256 _amount) public onlyMinter(msg.sender) {
        _mint(_to, _amount);
    }
}