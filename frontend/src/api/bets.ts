const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/api'
  : 'http://localhost:3001/api';

export const fetchUserBets = async (walletAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/bets/history?wallet=${walletAddress}`);
    if (!response.ok) {
      throw new Error(`Error fetching user bets: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch bets for user ${walletAddress}:`, error);
    return [];
  }
};
