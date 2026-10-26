// Three-letter combinations that can't go on a public board.
const BLOCKED_INITIALS = new Set([
  'ASS', 'CUM', 'CUN', 'COK', 'DIK', 'DIX', 'FAG', 'FCK', 'FKU', 'FUC', 'FUK', 'FUQ', 'KKK',
  'KYK', 'NGA', 'NGR', 'NIG', 'PIS', 'SEX', 'SHT', 'SLT', 'TIT', 'TWT', 'VAG', 'WTF',
])

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const initials = typeof body?.initials === 'string' ? body.initials.toUpperCase() : ''
  if (!/^[A-Z]{3}$/.test(initials))
    throw createError({ statusCode: 400, statusMessage: 'Initials must be three letters' })
  if (BLOCKED_INITIALS.has(initials))
    throw createError({ statusCode: 400, statusMessage: 'Please pick different initials' })

  const { maxScore } = useRuntimeConfig(event).leaderboard
  const score = body?.score
  if (!Number.isSafeInteger(score) || score <= 0 || score > maxScore)
    throw createError({ statusCode: 400, statusMessage: 'Invalid score' })

  const names = LEADERBOARD_NAMES.filter((name) => body?.boards?.includes?.(name))
  if (!names.length) throw createError({ statusCode: 400, statusMessage: 'No leaderboard chosen' })

  const detail =
    typeof body?.detail === 'string' ? body.detail.replace(/\p{C}/gu, '').trim().slice(0, 40) : ''

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!(await allowLeaderboardSubmission(ip)))
    throw createError({ statusCode: 429, statusMessage: 'Too many scores, try again in a minute' })

  return submitLeaderboardEntry({ initials, score, detail, at: Date.now() }, names)
})
