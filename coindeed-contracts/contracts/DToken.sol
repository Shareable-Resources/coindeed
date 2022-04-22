//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("Deed Token", "DToken") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, msg.sender),
            "DToken: caller is not the minter"
        );
        _;
    }

    function mint(address to, uint256 value) public onlyMinter {
        _mint(to, value);
    }
}