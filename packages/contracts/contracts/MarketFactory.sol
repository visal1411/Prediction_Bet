// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";
import "./OracleClient.sol";

contract MarketFactory is Ownable {
    address[] public markets;
    mapping(bytes32 => address) public eventMarkets;
    OracleClient public oracleClient;

    event MarketCreated(address indexed marketAddress, bytes32 indexed eventId, uint256 deadline);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setOracleClient(address _oracleClient) external onlyOwner {
        oracleClient = OracleClient(_oracleClient);
    }

    function createMarket(
        bytes32 eventId,
        uint256 bettingDeadline,
        uint8 numberOfOutcomes
    ) external onlyOwner returns (address) {
        require(eventMarkets[eventId] == address(0), "Market already exists for this event");
        require(address(oracleClient) != address(0), "Oracle client not set");
        require(bettingDeadline > block.timestamp, "Deadline must be in the future");

        // Deploy new market contract
        PredictionMarket newMarket = new PredictionMarket(
            eventId,
            bettingDeadline,
            numberOfOutcomes,
            address(oracleClient)
        );

        address marketAddress = address(newMarket);
        markets.push(marketAddress);
        eventMarkets[eventId] = marketAddress;

        // Register market with the oracle to automatically resolve when game ends (Mocked flow)
        oracleClient.registerMarket(eventId, marketAddress);

        emit MarketCreated(marketAddress, eventId, bettingDeadline);
        
        return marketAddress;
    }

    function getMarkets() external view returns (address[] memory) {
        return markets;
    }
}
