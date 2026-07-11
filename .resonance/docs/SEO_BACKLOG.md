# SEO Backlog: WolfGang

Date: 2026-07-11. Owner: PIRATE GmbH. WolfGang is a multiplayer Werewolf web game (React + Vite + Firebase Firestore), a phone-moderated party game for people in the same room. Reference: `docs/AUDIT_FINDINGS.md`.

## SEO is a landing-surface concern only

WolfGang is an app, not content. Nobody finds a Werewolf party game by reading ten blue links; they find it because a friend shares the room link across the table. There is no keyword demand to chase and no content strategy this product needs, and inventing one would be dishonest work. This backlog is deliberately short: make the app's public URL clean and shareable, give it a real title card so a pasted link does not look broken, describe it to machines once, and lean on the already-good `23moments.com/wolfgang` marketing page as the actual indexable surface. That is the whole honest scope.

## Current state

- Not in GSC as its own property, and it does not need to be: the game is served at `https://wolfgang.23moments.com`, which is a subdomain of `23moments.com`. The 23moments **domain** property already covers every subdomain, so WolfGang is already in Search Console under 23moments. No separate verification is required.
- Live check (2026-07-11): `wolfgang.23moments.com` returns the game (a 444-byte SPA shell, `<title>WolfGang</title>`). The app renders client-side, so a crawler sees only the shell, not the Landing-screen pitch.
- Important URL finding: `wolfgang.vercel.app` is **not** this game. It currently serves an unrelated project ("Wolfgang Hoeltgen - UARE.AI"). The Firebase hosting URLs (`wolfgang-67846.web.app` / `.firebaseapp.com`) return "Site Not Found". So the one true public URL is the custom domain `wolfgang.23moments.com`; do not link to the vercel.app alias anywhere.
- `index.html` is a bare Vite scaffold: `<html lang="en">` on a German-first app, a generic `<title>WolfGang</title>`, a favicon, and nothing else. No description, no Open Graph, no Twitter card, no structured data.

## Core opportunity (honest)

The indexable, content-rich surface for this game already exists and is not the app: it is the static `23moments.com/wolfgang` landing (DE-first title, self-canonical, real copy). Send all discovery there. The app itself only needs to (a) live at one confirmed URL, and (b) produce a decent preview when its link is shared in chat. Both are quick.

## Prioritized backlog

### Technical / URL

1. **Confirm and standardize on `wolfgang.23moments.com` as the public URL.** Verify the production deploy actually plays there (the app needs `VITE_FIREBASE_*` env vars set on the Vercel project; a bare shell that never leaves the loading spinner means those are missing). Then use that URL everywhere: the 23moments landing CTA, the game schema, any share text. Retire references to `wolfgang.vercel.app` (it belongs to another app).
2. **No separate GSC property.** It is covered by the 23moments domain property. Just confirm `wolfgang.23moments.com` shows up there and is indexed via URL Inspection (understanding that a client-rendered SPA shell has almost nothing for Google to index, which is expected and fine).

### On-page (the app shell)

3. **Give `index.html` a real title and meta.** Set `<html lang="de">` (DE-first), a title like "WolfGang - Werwolf ohne Spielleiter", a one-line description, and a theme color. This is what a browser tab and a search snippet show.
4. **Add Open Graph and Twitter tags with an image.** A party game lives on shared links (WhatsApp, Discord, the group chat). Without OG tags a pasted `wolfgang.23moments.com` renders as a bare URL. Add `og:title`, `og:description`, `og:image` (a 1200x630 card), `og:url`, and `twitter:card=summary_large_image`. This is the single highest-value change here because sharing is how the game actually spreads.

### Structured data

5. **One `VideoGame` entry.** Either in the app's `index.html` or, better, on the `23moments.com/wolfgang` landing (the indexable page): `VideoGame` with `name`, `description`, `genre` "social deduction / Werewolf", `gamePlatform: "Web Browser"`, `playMode: MultiPlayer`, `applicationCategory: Game`, `publisher` (PIRATE GmbH / 23moments), and `url` = `https://wolfgang.23moments.com`. Validate once in the Rich Results test and move on.

### Trust (not SEO, but it gates a German-facing launch)

6. **Impressum and Datenschutzhinweis.** The app has neither and is German-facing (the audit flagged this, plus Google Fonts hotlinking and un-gated Firebase Analytics). The 23moments landing carries the legal pages, so the cleanest fix is to route the app's footer to those, or add minimal links. This is a launch requirement, not a ranking factor.

## Measurement

- There is nothing meaningful to measure in GSC for the app URL itself, and pretending otherwise would be noise. The honest metric is on the `23moments.com/wolfgang` landing (see the 23moments backlog): does it get indexed and does the brand/game-name query surface it. The app's success metric is product, not search.

## Owner actions

- Confirm `VITE_FIREBASE_*` env vars are set on the Vercel "wolfgang" project so the game actually plays at `wolfgang.23moments.com`.
- Decide whether to also claim a clean, unused Vercel alias or simply keep the custom subdomain (the subdomain is sufficient).
- Provide or confirm the OG share image.
