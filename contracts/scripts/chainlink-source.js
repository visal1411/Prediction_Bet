/**
 * chainlink-source.js
 *
 * JavaScript executed on Chainlink DON (Decentralised Oracle Network) nodes.
 * This script fetches the result of a sports game from SportsData.io and
 * returns the winning outcome index as a uint256.
 *
 * Outcome encoding:
 *   0 = Home Win
 *   1 = Away Win
 *   2 = Draw
 *
 * The API key is stored as an encrypted DON secret and accessed via `secrets`.
 * The eventId (SportsData.io GameID) is passed in `args[0]`.
 */

const gameId = args[0];
const apiKey = secrets.SPORTSDATA_API_KEY;

if (!apiKey) {
  throw Error("SPORTSDATA_API_KEY secret not configured");
}

if (!gameId) {
  throw Error("Game ID argument missing");
}

// Fetch game result from SportsData.io soccer endpoint (dev sandbox)
const response = await Functions.makeHttpRequest({
  url: `https://api.sportsdata.io/v3/soccer/scores/json/GameByGameID/${gameId}`,
  headers: {
    "Ocp-Apim-Subscription-Key": apiKey,
    "Content-Type": "application/json",
  },
  timeout: 9000,
});

if (response.error) {
  throw Error(`HTTP Error: ${response.error}`);
}

const game = response.data;

if (!game) {
  throw Error("No game data returned");
}

// Only resolve if the game is final
if (game.Status !== "Final") {
  throw Error(`Game not yet finished. Status: ${game.Status}`);
}

// Determine outcome
let outcome;
if (game.HomeTeamScore > game.AwayTeamScore) {
  outcome = 0; // Home Win
} else if (game.HomeTeamScore < game.AwayTeamScore) {
  outcome = 1; // Away Win
} else {
  outcome = 2; // Draw
}

// Return encoded uint256 outcome index
return Functions.encodeUint256(outcome);
