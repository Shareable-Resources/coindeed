//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MockCoinDeedFactory {
    mapping(address => bool) public isDeed;

    constructor(address deed) public {
        isDeed[deed] = true;
    }
}
