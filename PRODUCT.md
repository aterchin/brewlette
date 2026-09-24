# Brewlette — product brief

Living source of truth for what Brewlette is and where it’s going. Edit this when UX or scope decisions change. Agents should follow [`.cursor/rules/brewlette.mdc`](.cursor/rules/brewlette.mdc) for hard constraints and this file for product intent.

The original build write-up lives locally as `Brewlette-Cursor-Build-Spec.md` (gitignored). Prefer updating **this** file over treating that spec as frozen law.

---

## Concept

Brewlette is a beer roulette / spinning-wheel web app for use on an iPad behind a bar. A bartender maintains the tap list; customers spin to randomly pick a beer.

> Pick a beer. Spin the thing. See what happens.

## Modes

| Mode | Who | Job |
|------|-----|-----|
| **Spin** (default) | Customers / bar floor | Dominated by the canvas wheel + Spin; theatrical result reveal |
| **Edit** | Bartender | Full edit page: sticky compact list (left) + form (right) |
| **Controls** | Bartender | From Edit top bar: reset to demo sample list, sign out |

Subtle bottom-right gear icon — outside the game column. Firebase Auth (email/password or Google) unlocks Edit; Spin Mode stays public. Edit is its **own page** (game hidden): sticky compact beer list on the left updates live as fields change; editable form on the right. **Controls** is a third screen for admin actions only — not a second beer-list editor.

## Beer model

```js
{
  id: string,          // stable; never array index
  number: number,      // bartender-assigned slot; unique; gaps allowed
  name: string,        // required
  brewery: string,
  style: string,
  abv: number | null,
  description: string,
  surprise: string     // optional fun payoff; omit UI if empty
}
```

List and wheel order by `number` ascending. Missing numbers (e.g. no #12) do not create empty wedges — only programmed beers appear. Cap: **20 beers** per list.

One live list per signed-in bartender. Source of truth: Firestore `beer_lists/{uid}`. Browser `localStorage` key `brewlette.beers.v1` is the device cache (what Spin Mode uses). On sign-in: load that user’s cloud list onto the device. Edits while signed in write local + cloud. Corrupt or missing data → fall back to the built-in sample set in `src/data/sampleBeers.js` (demo tap board; slot 12 blank / gap OK). **Reset to demo** replaces the live list with that sample set. There is no separate editable defaults list.

### Firestore document (`beer_lists/{uid}`)

| Field | Type | Notes |
|-------|------|--------|
| `userId` | string | Same as document id (the bartender’s Auth UID) |
| `updatedAt` | timestamp | Server timestamp on write |
| `beers` | array | Up to 20 beer maps (`id`, `number`, `name` required; optional `brewery`, `style`, `abv`, `description`, `surprise`) |

Public read; write only if `request.auth.uid == uid`. Rules live in [`firestore.rules`](firestore.rules).

## Spin behavior

1. Lock against a second spin while animating  
2. Choose winner with `crypto.getRandomValues`  
3. Animate the wheel to land on that beer  
4. Reveal name → brewery/style/ABV → description → delayed surprise  
5. Optional **Remove this beer** (persist + return to spin) — never automatic  

## Design north star

**Taproom Roulette** — vintage mid-century editorial + late-night dive bar. Marquee/poster type, polaroid result cards, chunky borders, hard shadows, mechanical carnival wheel. See [`.cursorrules`](.cursorrules).

Not corporate SaaS, not pastel, not purple gradients, not Inter/Roboto.

Primary targets: **tablet** (portrait/landscape) and desktop. Wheel is the entertainment; result is the payoff.

## Decisions log

Record changes from the original build idea here so future chats don’t re-litigate them.

| When | Decision |
|------|----------|
| 2026-09-22 | Public GitHub repo `aterchin/brewlette`; build spec stays out of git |
| 2026-09-22 | Beer `number` is bartender-assigned (unique, gaps OK); order by number, not array index; no up/down reorder |
| 2026-09-22 | Edit/Add uses replace view (hides list while form is open) |
| 2026-09-22 | Focus / presentation mode **deferred** |
| 2026-09-22 | Typography: Poller One (brand), Abril Fatface (display), Arvo (UI) |
| 2026-09-22 | Visual system: Taproom Roulette (`.cursorrules`) — dive palette, polaroid cards, chunky borders, mechanical wheel |
| 2026-09-22 | Soft bartender password (default `brewlette`, settable in UI); unlock lasts until tab closes |
| 2026-09-22 | Edit is its own page: sticky compact list (left) + form (right); list updates live while editing |
| 2026-09-23 | Edit entry is a subtle bottom-right gear icon (not a right-edge tab) |
| 2026-09-22 | Admin actions live on a separate Controls screen (reset, change password) — not in the beer-list flow |
| 2026-09-23 | One live beer list only; built-in `sampleBeers.js` is demo/reset fodder — no editable defaults list / `brewlette.defaults.v1` |
| 2026-09-24 | Firebase Auth (email/password + Google) replaces soft PIN for Edit; Controls shows account + sign out; beers still local; Facebook dropped |
| 2026-09-24 | Firestore `beer_lists/{uid}` per bartender + localStorage device cache; public read; owner-only writes; max 20 beers; field `surprise` |

## Backlog

- [ ] Focus / presentation mode — hide Edit and secondary chrome while spinning (no fullscreen API required)
- [ ] Multiple saved lists, shareable URLs, QR, public/customer mode
- [ ] Beer images, price, IBU, ratings
- [ ] Richer surprise types (challenge, discount, bartender instruction) — keep `surprise` a string until needed

Do not implement backlog items unless explicitly requested.
