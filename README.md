# Ananya's Playlist

A quiet, cinematic personal music space. Phase 1 prototype — static site,
no backend, ready to open in a browser or deploy anywhere that serves
static files (Netlify, Vercel, GitHub Pages, etc).

## Running it locally

No build step. Just serve the folder, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000`. (Opening `index.html` directly by
double-clicking will *mostly* work, but some browsers block local audio
file loading over `file://` — a local server avoids that.)

## Adding your real songs

Open **`js/playlist-data.js`** — that's the only file you need to touch.
Drop your mp3 files into `assets/audio/` and list them there:

```js
{
  title: "Song Name",
  artist: "Artist Name",
  src: "assets/audio/your-file.mp3",
}
```

The five tracks included right now are gentle placeholder tones (not real
songs) so you can see and hear the player actually working before you add
your own music.

## Editing the letter / notes

Open **`js/notes-data.js`**. Each note is a small array of lines; a random
one is shown each time "If today feels heavy…" is opened. Add, remove, or
rewrite freely — same shape.

## Changing the artwork

Swap `assets/images/hero-artwork.png` for a new image (same filename, or
update the `<img>` `src` in `index.html`). If your new artwork doesn't have
any text baked into it, you can delete the `.title-scrim` element/rule —
it currently exists only to soften the title area of *this* piece of art so
the real, on-page title doesn't visually collide with text already in the
image.

## Instagram link

Update the `href` on the `.social-link` in `index.html` (currently a
placeholder: `instagram.com/yourusername`).

## Project structure

```
index.html            → all markup
css/style.css          → layout, color tokens, typography, components
css/animations.css     → every keyframe (glow, flare, particles, zoom…)
js/playlist-data.js    → EDIT ME — your songs
js/notes-data.js       → EDIT ME — your letter messages
js/player.js           → audio playback logic (play/pause/seek/volume/next/prev)
js/main.js             → playlist panel, the letter, particles, parallax
assets/audio/          → mp3 files
assets/images/         → artwork
```

## Notes on the placeholder audio

The five `.mp3` files in `assets/audio/` are synthesized ambient tones
generated for this prototype — not real music — purely so every player
control (play, pause, seek, duration, volume, next, previous, and the
playlist) is fully working out of the box. Replace them with your actual
songs whenever you're ready; nothing else needs to change.
