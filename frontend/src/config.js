export const API_URL = "http://localhost:3000/api";
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CONTRACT_ABI = [
  "function createEvent(string memory _name, uint _deadline) external",
  "function betYes(uint eventId) external payable",
  "function betNo(uint eventId) external payable",
  "function reportResult(uint eventId, bool _result) external",
  "function claimReward(uint eventId) external",
  "function events(uint) view returns (uint id, string name, uint deadline, uint totalYes, uint totalNo, bool finished, bool result)",
  "function eventCount() view returns (uint)",
  "function yesBets(uint, address) view returns (uint)",
  "function noBets(uint, address) view returns (uint)",
  "function hasClaimed(uint, address) view returns (bool)"
];
