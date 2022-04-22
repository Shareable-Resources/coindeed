//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./interface/IDToken.sol";

//This contract was created to store DToken left from each deed contract when it complete.
//Only DToken should be sent to this contract
contract CoinDeedVault is Initializable, AccessControlUpgradeable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    IDToken dtoken;

    function initialize (
        address _dToken
    ) public initializer {
        __AccessControl_init_unchained();
        // set admin role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        dtoken = IDToken(_dToken);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    modifier restricted() {
        _restricted();
        _;
    }

    function _restricted() internal view {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not admin");
    }

    function withdraw(address token, uint256 amount) external restricted {
        require(token == address(dtoken), "You can only withdraw DToken");
        uint256 balance = IERC20Upgradeable(token).balanceOf(address(this));
        require(amount <= balance, "Invalid amount");
        IERC20Upgradeable(token).safeTransfer(msg.sender, amount);
    }
}
