// Dummy Object Example
export const userStatsMock = {
  email: "lorenz@mail.com",
  wins: 10,
  losses: 7,
  winRate: 58.82, // Calculated as (wins / totalGames) * 100
  totalTimePlayed: 3600,
  totalGamesPlayed: 17, // Calculated as wins + losses
  averageGameDuration: 210, // Calculated as totalTimePlayed / totalGames
  highestScore: 5,
  totalMatchedPairs: 8,
};

// In the database:
// email
// wins
// losses
// totalTimePlayed
// totalGamesPlayed
// highestScore
// totalMatchedPairs
