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

## Contents

- `app/components/NeoGamesBanner.vue`: the "more games" banner linking to neogames.io.
- `public/neogames/banner.webp`: banner artwork, served at `/neogames/banner.webp`.
- `source/banner.png`: full-size original artwork, not served.

## Updating

Change the banner here, push, then rebuild each game. To pin a version, tag the
repo and extend `github:rhyden153/neogames-ui#v1.0.0`.
