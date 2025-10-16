import { executeQuery } from "../db";

export interface PlayerMatchStats {
  email: string;
  score: number;
  matchDuration: number;
  isWinner: boolean;
}

interface UserStatsRow {
  email: string;
  wins: number;
  losses: number;
  total_time_played: number;
  total_games_played: number;
  highest_score: number;
  total_matched_pairs: number;
}

export interface UserStats {
  email: string;
  wins: number;
  losses: number;
  totalTimePlayed: number;
  totalGamesPlayed: number;
  highestScore: number;
  totalMatchedPairs: number;
}

const UPSERT_USER_STATS_SQL = `
  INSERT INTO user_stats (
    email,
    wins,
    losses,
    total_time_played,
    total_games_played,
    highest_score,
    total_matched_pairs
  ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (email) DO UPDATE SET
    wins = user_stats.wins + EXCLUDED.wins,
    losses = user_stats.losses + EXCLUDED.losses,
    total_time_played = user_stats.total_time_played + EXCLUDED.total_time_played,
    total_games_played = user_stats.total_games_played + EXCLUDED.total_games_played,
    highest_score = GREATEST(user_stats.highest_score, EXCLUDED.highest_score),
    total_matched_pairs = user_stats.total_matched_pairs + EXCLUDED.total_matched_pairs
  RETURNING *;
`;

const GET_ALL_STATS_SQL = `
  SELECT email,
         wins,
         losses,
         total_time_played,
         total_games_played,
         highest_score,
         total_matched_pairs
    FROM user_stats
    ORDER BY wins DESC, highest_score DESC;
`;

const GET_STATS_BY_EMAIL_SQL = `
  SELECT email,
         wins,
         losses,
         total_time_played,
         total_games_played,
         highest_score,
         total_matched_pairs
    FROM user_stats
   WHERE email = $1;
`;

export async function upsertUserStatsForMatch(
  playerStats: PlayerMatchStats
): Promise<void> {
  const winsIncrement = playerStats.isWinner ? 1 : 0;
  const lossesIncrement = playerStats.isWinner ? 0 : 1;
  const timePlayed = Number.isFinite(playerStats.matchDuration)
    ? playerStats.matchDuration
    : 0;
  const score = playerStats.score ?? 0;

  await executeQuery<UserStatsRow>(UPSERT_USER_STATS_SQL, [
    playerStats.email,
    winsIncrement,
    lossesIncrement,
    timePlayed,
    1,
    score,
    score,
  ]);
}

function mapRow(row: UserStatsRow): UserStats {
  return {
    email: row.email,
    wins: row.wins,
    losses: row.losses,
    totalTimePlayed: row.total_time_played,
    totalGamesPlayed: row.total_games_played,
    highestScore: row.highest_score,
    totalMatchedPairs: row.total_matched_pairs,
  };
}

export async function getAllUserStats(): Promise<UserStats[]> {
  const rows = await executeQuery<UserStatsRow>(GET_ALL_STATS_SQL);
  return rows.map(mapRow);
}

export async function getUserStatsByEmail(
  email: string
): Promise<UserStats | null> {
  const rows = await executeQuery<UserStatsRow>(GET_STATS_BY_EMAIL_SQL, [
    email,
  ]);
  const row = rows[0];
  return row ? mapRow(row) : null;
}
