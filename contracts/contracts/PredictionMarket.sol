// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PredictionMarket
 * @notice Parimutuel betting market for a single sporting event.
 *
 * States:  Open → Locked → Resolved → Settled
 *
 * isDemo flag:
 *   - false (real market): only the designated oracle address can call resolve().
 *   - true  (demo market): the contract owner can call resolve() directly,
 *     bypassing Chainlink. Used for class demonstrations with fictional matches.
 */
contract PredictionMarket is Ownable, ReentrancyGuard, Pausable {
    // ─── Enums ───────────────────────────────────────────────────────────────

    enum State { Open, Locked, Resolved, Settled }

    // ─── State variables ─────────────────────────────────────────────────────

    bytes32 public immutable eventId;
    bool    public immutable isDemo;
    address public immutable oracle;          // Address of OracleClient (ignored if isDemo)

    string[] public outcomes;                 // e.g. ["Home Win", "Away Win", "Draw"]
    uint256  public deadline;                 // Unix timestamp — no new bets accepted after this
    State    public state;

    uint8   public winningOutcome;
    uint256 public totalPool;

    // outcome index => bettor address => amount staked (wei)
    mapping(uint8 => mapping(address => uint256)) public bets;

    // outcome index => total pool for that outcome
    mapping(uint8 => uint256) public outcomePools;

    // Track bettors per outcome for enumeration
    mapping(uint8 => address[]) private _outcomeBettors;
    mapping(address => bool)    private _hasBet;
    mapping(address => uint8)   private _bettorOutcome; // Enforce single outcome per wallet

    // ─── Events ───────────────────────────────────────────────────────────────

    event BetPlaced(address indexed bettor, uint8 outcome, uint256 amount);
    event MarketLocked();
    event MarketResolved(uint8 winningOutcome);
    event WinningsClaimed(address indexed bettor, uint256 amount);
    event MarketCancelled();

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotOpen();
    error NotLocked();
    error NotResolved();
    error DeadlinePassed();
    error InvalidOutcome();
    error ZeroAmount();
    error AlreadyClaimed();
    error NotResolver();
    error NoWinnings();
    error AlreadyResolved();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    /**
     * @dev onlyResolver:
     *   - Real markets: only the oracle contract can call resolve().
     *   - Demo markets: only the contract owner can call resolve().
     *
     * During a demo, the teacher/presenter connects MetaMask as the owner
     * wallet and clicks the "Declare Winner" button in the Admin UI,
     * which calls resolve(outcomeIndex) directly — no Chainlink needed.
     */
    modifier onlyResolver() {
        if (isDemo) {
            if (msg.sender != owner()) revert NotResolver();
        } else {
            if (msg.sender != oracle) revert NotResolver();
        }
        _;
    }

    modifier onlyOpen() {
        if (state != State.Open) revert NotOpen();
        if (block.timestamp >= deadline) revert DeadlinePassed();
        _;
    }

    modifier onlyLocked() {
        if (state != State.Locked) revert NotLocked();
        _;
    }

    modifier onlyResolved() {
        if (state != State.Resolved) revert NotResolved();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address _owner,
        bytes32 _eventId,
        string[] memory _outcomes,
        uint256 _deadline,
        address _oracle,
        bool    _isDemo
    ) Ownable(_owner) {
        require(_outcomes.length >= 2, "Need at least 2 outcomes");
        require(_deadline > block.timestamp, "Deadline must be in future");

        eventId  = _eventId;
        outcomes = _outcomes;
        deadline = _deadline;
        oracle   = _oracle;
        isDemo   = _isDemo;
        state    = State.Open;
    }

    // ─── Betting ──────────────────────────────────────────────────────────────

    /**
     * @notice Place a bet on an outcome.
     * @param _outcome Index into the outcomes array (0, 1, 2, …)
     */
    function placeBet(uint8 _outcome)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyOpen
    {
        if (msg.value == 0) revert ZeroAmount();
        if (_outcome >= outcomes.length) revert InvalidOutcome();

        // If first bet from this user, track them
        if (!_hasBet[msg.sender]) {
            _hasBet[msg.sender] = true;
            _bettorOutcome[msg.sender] = _outcome;
        } else {
            require(_bettorOutcome[msg.sender] == _outcome, "Can only bet on one outcome per match");
        }

        // Track per-outcome bettor list for potential refunds
        if (bets[_outcome][msg.sender] == 0) {
            _outcomeBettors[_outcome].push(msg.sender);
        }

        // Checks-Effects-Interactions
        bets[_outcome][msg.sender] += msg.value;
        outcomePools[_outcome]     += msg.value;
        totalPool                  += msg.value;

        emit BetPlaced(msg.sender, _outcome, msg.value);
    }

    // ─── Market lifecycle ─────────────────────────────────────────────────────

    /**
     * @notice Lock the market — no more bets accepted.
     * @dev Called manually (demo) or by OracleClient before requesting result.
     */
    function lockMarket() external {
        require(
            msg.sender == owner() || msg.sender == oracle,
            "Only owner or oracle"
        );
        require(state == State.Open, "Not open");
        state = State.Locked;
        emit MarketLocked();
    }

    /**
     * @notice Resolve the market with the winning outcome.
     * @param _winningOutcome Index of the winning outcome.
     *
     * For demo markets: owner calls this via Admin UI button.
     * For real markets: OracleClient calls this after Chainlink Functions returns the result.
     */
    function resolve(uint8 _winningOutcome)
        external
        onlyResolver
        whenNotPaused
    {
        if (state == State.Resolved) revert AlreadyResolved();
        // Allow resolve from Locked state (normal) or Open state (emergency/demo shortcut)
        require(state == State.Locked || state == State.Open, "Cannot resolve");
        if (_winningOutcome >= outcomes.length) revert InvalidOutcome();

        // Checks-Effects-Interactions
        winningOutcome = _winningOutcome;
        state          = State.Resolved;

        emit MarketResolved(_winningOutcome);
    }

    /**
     * @notice Claim winnings after market is resolved.
     * @dev Uses Checks-Effects-Interactions to prevent re-entrancy.
     */
    function claimWinnings() external nonReentrant whenNotPaused onlyResolved {
        uint256 stake = bets[winningOutcome][msg.sender];
        if (stake == 0) revert NoWinnings();

        // Parimutuel Payout Logic (like Polymarket ratios)
        uint256 payout = (stake * totalPool) / outcomePools[winningOutcome];

        // Checks-Effects-Interactions: zero out stake BEFORE transfer
        bets[winningOutcome][msg.sender] = 0;

        emit WinningsClaimed(msg.sender, payout);

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");
    }

    // ─── Owner controls ───────────────────────────────────────────────────────

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @notice Finalize the market as fully settled.
     */
    function settleMarket() external onlyOwner onlyResolved {
        state = State.Settled;
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getOutcomesCount() external view returns (uint256) {
        return outcomes.length;
    }

    function getOutcome(uint8 index) external view returns (string memory) {
        require(index < outcomes.length, "Out of range");
        return outcomes[index];
    }

    function getBet(uint8 _outcome, address _bettor) external view returns (uint256) {
        return bets[_outcome][_bettor];
    }

    function getPotentialPayout(uint8 _outcome, address _bettor) external view returns (uint256) {
        uint256 stake = bets[_outcome][_bettor];
        if (stake == 0 || outcomePools[_outcome] == 0) return 0;
        return (stake * totalPool) / outcomePools[_outcome];
    }

    function getMarketInfo() external view returns (
        bytes32 _eventId,
        string[] memory _outcomes,
        uint256 _deadline,
        State   _state,
        uint256 _totalPool,
        bool    _isDemo,
        uint8   _winningOutcome
    ) {
        return (eventId, outcomes, deadline, state, totalPool, isDemo, winningOutcome);
    }
}
