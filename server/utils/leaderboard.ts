import { createClient } from 'redis'

type RedisClient = ReturnType<typeof createClient>

let connection: Promise<RedisClient> | undefined

// One connection per server instance, reused across requests.
function redis() {
  connection ??= (async () => {
    const { redisUrlEnv } = useRuntimeConfig().leaderboard
    const url = process.env[redisUrlEnv]
    if (!url)
      throw createError({ statusCode: 503, statusMessage: 'Leaderboard storage is not configured' })
    const client = createClient({ url })
    client.on('error', (error) => console.error('[leaderboard]', error))
    await client.connect()
    return client
  })().catch((error) => {
    connection = undefined
    throw error
  })
  return connection
}

function leaderboardKeys(time = Date.now()) {
  const { game } = useRuntimeConfig().public.leaderboard
  if (!game) throw createError({ statusCode: 404, statusMessage: 'This game has no leaderboard' })
  // Production uses the bare keys; preview deployments and local dev get boards of their own.
  const env = process.env.VERCEL_ENV === 'production' ? '' : `${process.env.VERCEL_ENV || 'dev'}:`
  const base = `${env}scores:${game}`
  const weekStart = leaderboardWeekStart(time)
  return {
    allTime: `${base}:all-time`,
    weekly: `${base}:week:${leaderboardWeek(time)}`,
    rate: `${base}:rate`,
    week: leaderboardWeek(time),
    resetsAt: weekStart + 7 * LEADERBOARD_DAY,
  }
}

// Each sorted-set member leads with an inverted timestamp. Redis orders tied scores by member,
// so in a descending range the earlier of two equal scores comes first.
function encodeEntry({ initials, detail, at }: LeaderboardEntry) {
  return JSON.stringify({ o: 1e13 - at, i: initials, d: detail, at })
}

function decodeEntry({ value, score }: { value: string; score: number }): LeaderboardEntry {
  const { i, d, at } = JSON.parse(value)
  return { initials: i, score, detail: d, at }
}

export async function readLeaderboards(): Promise<Leaderboards> {
  const keys = leaderboardKeys()
  const client = await redis()
  const [allTime, weekly] = await Promise.all(
    [keys.allTime, keys.weekly].map((key) =>
      client.zRangeWithScores(key, 0, LEADERBOARD_SIZE - 1, { REV: true }),
    ),
  )
  return {
    week: keys.week,
    resetsAt: keys.resetsAt,
    allTime: allTime!.map(decodeEntry),
    weekly: weekly!.map(decodeEntry),
  }
}

/** Adds the entry to the named boards and returns the updated boards with its 1-based rank on each. */
export async function submitLeaderboardEntry(entry: LeaderboardEntry, names: LeaderboardName[]) {
  const keys = leaderboardKeys(entry.at)
  const client = await redis()
  const member = encodeEntry(entry)
  const transaction = client.multi()
  for (const name of names)
    transaction
      .zAdd(keys[name], { score: entry.score, value: member })
      .zRemRangeByRank(keys[name], 0, -LEADERBOARD_SIZE - 1)
  // Keep last week's board for a week after it closes, then let Redis drop it.
  if (names.includes('weekly'))
    transaction.expireAt(keys.weekly, Math.ceil((keys.resetsAt + 7 * LEADERBOARD_DAY) / 1000))
  await transaction.exec()

  const [boards, ...positions] = await Promise.all([
    readLeaderboards(),
    ...names.map((name) => client.zRevRank(keys[name], member)),
  ])
  const ranks: Partial<Record<LeaderboardName, number>> = {}
  names.forEach((name, index) => {
    const position = positions[index]
    if (typeof position === 'number') ranks[name] = position + 1
  })
  return { ...(boards as Leaderboards), ranks }
}

/** Allows `limit` submissions per IP address per minute. */
export async function allowLeaderboardSubmission(ip: string, limit = 5) {
  const key = `${leaderboardKeys().rate}:${ip}`
  const client = await redis()
  const count = await client.incr(key)
  if (count === 1) await client.expire(key, 60)
  return count <= limit
}
