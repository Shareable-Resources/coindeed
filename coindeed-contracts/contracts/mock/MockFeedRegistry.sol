//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../interface/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/Denominations.sol";

/** This contract is built to simulate oracle prices. Only latestAnswer and decimals are implemented properly.
 ** Set answer of an address pair with setPrice. Set decimals with setDecimals()
 **/

contract MockFeedRegistry is FeedRegistryInterface{
    mapping(address => mapping(address => uint8)) private decimal;
    mapping(address => mapping(address => int256)) private answers;

    function decimals(
        address base,
        address quote
    )
        external view override
        returns (uint8)
    {
        if (decimal[base][quote] > 0){
            return decimal[base][quote];
        }
        else {
            return 18;
        }
    }

    function latestRoundData(
        address base,
        address quote
    )
        external view override
        returns (
            uint80 id,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, 0, 0, 0, 0);
    }

    function latestAnswer(
        address base,
        address quote
    )
        external view override
        returns (int256 answer)
    {
        if(answers[base][quote] > 0){
            return answers[base][quote];
        }
        return 1e18;
    }

    function latestTimestamp(
        address base,
        address quote
    )
        external view override
        returns (uint256 timestamp)
    {
        return 0;
    }

    function latestRound(
        address base,
        address quote
    )
        external view override
        returns (uint256 roundId)
    {
        return 0;
    }

    function isFeedEnabled(
        address aggregator
    )
        external view override
        returns (bool)
    {
        return true;
    }

    function setDecimals(
        address base,
        address quote,
        uint8 _decimal
    )
        external
    {
        decimal[base][quote] = _decimal;
    }

    function setAnswer(
        address base,
        address quote,
        int256 _answer
    )
        external
    {
        answers[base][quote] = _answer;
    }
}