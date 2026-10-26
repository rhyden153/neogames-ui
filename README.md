# neogames-ui

Shared Nuxt layer for the games in the [Neo Games](https://neogames.io) collection.

## Use it in a game

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['github:rhyden153/neogames-ui'],
})
```

Then place the banner at the bottom of the page:

```vue
<NeoGamesBanner />
```

The component is auto-imported. Its styles are scoped and self-contained, and it
sizes itself to the width it is given (container queries), so it looks the same in
every game. Add spacing from the host page, for example `<NeoGamesBanner class="mt" />`.

## Global leaderboards

Every game can have an all-time top 10 and a weekly top 10 (reset every Monday at
00:00 UTC), stored in one shared Redis database.

1. In the game's Vercel project, connect the shared Redis database under **Storage**.
   Note the env var it creates, for example `ASTEROIDS_SCORES_REDIS_URL`.
2. Install the Redis client in the game: `npm install redis`.
3. Name the game and point at that env var:

   ```ts
   // nuxt.config.ts
   export default defineNuxtConfig({
     extends: ['github:rhyden153/neogames-ui'],
     runtimeConfig: {
       leaderboard: { redisUrlEnv: 'ASTEROIDS_SCORES_REDIS_URL' },
       public: { leaderboard: { game: 'asteroids' } },
     },
   })
   ```

4. Use the auto-imported composable in the game's UI:

   ```ts
   const { boards, failed, refresh, recordGame, submit, savedInitials } = useLeaderboard()

   // When a game ends: returns the boards the score should be offered to ([] if none).
   const names = await recordGame(score)
   // After the player enters three-letter initials:
   const ranks = await submit({ initials, score, detail: 'Classic · Wave 7' }, names)
   ```

`recordGame` keeps this device's best all-time score and best score this week in
localStorage. A score is only offered to a board when it beats the matching local
best and would make that board's top 10, so a player doesn't fill the boards with
their own lower scores.

The game's server gets `GET /api/leaderboard` (both boards) and `POST /api/leaderboard`
(`{ initials, score, detail?, boards }`). The POST checks the initials (three letters,
with a small blocklist) and the score (an integer up to `runtimeConfig.leaderboard.maxScore`,
default 10,000,000), and allows 5 submissions per IP address per minute. Scores come
from the browser, so these checks stop casual tampering, not a determined cheater.

Keys are `scores:<game>:all-time` and `scores:<game>:week:<monday>`. Each weekly board
expires a week after it closes. Preview deployments and local dev use `preview:` and
`dev:` prefixed keys, so testing never touches the real boards.

## Contents

- `app/components/NeoGamesBanner.vue`: the "more games" banner linking to neogames.io.
- `app/composables/useLeaderboard.ts`: client side of the leaderboards.
- `server/api/leaderboard.*.ts`, `server/utils/leaderboard.ts`: leaderboard API and Redis storage.
- `shared/utils/leaderboard.ts`: leaderboard types and week math used by both.
- `public/neogames/banner.webp`: banner artwork, served at `/neogames/banner.webp`.
- `source/banner.png`: full-size original artwork, not served.

## Updating

Change the layer here, push, then rebuild each game. To pin a version, tag the
repo and extend `github:rhyden153/neogames-ui#v1.0.0`.

To try layer changes in a game before pushing, temporarily extend the local checkout
instead, for example `extends: ['../../neogames-ui']`.
