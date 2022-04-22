//SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

contract MockOracle {
    int256 price;

    constructor(int256 _price) {
        price = _price;
    }
    function latestAnswer() external view returns (int256) {
        return price;
    }
}