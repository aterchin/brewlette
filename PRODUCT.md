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

Subtle right-edge tab (“Edit beer list”) — outside the game column. Soft bartender password (default `brewlette`) unlocks for the browser tab session. Edit is its **own page** (game hidden): sticky compact beer list on the left updates live as fields change; editable form on the right. **Controls** (top-right, after Back to wheel) is a separate admin screen for reset-to-defaults, set default beer list, and change password — kept out of the beer-list product flow. Client-side PIN only.

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

List and wheel order by `number` ascending. Missing numbers (e.g. no #12) do not create empty wedges — only programmed beers appear.

Persistence key: `brewlette.beers.v1`. Corrupt or missing data → fall back to bartender-defined defaults (`brewlette.defaults.v1`) if set, else `src/data/defaultBeers.js` (current tap board; slot 12 blank / gap OK).

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
| 2026-09-22 | Edit entry is a right-edge tab outside the game column (not under the brand / EmptyState) |
| 2026-09-22 | Admin actions live on a separate Controls screen (reset defaults, set default beer list, change password) — not in the beer-list flow |
| 2026-09-22 | “Set default beer list” edits `brewlette.defaults.v1` (auto-saves on add/update/delete); used by Reset |

## Backlog

- [ ] Focus / presentation mode — hide Edit and secondary chrome while spinning (no fullscreen API required)
- [ ] Multiple saved lists, shareable URLs, QR, public/customer mode
- [ ] Beer images, price, IBU, ratings
- [ ] Richer surprise types (challenge, discount, bartender instruction) — keep `surprise` a string until needed

Do not implement backlog items unless explicitly requested.
