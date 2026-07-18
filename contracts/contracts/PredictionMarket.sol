// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    struct Event {
        uint id;
        string name;
        uint deadline;
        uint totalYes;
        uint totalNo;
        bool finished;
        bool result;
    }

    address public oracle;
    uint public eventCount;

    mapping(uint => Event) public events;
    mapping(uint => mapping(address => uint)) public yesBets;
    mapping(uint => mapping(address => uint)) public noBets;
    mapping(uint => mapping(address => bool)) public hasClaimed;

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this");
        _;
    }

    constructor() {
        oracle = msg.sender;
    }

    // Admin creates an event
    function createEvent(string memory _name, uint _deadline) external onlyOracle {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        eventCount++;
        events[eventCount] = Event({
            id: eventCount,
            name: _name,
            deadline: _deadline,
            totalYes: 0,
            totalNo: 0,
            finished: false,
            result: false
        });
    }

    // Bet YES
    function betYes(uint eventId) external payable {
        require(eventId > 0 && eventId <= eventCount, "Invalid event id");
        require(block.timestamp < events[eventId].deadline, "Betting has ended");
        require(msg.value > 0, "Must send ETH");

        events[eventId].totalYes += msg.value;
        yesBets[eventId][msg.sender] += msg.value;
    }

    // Bet NO
    function betNo(uint eventId) external payable {
        require(eventId > 0 && eventId <= eventCount, "Invalid event id");
        require(block.timestamp < events[eventId].deadline, "Betting has ended");
        require(msg.value > 0, "Must send ETH");

        events[eventId].totalNo += msg.value;
        noBets[eventId][msg.sender] += msg.value;
    }

    // Oracle submits the result (true = YES wins, false = NO wins)
    function reportResult(uint eventId, bool _result) external onlyOracle {
        require(eventId > 0 && eventId <= eventCount, "Invalid event id");
        require(!events[eventId].finished, "Event already finished");
        require(block.timestamp >= events[eventId].deadline, "Event not ended yet");

        events[eventId].result = _result;
        events[eventId].finished = true;
    }

    // Claim reward
    function claimReward(uint eventId) external {
        require(eventId > 0 && eventId <= eventCount, "Invalid event id");
        require(events[eventId].finished, "Result not finalized yet");
        require(!hasClaimed[eventId][msg.sender], "Already claimed");

        Event memory e = events[eventId];
        uint userBet;
        uint winningPool;
        uint losingPool;

        if (e.result == true) { // YES won
            userBet = yesBets[eventId][msg.sender];
            winningPool = e.totalYes;
            losingPool = e.totalNo;
        } else { // NO won
            userBet = noBets[eventId][msg.sender];
            winningPool = e.totalNo;
            losingPool = e.totalYes;
        }

        require(userBet > 0, "You didn't bet or bet on the wrong side");

        hasClaimed[eventId][msg.sender] = true;

        // Reward calculation logic:
        // You get your bet back + your share of the losing pool
        uint reward = userBet + ((userBet * losingPool) / winningPool);

        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Transfer failed");
    }
}
