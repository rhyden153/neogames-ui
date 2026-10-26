type LocalBest = { allTime: number; weekly: number; week: string }
export type LeaderboardRanks = Partial<Record<LeaderboardName, number>>

const INITIALS_KEY = 'neogames:initials'

/**
 * Global all-time and weekly top 10s for the game named in `runtimeConfig.public.leaderboard.game`.
 * This device's own bests are kept in localStorage, so a score is only offered to a board when it
 * beats the player's previous best for that board (all-time, or since Monday).
 */
export function useLeaderboard() {
  const { game } = useRuntimeConfig().public.leaderboard
  const bestKey = `neogames:${game}:best`
  const boards = useState<Leaderboards | null>('neogames-leaderboards', () => null)
  const failed = useState('neogames-leaderboards-failed', () => false)

  async function refresh() {
    try {
      boards.value = await $fetch<Leaderboards>('/api/leaderboard')
      failed.value = false
    } catch {
      failed.value = true
    }
    return boards.value
  }

  function readBest(): LocalBest {
    try {
      const stored = JSON.parse(localStorage.getItem(bestKey) || 'null')
      if (
        Number.isFinite(stored?.allTime) &&
        Number.isFinite(stored?.weekly) &&
        typeof stored?.week === 'string'
      )
        return stored
    } catch {}
    return { allTime: 0, weekly: 0, week: '' }
  }

  /**
   * Records a finished game against this device's bests, then returns the boards it should be
   * submitted to: those where it beats the previous local best and would make the top 10.
   */
  async function recordGame(score: number): Promise<LeaderboardName[]> {
    const week = leaderboardWeek()
    const best = readBest()
    const previous = { allTime: best.allTime, weekly: best.week === week ? best.weekly : 0 }
    try {
      localStorage.setItem(
        bestKey,
        JSON.stringify({
          allTime: Math.max(previous.allTime, score),
          weekly: Math.max(previous.weekly, score),
          week,
        }),
      )
    } catch {}
    if (score <= previous.allTime && score <= previous.weekly) return []
    const current = await refresh()
    if (!current) return []
    return LEADERBOARD_NAMES.filter(
      (name) => score > previous[name] && qualifiesForLeaderboard(score, current[name]),
    )
  }

  async function submit(
    entry: { initials: string; score: number; detail?: string },
    names: LeaderboardName[],
  ) {
    const result = await $fetch<Leaderboards & { ranks: LeaderboardRanks }>('/api/leaderboard', {
      method: 'POST',
      body: { ...entry, boards: names },
    })
    boards.value = result
    try {
      localStorage.setItem(INITIALS_KEY, entry.initials)
    } catch {}
    return result.ranks
  }

  function savedInitials() {
    try {
      return localStorage.getItem(INITIALS_KEY) ?? ''
    } catch {
      return ''
    }
  }

  return { boards, failed, refresh, recordGame, submit, savedInitials }
}
