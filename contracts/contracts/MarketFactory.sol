// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

/**
 * @title MarketFactory
 * @notice Deploys and tracks PredictionMarket contracts.
 *
 * Two creation paths:
 *   createMarket()     — real event, oracle-resolved via Chainlink
 *   createDemoMarket() — fictional event, owner-resolved (for class demos)
 */
contract MarketFactory is Ownable {
    // ─── State ────────────────────────────────────────────────────────────────

    // eventId => market address
    mapping(bytes32 => address) private _markets;

    // List of all market addresses
    address[] private _allMarkets;

    // ─── Events ───────────────────────────────────────────────────────────────

    event MarketCreated(
        address indexed marketAddress,
        bytes32 indexed eventId,
        string[] outcomes,
        uint256 deadline
    );

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _owner) Ownable(_owner) {}

    // ─── Factory functions ────────────────────────────────────────────────────

    /**
     * @notice Create a market — outcome resolved by the owner.
     * @param _eventId   Unique bytes32 identifier (e.g. keccak256("EVT-001"))
     * @param _outcomes  Array of outcome labels ["Home Win", "Away Win", "Draw"]
     * @param _deadline  Unix timestamp — betting closes at this time
     */
    function createMarket(
        bytes32        _eventId,
        string[] calldata _outcomes,
        uint256        _deadline
    ) external onlyOwner returns (address) {
        require(_markets[_eventId] == address(0), "Market already exists");
        require(_outcomes.length >= 2, "Need >= 2 outcomes");
        require(_deadline > block.timestamp, "Deadline must be future");

        // Convert calldata to memory for constructor
        string[] memory _outcomesMemory = new string[](_outcomes.length);
        for (uint256 i = 0; i < _outcomes.length; i++) {
            _outcomesMemory[i] = _outcomes[i];
        }

        PredictionMarket market = new PredictionMarket(
            owner(),        // owner of the deployed market = factory owner
            _eventId,
            _outcomesMemory,
            _deadline
        );

        address marketAddress = address(market);

        _markets[_eventId]         = marketAddress;
        _allMarkets.push(marketAddress);

        emit MarketCreated(marketAddress, _eventId, _outcomesMemory, _deadline);
        return marketAddress;
    }

    // Removed oracle configuration

    // ─── Views ────────────────────────────────────────────────────────────────

    function getMarket(bytes32 _eventId) external view returns (address) {
        return _markets[_eventId];
    }

    function getAllMarkets() external view returns (address[] memory) {
        return _allMarkets;
    }

    // Removed getDemoMarkets and getRealMarkets

    function getMarketsCount() external view returns (uint256) {
        return _allMarkets.length;
    }
}
