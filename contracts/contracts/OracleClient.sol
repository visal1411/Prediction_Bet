// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";
import "./MarketFactory.sol";

/**
 * @title OracleClient
 * @notice Bridges Chainlink Functions + Automation → PredictionMarket resolution.
 *
 * Workflow:
 *   1. Chainlink Automation calls checkUpkeep() at regular intervals.
 *   2. When a market's deadline has passed, checkUpkeep() returns true.
 *   3. Automation calls performUpkeep() → which calls requestResult().
 *   4. requestResult() sends an HTTP request to SportsData.io via Chainlink Functions.
 *   5. Chainlink DON nodes execute chainlink-source.js and call fulfillRequest().
 *   6. fulfillRequest() decodes the result and calls PredictionMarket.resolve().
 *
 * NOTE: This contract only handles REAL markets (isDemo=false).
 *       Demo markets are resolved manually via the Admin UI.
 */
contract OracleClient is FunctionsClient, AutomationCompatibleInterface, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    // ─── Chainlink configuration ──────────────────────────────────────────────

    bytes32 public donId;
    uint64  public subscriptionId;
    uint32  public gasLimit;
    bytes   public encryptedSecretsUrls;  // URL pointing to uploaded encrypted secrets

    // JavaScript source to execute on DON (contents of chainlink-source.js)
    string public source;

    // ─── State ────────────────────────────────────────────────────────────────

    MarketFactory public immutable factory;

    // requestId => market address
    mapping(bytes32 => address) private _pendingRequests;

    // market address => already requested (prevent duplicate requests)
    mapping(address => bool) public requestSent;

    // ─── Events ───────────────────────────────────────────────────────────────

    event OracleRequestSent(bytes32 indexed requestId, address indexed market);
    event OracleFulfilled(bytes32 indexed requestId, address indexed market, uint8 outcome);
    event OracleError(bytes32 indexed requestId, bytes error);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address _functionsRouter,   // Sepolia: 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0
        address _factory,
        address _owner,
        bytes32 _donId,
        uint64  _subscriptionId,
        uint32  _gasLimit
    )
        FunctionsClient(_functionsRouter)
        Ownable(_owner)
    {
        factory        = MarketFactory(_factory);
        donId          = _donId;
        subscriptionId = _subscriptionId;
        gasLimit       = _gasLimit;
    }

    // ─── Chainlink Automation ─────────────────────────────────────────────────

    /**
     * @notice Called by Chainlink Automation nodes every block.
     * @dev Returns true for the first market past its deadline that hasn't been requested yet.
     */
    function checkUpkeep(bytes calldata /* checkData */)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        address[] memory markets = factory.getRealMarkets();

        for (uint256 i = 0; i < markets.length; i++) {
            PredictionMarket market = PredictionMarket(markets[i]);

            // Trigger if: deadline passed, market is Open or Locked, no request sent yet
            if (
                block.timestamp >= market.deadline() &&
                (market.state() == PredictionMarket.State.Open ||
                 market.state() == PredictionMarket.State.Locked) &&
                !requestSent[markets[i]]
            ) {
                return (true, abi.encode(markets[i]));
            }
        }

        return (false, "");
    }

    /**
     * @notice Called by Chainlink Automation when checkUpkeep() returns true.
     */
    function performUpkeep(bytes calldata performData) external override {
        address marketAddress = abi.decode(performData, (address));

        PredictionMarket market = PredictionMarket(marketAddress);

        // Double check conditions (guard against stale upkeep)
        require(block.timestamp >= market.deadline(), "Deadline not passed");
        require(!requestSent[marketAddress], "Already requested");

        // Lock the market so no more bets are accepted
        if (market.state() == PredictionMarket.State.Open) {
            market.lockMarket();
        }

        requestResult(marketAddress);
    }

    // ─── Chainlink Functions ──────────────────────────────────────────────────

    /**
     * @notice Send a request to Chainlink DON to fetch game result.
     */
    function requestResult(address _marketAddress) internal {
        PredictionMarket market = PredictionMarket(_marketAddress);

        // Build args: eventId is passed as a string to the JS source
        string[] memory args = new string[](1);
        args[0] = bytes32ToString(market.eventId());

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);

        if (encryptedSecretsUrls.length > 0) {
            req.addSecretsReference(encryptedSecretsUrls);
        }

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        _pendingRequests[requestId] = _marketAddress;
        requestSent[_marketAddress] = true;

        emit OracleRequestSent(requestId, _marketAddress);
    }

    /**
     * @notice Callback from Chainlink DON with the result.
     * @param requestId  ID of the fulfilled request.
     * @param response   ABI-encoded uint256 outcome index.
     * @param err        Non-empty bytes if the DON JS threw an error.
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        address marketAddress = _pendingRequests[requestId];
        require(marketAddress != address(0), "Unknown request");

        if (err.length > 0) {
            // Oracle returned an error (e.g. game not finished yet)
            // Reset so it can be retried
            requestSent[marketAddress] = false;
            delete _pendingRequests[requestId];
            emit OracleError(requestId, err);
            return;
        }

        // Decode response: uint256 outcome index
        uint8 outcome = uint8(abi.decode(response, (uint256)));

        delete _pendingRequests[requestId];

        PredictionMarket(marketAddress).resolve(outcome);

        emit OracleFulfilled(requestId, marketAddress, outcome);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setSource(string calldata _source) external onlyOwner {
        source = _source;
    }

    function setSubscriptionId(uint64 _id) external onlyOwner {
        subscriptionId = _id;
    }

    function setDonId(bytes32 _donId) external onlyOwner {
        donId = _donId;
    }

    function setGasLimit(uint32 _limit) external onlyOwner {
        gasLimit = _limit;
    }

    function setEncryptedSecretsUrls(bytes calldata _urls) external onlyOwner {
        encryptedSecretsUrls = _urls;
    }

    // Manual fallback: owner can force a request for a specific market
    function manualRequestResult(address _marketAddress) external onlyOwner {
        require(!requestSent[_marketAddress], "Already requested");
        requestSent[_marketAddress] = true;
        requestResult(_marketAddress);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function bytes32ToString(bytes32 _b) internal pure returns (string memory) {
        uint256 len = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (_b[i] != 0) len = i + 1;
        }
        bytes memory result = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = _b[i];
        }
        return string(result);
    }
}
