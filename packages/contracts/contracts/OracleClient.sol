// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

// This is a Mock Oracle for local development
// In production, this would inherit from ChainlinkClient / FunctionsClient
contract OracleClient is Ownable {
    
    // Maps eventId to the deployed PredictionMarket contract address
    mapping(bytes32 => address) public registeredMarkets;

    event MarketRegistered(bytes32 indexed eventId, address marketAddress);
    event ResultPushed(bytes32 indexed eventId, uint8 winningOutcome);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // Called by the MarketFactory when a new market is deployed
    function registerMarket(bytes32 eventId, address marketAddress) external {
        registeredMarkets[eventId] = marketAddress;
        emit MarketRegistered(eventId, marketAddress);
    }

    // Mock function to simulate receiving data from Chainlink
    // Admin calls this to resolve a market locally
    function mockFulfillRequest(bytes32 eventId, uint8 winningOutcome) external onlyOwner {
        address marketAddress = registeredMarkets[eventId];
        require(marketAddress != address(0), "Market not registered for this event");

        PredictionMarket market = PredictionMarket(marketAddress);
        market.resolve(winningOutcome);

        emit ResultPushed(eventId, winningOutcome);
    }
}
