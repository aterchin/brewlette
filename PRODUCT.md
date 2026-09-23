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
| **Edit** | Bartender | Add / edit / delete / reorder beers; reset to defaults |

Subtle control to enter Edit (e.g. “Edit beer list”). Do not put a giant admin UI on the wheel screen.

## Beer model

```js
{
  id: string,          // stable; never array index
  name: string,        // required
  brewery: string,
  style: string,
  abv: number | null,
  description: string,
  surprise: string     // optional fun payoff; omit UI if empty
}
```

Persistence key: `brewlette.beers.v1`. Corrupt or missing data → fall back to `src/data/defaultBeers.js` (~19 sample beers).

## Spin behavior

1. Lock against a second spin while animating  
2. Choose winner with `crypto.getRandomValues`  
3. Animate the wheel to land on that beer  
4. Reveal name → brewery/style/ABV → description → delayed surprise  
5. Optional **Remove this beer** (persist + return to spin) — never automatic  

## Design north star

Warm, slightly dark, modern, playful, bar-like. Not rustic craft-beer cliché, not neon, not corporate SaaS. Wheel is the entertainment; result is the payoff.

Primary target: **iPad portrait**. Also phone, desktop, iPad landscape.

## Decisions log

Record changes from the original build idea here so future chats don’t re-litigate them.

| When | Decision |
|------|----------|
| 2026-09-22 | Public GitHub repo `aterchin/brewlette`; build spec stays out of git |
| 2026-09-22 | Reorder beers with up/down buttons (no drag-and-drop) |
| 2026-09-22 | Focus / presentation mode **deferred** |

## Backlog

- [ ] Focus / presentation mode — hide Edit and secondary chrome while spinning (no fullscreen API required)
- [ ] Multiple saved lists, shareable URLs, QR, public/customer mode
- [ ] Beer images, tap numbers, price, IBU, ratings
- [ ] Richer surprise types (challenge, discount, bartender instruction) — keep `surprise` a string until needed

Do not implement backlog items unless explicitly requested.
