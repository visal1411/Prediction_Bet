import { ethers } from 'ethers';

// Minimal ABI required for the interactions we need on the frontend
export const PREDICTION_MARKET_ABI = [
  "function placeBet(uint8 _outcome) external payable",
  "function claimWinnings() external",
  "function getMarketInfo() external view returns (bytes32 _eventId, string[] _outcomes, uint256 _deadline, uint8 _state, uint256 _totalPool, uint8 _winningOutcome)",
  "function getOutcome(uint8 index) external view returns (string)",
  "function getBet(uint8 _outcome, address _bettor) external view returns (uint256)",
  "function outcomePools(uint8) external view returns (uint256)",
  "function resolve(uint8 _winningOutcome) external",
  "function outcomes(uint256) external view returns (string)",
  "function pause() external",
  "function unpause() external",
  "function lockMarket() external"
];

export const getMarketContract = (address: string, providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(address, PREDICTION_MARKET_ABI, providerOrSigner);
};

export const MARKET_FACTORY_ABI = [
  "function getAllMarkets() external view returns (address[])",
  "function createMarket(bytes32 _eventId, string[] calldata _outcomes, uint256 _deadline) external returns (address)",
  "event MarketCreated(address indexed marketAddress, bytes32 indexed eventId, string[] outcomes, uint256 deadline)"
];

export const getFactoryContract = (address: string, providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(address, MARKET_FACTORY_ABI, providerOrSigner);
};

export const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
