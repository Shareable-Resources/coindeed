//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IWholesaleFactory {

    enum WholesaleState {OPEN, RESERVED, CANCELLED, COMPLETED, WITHDRAWN}

    struct Wholesale {
        address offeredBy;
        address tokenOffered;
        address tokenRequested;
        uint256 offeredAmount;
        uint256 requestedAmount;
        uint256 soldAmount;
        uint256 receivedAmount;
        uint256 minSaleAmount;
        uint256 deadline;
        address reservedTo;
        bool isPrivate;
        uint256 exitDeedLock;
        WholesaleState state;
    }


    event WholesaleCreated(
        uint256 indexed saleId,
        address indexed offeredBy,
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
    );

    event WholesaleCanceled(
        uint256 indexed saleId
    );

    event WholesaleReserved(
        uint256 indexed saleId,
        address indexed reservedBy
    );

    event WholesaleUnreserved(
        uint256 indexed saleId
    );

    event WholesaleExecuted(
        uint256 indexed saleId,
        uint256 indexed tokenOfferedAmount
    );

    event WholesaleWithdrawn(
        uint256 indexed saleId,
        address indexed tokenRequested,
        address indexed tokenOffered,
        uint256 receivedAmount,
        uint256 unsoldAmount
    );

    event WholesaleEdited(
        uint256 indexed saleId,
        bool isPrivate,
        uint256 deadline,
        uint256 minSaleAmount
    );

    /**
    * Seller creates a wholesale
    */
    function createWholesale(address tokenOffered,
        address tokenRequested,
        uint256 offeredAmount,
        uint256 requestedAmount,
        uint256 minSaleAmount,
        uint256 deadline,
        address reservedTo,
        address permitDeedManager,
        bool isPrivate,
        uint256 exitDeedLock) external;

    /**
    * Seller creates a wholesale with native coin
    */
    function createWholesaleEth(
        address tokenRequested,
        uint256 requestedAmount,
        uint256 minSaleAmount,
        uint256 deadline,
        address reservedTo,
        address permitDeedManager,
        bool isPrivate,
        uint256 exitDeedLock) external payable;

    /**
    * Seller cancels a wholesale before it is reserved
    */
    function cancelWholesale(uint256 saleId) external;

    /**
     * Deed reserves a wholesale
     */
    function reserveWholesale(uint256 saleId) external;

    /**
     * Deed triggers a wholesale
     */
    function executeWholesale(uint256 saleId, uint256 amount) external payable;

    /**
     * Returns a wholesale with Id
     */
    function getWholesale(uint256 saleId) external returns (Wholesale memory);

    /**
     * Cancels reservation n a wholesale by a deed by seller
     */
    function cancelReservation(uint256 saleId) external;

    function permittedDeedManager(uint256 saleId, address manager) external returns (bool);

    /**
     * Withdraw funds from a wholesale
     */
    function withdraw(uint256 saleId) external;

    function permitManagers(uint256 saleId, address[] calldata managers) external;
    function permitManager(uint256 saleId, address manager) external;
    function setPrivate(uint256 saleId, bool isPrivate) external;
}
