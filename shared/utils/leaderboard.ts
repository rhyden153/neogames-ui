// Leaderboard types and rules shared by the /api/leaderboard routes and useLeaderboard().

export type LeaderboardName = 'allTime' | 'weekly'

export interface LeaderboardEntry {
  initials: string
  score: number
  /** Game-specific note shown under the score, such as "Classic · Wave 7". */
  detail: string
  /** When the score was submitted, in ms since the epoch. */
  at: number
}

export interface Leaderboards {
  /** Monday (UTC) that starts the current weekly board, as YYYY-MM-DD. */
  week: string
  /** When the weekly board resets, in ms since the epoch. */
  resetsAt: number
  allTime: LeaderboardEntry[]
  weekly: LeaderboardEntry[]
}

export const LEADERBOARD_SIZE = 10
export const LEADERBOARD_NAMES: readonly LeaderboardName[] = ['allTime', 'weekly']
export const LEADERBOARD_DAY = 86_400_000

/** Start of the leaderboard week (Monday 00:00 UTC) that contains `time`. */
export function leaderboardWeekStart(time = Date.now()) {
  const day = Math.floor(time / LEADERBOARD_DAY)
  // Day 0 of the epoch was a Thursday, so (day + 3) % 7 is the number of days since Monday.
  return (day - ((day + 3) % 7)) * LEADERBOARD_DAY
}

export function leaderboardWeek(time = Date.now()) {
  return new Date(leaderboardWeekStart(time)).toISOString().slice(0, 10)
}

/** Ties go to the earlier score, so a score has to beat 10th place to get on a full board. */
export function qualifiesForLeaderboard(score: number, entries: LeaderboardEntry[]) {
  return score > 0 && (entries.length < LEADERBOARD_SIZE || score > entries.at(-1)!.score)
}
