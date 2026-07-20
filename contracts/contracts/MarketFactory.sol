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

    // Which markets are demo markets
    mapping(address => bool) public isDemoMarket;

    // Oracle client address (used for real markets)
    address public oracleClient;

    // ─── Events ───────────────────────────────────────────────────────────────

    event MarketCreated(
        address indexed marketAddress,
        bytes32 indexed eventId,
        string[] outcomes,
        uint256 deadline,
        bool    isDemo
    );

    event OracleClientUpdated(address indexed newOracleClient);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _owner) Ownable(_owner) {}

    // ─── Factory functions ────────────────────────────────────────────────────

    /**
     * @notice Create a real market — outcome resolved by Chainlink Oracle.
     * @param _eventId   Unique bytes32 identifier (e.g. keccak256("EVT-001"))
     * @param _outcomes  Array of outcome labels ["Home Win", "Away Win", "Draw"]
     * @param _deadline  Unix timestamp — betting closes at this time
     */
    function createMarket(
        bytes32        _eventId,
        string[] calldata _outcomes,
        uint256        _deadline
    ) external onlyOwner returns (address) {
        return _deployMarket(_eventId, _outcomes, _deadline, false);
    }

    /**
     * @notice Create a demo market — outcome resolved by owner wallet directly.
     *
     * HOW TO USE DURING DEMO:
     *   1. Call this once (via deploy script or Admin UI) to create the market.
     *   2. Audience / students place bets via the frontend.
     *   3. When ready to reveal the "winner", the admin connects their owner
     *      wallet and clicks the "Declare Winner" button in the Admin page.
     *   4. The Admin UI calls market.resolve(outcomeIndex) — no Chainlink needed.
     *   5. Winners click "Claim Winnings" and receive ETH instantly.
     *
     * @param _eventId   Any bytes32, e.g. keccak256("DEMO_MATCH_001")
     * @param _outcomes  Fictional outcome labels e.g. ["Crypto Bulls Win", "..."]
     * @param _deadline  Should be far enough in the future for the demo session
     */
    function createDemoMarket(
        bytes32        _eventId,
        string[] calldata _outcomes,
        uint256        _deadline
    ) external onlyOwner returns (address) {
        return _deployMarket(_eventId, _outcomes, _deadline, true);
    }

    // ─── Internal deploy ──────────────────────────────────────────────────────

    function _deployMarket(
        bytes32        _eventId,
        string[] calldata _outcomes,
        uint256        _deadline,
        bool           _isDemo
    ) internal returns (address) {
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
            _deadline,
            oracleClient,   // oracle address (ignored for demo markets)
            _isDemo
        );

        address marketAddress = address(market);

        _markets[_eventId]         = marketAddress;
        _allMarkets.push(marketAddress);
        isDemoMarket[marketAddress] = _isDemo;

        emit MarketCreated(marketAddress, _eventId, _outcomesMemory, _deadline, _isDemo);
        return marketAddress;
    }

    // ─── Configuration ────────────────────────────────────────────────────────

    function setOracleClient(address _oracleClient) external onlyOwner {
        oracleClient = _oracleClient;
        emit OracleClientUpdated(_oracleClient);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getMarket(bytes32 _eventId) external view returns (address) {
        return _markets[_eventId];
    }

    function getAllMarkets() external view returns (address[] memory) {
        return _allMarkets;
    }

    function getDemoMarkets() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _allMarkets.length; i++) {
            if (isDemoMarket[_allMarkets[i]]) count++;
        }
        address[] memory demos = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _allMarkets.length; i++) {
            if (isDemoMarket[_allMarkets[i]]) {
                demos[idx++] = _allMarkets[i];
            }
        }
        return demos;
    }

    function getRealMarkets() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _allMarkets.length; i++) {
            if (!isDemoMarket[_allMarkets[i]]) count++;
        }
        address[] memory real = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _allMarkets.length; i++) {
            if (!isDemoMarket[_allMarkets[i]]) {
                real[idx++] = _allMarkets[i];
            }
        }
        return real;
    }

    function getMarketsCount() external view returns (uint256) {
        return _allMarkets.length;
    }
}
