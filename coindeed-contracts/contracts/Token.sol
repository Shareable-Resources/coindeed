//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract Token is ERC20, AccessControl, ERC165Storage {

    bytes32 public constant MINTER = keccak256("MINTER");
    bytes32 public constant BURNER = keccak256("BURNER");


    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _registerInterface(type(IERC20).interfaceId);

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER, _msgSender());
        _setRoleAdmin(MINTER, DEFAULT_ADMIN_ROLE);
        _setupRole(BURNER, _msgSender());
        _setRoleAdmin(BURNER, DEFAULT_ADMIN_ROLE);
    }

    function mint(address _to, uint256 _amount) external onlyRole(MINTER) {
        _mint(_to, _amount);
    }


    function burn(address _account, uint256 _amount) external onlyRole(BURNER) {
        _burn(_account, _amount);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (AccessControl, ERC165Storage) returns (bool) {
        return ERC165Storage.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }
}
