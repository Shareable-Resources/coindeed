// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface FeedRegistryInterface {
    function decimals(address base, address quote)
        external
        view
        returns (uint8);

    function latestRoundData(address base, address quote)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    // V2 AggregatorInterface

    function latestAnswer(address base, address quote)
        external
        view
        returns (int256 answer);

    function latestTimestamp(address base, address quote)
        external
        view
        returns (uint256 timestamp);

    function latestRound(address base, address quote)
        external
        view
        returns (uint256 roundId);

    function isFeedEnabled(address aggregator) external view returns (bool);
}
