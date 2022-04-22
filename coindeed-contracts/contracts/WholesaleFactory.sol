//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interface/IWholesaleFactory.sol";
import "./interface/ICoinDeedAddressesProvider.sol";
import "./interface/ICoinDeedFactory.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

contract WholesaleFactory is Initializable, IWholesaleFactory {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    CountersUpgradeable.Counter private saleIdCounter;
    ICoinDeedAddressesProvider public coinDeedAddressesProvider;

    mapping(uint256 => Wholesale) public saleIdMapping;

    mapping(uint256 => mapping(address => bool))
        public
        override permittedDeedManager;

    function initialize(address _coinDeedAddressesProvider) public initializer {
        coinDeedAddressesProvider = ICoinDeedAddressesProvider(
            _coinDeedAddressesProvider
        );
    }

    modifier onlySeller(uint256 saleId) {
        require(
            saleIdMapping[saleId].offeredBy == msg.sender,
            "Only sale owner can access this method"
        );
        _;
    }

    modifier onlyDeed(uint256 saleId) {
        require(
            saleIdMapping[saleId].reservedTo == msg.sender,
            "Only deed contract can access this method"
        );
        _;
    }

    modifier requireState(uint256 saleId, WholesaleState state) {
        require(
            saleIdMapping[saleId].state == state,
            "Contract is in invalid state"
        );
        _;
    }

    modifier requireBeforeDeadline(uint256 saleId) {
        require(
            saleIdMapping[saleId].deadline >= block.timestamp,
            "Contract deadline is passed"
        );
        _;
    }

    function createWholesale(
        address tokenOffered,
        address tokenRequested,
        uint256 offeredAmount,
        uint256 requestedAmount,
        uint256 minSaleAmount,
        uint256 deadline,
        address reservedTo,
        address permitDeedManager,
        bool isPrivate,
        uint256 exitDeedLock
    ) external override {
        IERC20Upgradeable erc20 = IERC20Upgradeable(tokenOffered);
        erc20.safeTransferFrom(msg.sender, address(this), offeredAmount);
        _createWholesale(
            tokenOffered,
            tokenRequested,
            offeredAmount,
            requestedAmount,
            minSaleAmount,
            deadline,
            reservedTo,
            permitDeedManager,
            isPrivate,
            exitDeedLock
        );
    }

    function createWholesaleEth(
        address tokenRequested,
        uint256 requestedAmount,
        uint256 minSaleAmount,
        uint256 deadline,
        address reservedTo,
        address permitDeedManager,
        bool isPrivate,
        uint256 exitDeedLock
    ) external payable override {
        address tokenOffered = address(0x00);
        uint256 offeredAmount = msg.value;
        _createWholesale(
            tokenOffered,
            tokenRequested,
            offeredAmount,
            requestedAmount,
            minSaleAmount,
            deadline,
            reservedTo,
            permitDeedManager,
            isPrivate,
            exitDeedLock
        );
    }

    function _createWholesale(
        address tokenOffered,
        address tokenRequested,
        uint256 offeredAmount,
        uint256 requestedAmount,
        uint256 minSaleAmount,
        uint256 deadline,
        address reservedTo,
        address permitDeedManager,
        bool isPrivate,
        uint256 exitDeedLock
    ) internal {
        require(minSaleAmount <= requestedAmount, "Minimum must be less than total size");
        saleIdCounter.increment();
        uint256 saleId = saleIdCounter.current();
        WholesaleState state = WholesaleState.OPEN;
        saleIdMapping[saleId] = Wholesale({
            offeredBy: msg.sender,
            tokenOffered: tokenOffered,
            tokenRequested: tokenRequested,
            offeredAmount: offeredAmount,
            requestedAmount: requestedAmount,
            soldAmount: 0,
            receivedAmount: 0,
            minSaleAmount: minSaleAmount,
            deadline: deadline,
            reservedTo: reservedTo,
            isPrivate: isPrivate,
            exitDeedLock: exitDeedLock,
            state: state
        });
        _permitManager(saleId, permitDeedManager);
        emit WholesaleCreated(
            saleId,
            msg.sender,
            tokenOffered,
            tokenRequested,
            offeredAmount,
            requestedAmount,
            minSaleAmount,
            deadline,
            reservedTo,
            permitDeedManager,
            isPrivate,
            exitDeedLock
        );
    }

    function _canCancel(uint256 saleId) internal view returns (bool) {
        if (saleIdMapping[saleId].state == WholesaleState.OPEN) {
            return true;
        }

        if (saleIdMapping[saleId].state != WholesaleState.RESERVED) {
            return false;
        }

        if (block.timestamp > saleIdMapping[saleId].deadline) {
            return true;
        }
        return false;
    }

    function cancelWholesale(uint256 saleId)
        external
        override
        onlySeller(saleId)
    {
        if (!_canCancel(saleId)) {
            revert("Contract cannot be cancelled");
        }

        saleIdMapping[saleId].state = WholesaleState.CANCELLED;
        _withdraw(
            saleIdMapping[saleId].tokenOffered,
            saleIdMapping[saleId].offeredAmount
        );
        emit WholesaleCanceled(saleId);
    }

    function reserveWholesale(uint256 saleId)
        external
        override
        requireState(saleId, WholesaleState.OPEN)
        requireBeforeDeadline(saleId)
    {
        ICoinDeedFactory coinDeedFactory = ICoinDeedFactory(
            coinDeedAddressesProvider.coinDeedFactory()
        );
        Wholesale storage wholesale = saleIdMapping[saleId];
        require(coinDeedFactory.isDeed(msg.sender), "Not deed");
        require(
            wholesale.reservedTo == address(0x00) &&
                (!wholesale.isPrivate ||
                    permittedDeedManager[saleId][tx.origin]),
            "Not permitted to reserve"
        );

        wholesale.state = WholesaleState.RESERVED;
        wholesale.reservedTo = msg.sender;
        emit WholesaleReserved(saleId, msg.sender);
    }

    function cancelReservation(uint256 saleId)
        external
        override
        requireState(saleId, WholesaleState.RESERVED)
        requireBeforeDeadline(saleId)
    {
        require(
            msg.sender == saleIdMapping[saleId].reservedTo,
            "Not reserved to"
        );
        saleIdMapping[saleId].state = WholesaleState.OPEN;
        saleIdMapping[saleId].reservedTo = address(0x00);
        emit WholesaleUnreserved(saleId);
    }

    function executeWholesale(uint256 saleId, uint256 amount)
        external
        payable
        override
        requireState(saleId, WholesaleState.RESERVED)
        onlyDeed(saleId)
        requireBeforeDeadline(saleId)
    {
        Wholesale storage wholesale = saleIdMapping[saleId];
        require(amount <= wholesale.requestedAmount, "amount too high");
        require(amount >= wholesale.minSaleAmount, "amount too low");
        // take funds out of sender
        if (wholesale.tokenRequested == address(0x00)) {
            require(msg.value >= amount, "not enough eth");
            uint256 extra = msg.value.sub(amount);
            if (extra > 0) {
                (bool sent, ) = msg.sender.call{value: extra}("");
                require(sent, "Failed to send Ether");
            }
        } else {
            IERC20Upgradeable erc20 = IERC20Upgradeable(
                wholesale.tokenRequested
            );
            erc20.safeTransferFrom(msg.sender, address(this), amount);
        }
        wholesale.soldAmount =
            (wholesale.offeredAmount * amount) /
            wholesale.requestedAmount;
        if (saleIdMapping[saleId].tokenOffered == address(0x00)) {
            (bool sent, ) = msg.sender.call{value: wholesale.soldAmount}("");
            require(sent, "Failed to send Ether");
        } else {
            IERC20Upgradeable erc20 = IERC20Upgradeable(wholesale.tokenOffered);
            erc20.safeTransfer(msg.sender, wholesale.soldAmount);
        }

        wholesale.state = WholesaleState.COMPLETED;
        wholesale.receivedAmount = amount;
        emit WholesaleExecuted(saleId, amount);
    }

    function getWholesale(uint256 saleId)
        external
        view
        override
        returns (Wholesale memory)
    {
        return saleIdMapping[saleId];
    }

    function setPrivate(uint256 saleId, bool _private)
        external
        override
        onlySeller(saleId)
        requireState(saleId, WholesaleState.OPEN)
    {
        saleIdMapping[saleId].isPrivate = _private;
    }

    function permitManagers(uint256 saleId, address[] calldata managers)
        external
        override
        onlySeller(saleId)
        requireState(saleId, WholesaleState.OPEN)
    {
        uint256 i = 0;
        for (i = 0; i < managers.length; i++) {
            _permitManager(saleId, managers[i]);
        }
    }

    function permitManager(uint256 saleId, address manager)
        external
        override
        onlySeller(saleId)
        requireState(saleId, WholesaleState.OPEN)
    {
        _permitManager(saleId, manager);
    }

    function _permitManager(uint256 saleId, address manager) internal {
        permittedDeedManager[saleId][manager] = true;
    }

    function withdraw(uint256 saleId)
        external
        override
        onlySeller(saleId)
        requireState(saleId, WholesaleState.COMPLETED)
    {
        Wholesale memory wholesale = saleIdMapping[saleId];
        require(
            wholesale.state == WholesaleState.COMPLETED ||
                wholesale.state == WholesaleState.CANCELLED,
            "Wholesale must be completed or cancelled"
        );

        _withdraw(wholesale.tokenRequested, wholesale.receivedAmount);
        _withdraw(
            wholesale.tokenOffered,
            wholesale.offeredAmount - wholesale.soldAmount
        );
        emit WholesaleWithdrawn(
            saleId,
            wholesale.tokenRequested,
            wholesale.tokenOffered,
            wholesale.receivedAmount,
            wholesale.offeredAmount - wholesale.soldAmount
        );
        saleIdMapping[saleId].state = WholesaleState.WITHDRAWN;
        return;
    }

    function _withdraw(address token, uint256 amount) internal {
        if (token == address(0x00)) {
            (bool sent, ) = msg.sender.call{value: amount}("");
            require(sent, "Failed to send Ether");
        } else {
            IERC20Upgradeable erc20 = IERC20Upgradeable(token);
            erc20.safeTransfer(msg.sender, amount);
        }
    }
}
