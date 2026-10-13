<script setup lang="ts">
// Shared "more games" banner for every Neo Games title. Styles are scoped and
// self-contained so the host game's global CSS cannot change how it looks.
const id = useId()
</script>

<template>
  <section class="neo-banner" aria-label="Neo Games collection">
    <a class="card" href="https://neogames.io" :aria-labelledby="`${id}-title ${id}-cta`">
      <div class="media">
        <img src="/neogames/banner.webp" alt="Neo Games arcade collection" width="1280" height="671" loading="lazy">
      </div>
      <div class="copy">
        <span class="eyebrow">THE ARCADE CONTINUES <span class="domain">· NEOGAMES.IO</span></span>
        <h2 :id="`${id}-title`">More classics.<br>More high scores.</h2>
        <p>A growing library of modern takes on classic games. Find your next favorite in the Neo Games collection.</p>
        <span :id="`${id}-cta`" class="cta">
          Explore more games
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </span>
      </div>
    </a>
  </section>
</template>

<style scoped>
.neo-banner {
  --neo-accent: #eaa157;
  --neo-mono: 'Courier New', monospace;
  container-type: inline-size;
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-align: left;
}
.card { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); color: #e9e5db; text-decoration: none; overflow: hidden; border: 1px solid #3d3c38; border-radius: 12px; background: linear-gradient(135deg, #1f201e, #181918 60%, #121212); box-shadow: 0 12px 35px #0004, inset 0 1px 0 #ffffff0d; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.card:hover { border-color: #8a6440; box-shadow: 0 16px 40px #0006, 0 0 0 1px #eaa15722, inset 0 1px 0 #ffffff0d; transform: translateY(-2px); }
.card:focus-visible { outline: 2px solid var(--neo-accent); outline-offset: 4px; }
.media { position: relative; overflow: hidden; background: #111; border-right: 1px solid #2c2c29; }
.media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 70%, #12121266); pointer-events: none; }
.media img { display: block; width: 100%; height: 100%; aspect-ratio: 1280/671; object-fit: cover; object-position: left center; transform-origin: left center; transition: transform .5s ease; }
.card:hover .media img { transform: scale(1.025); }
.copy { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 32px 36px; }
.eyebrow { font: 10px/1.5 var(--neo-mono); letter-spacing: 1.8px; color: #93928d; margin: 0 0 14px; }
.domain { color: var(--neo-accent); }
h2 { font: 800 26px/1.15 Arial, Helvetica, sans-serif; letter-spacing: -.6px; text-transform: none; color: #f1ece1; margin: 0 0 14px; }
p { font-size: 13px; line-height: 1.75; color: #a8a59c; margin: 0 0 24px; max-width: 34ch; }
.cta { display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #eaa15799; border-radius: 3px; font: bold 11px var(--neo-mono); letter-spacing: .6px; text-transform: uppercase; color: var(--neo-accent); transition: background .2s ease, color .2s ease, border-color .2s ease; }
.cta svg { width: 16px; height: 16px; transition: transform .2s ease; }
.card:hover .cta { background: var(--neo-accent); border-color: var(--neo-accent); color: #201d19; }
.card:hover .cta svg { transform: translateX(3px); }
/* Sized by the space the host page gives the banner, not the viewport. */
@container (max-width: 900px) {
  .card { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }
  .copy { padding: 24px 26px; }
  h2 { font-size: 21px; }
  p { font-size: 12px; margin-bottom: 18px; }
}
@container (max-width: 620px) {
  .card { grid-template-columns: 1fr; border-radius: 10px; }
  .media { border-right: 0; border-bottom: 1px solid #2c2c29; }
  .media::after { display: none; }
  .copy { padding: 22px 20px 24px; }
  h2 { font-size: 22px; }
  p { max-width: none; }
  .cta { width: 100%; justify-content: space-between; }
}
@media (prefers-reduced-motion: reduce) {
  .card, .media img, .cta, .cta svg { transition: none; }
  .card:hover, .card:hover .media img, .card:hover .cta svg { transform: none; }
}
</style>
