//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interface/ILendingPool.sol";

contract MockDeed {
    constructor(
     address lendingPool,
     address deed
    ) {
        ILendingPool(lendingPool).addNewDeed(deed);
    }
}