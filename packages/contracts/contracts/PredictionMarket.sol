// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PredictionMarket is ReentrancyGuard {
    enum MarketState { Open, Locked, Resolved, Settled }

    bytes32 public immutable eventId;
    uint256 public immutable bettingDeadline;
    uint8 public immutable numberOfOutcomes;
    address public immutable oracle;

    MarketState public state;
    uint8 public winningOutcome;
    uint256 public totalPool;
    
    // Mapping of outcome => total staked on that outcome
    mapping(uint8 => uint256) public outcomePools;
    
    // Mapping of user => outcome => staked amount
    mapping(address => mapping(uint8 => uint256)) public bets;
    
    // Mapping to track if a user has claimed their winnings
    mapping(address => bool) public hasClaimed;

    event BetPlaced(address indexed user, uint8 outcome, uint256 amount);
    event MarketLocked();
    event MarketResolved(uint8 winningOutcome);
    event WinningsClaimed(address indexed user, uint256 amount);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this");
        _;
    }

    constructor(
        bytes32 _eventId,
        uint256 _bettingDeadline,
        uint8 _numberOfOutcomes,
        address _oracle
    ) {
        eventId = _eventId;
        bettingDeadline = _bettingDeadline;
        numberOfOutcomes = _numberOfOutcomes;
        oracle = _oracle;
        state = MarketState.Open;
    }

    function placeBet(uint8 outcome) external payable nonReentrant {
        require(state == MarketState.Open, "Market is not open");
        require(block.timestamp < bettingDeadline, "Betting deadline has passed");
        require(outcome < numberOfOutcomes, "Invalid outcome");
        require(msg.value > 0, "Bet amount must be greater than 0");

        bets[msg.sender][outcome] += msg.value;
        outcomePools[outcome] += msg.value;
        totalPool += msg.value;

        emit BetPlaced(msg.sender, outcome, msg.value);
    }

    // Called by the oracle (mocked for local dev) to set the result
    function resolve(uint8 _winningOutcome) external onlyOracle {
        require(state == MarketState.Open || state == MarketState.Locked, "Market already resolved");
        require(_winningOutcome < numberOfOutcomes, "Invalid outcome");
        
        // If resolution comes after deadline, lock it first if not already
        if (state == MarketState.Open && block.timestamp >= bettingDeadline) {
            state = MarketState.Locked;
            emit MarketLocked();
        }

        winningOutcome = _winningOutcome;
        state = MarketState.Resolved;

        emit MarketResolved(_winningOutcome);
    }

    function claimWinnings() external nonReentrant {
        require(state == MarketState.Resolved, "Market not yet resolved");
        require(!hasClaimed[msg.sender], "Winnings already claimed");
        
        uint256 userStake = bets[msg.sender][winningOutcome];
        require(userStake > 0, "No winning bets for this address");

        uint256 winningPool = outcomePools[winningOutcome];
        
        // Calculation: Proportional share of the total pool
        // payout = userStake * (totalPool / winningPool)
        uint256 payout = (userStake * totalPool) / winningPool;
        
        hasClaimed[msg.sender] = true;
        
        // Transfer ETH
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit WinningsClaimed(msg.sender, payout);
    }
}
