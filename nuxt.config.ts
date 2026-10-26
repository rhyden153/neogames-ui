// Shared Nuxt layer for Neo Games titles. Games add it with
// `extends: ['github:rhyden153/neogames-ui']` in their nuxt.config.ts.
export default defineNuxtConfig({
  runtimeConfig: {
    leaderboard: {
      // Name of the env var holding the Redis connection URL (set by the Vercel storage integration).
      redisUrlEnv: 'REDIS_URL',
      maxScore: 10_000_000,
    },
    public: {
      // Leaderboard id for the game, such as 'asteroids'. The leaderboard API is off until it's set.
      leaderboard: { game: '' },
    },
  },
})
