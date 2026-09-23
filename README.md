# Brewlette

A beer roulette / spinning-wheel app for bars. Pick a beer. Spin the thing. See what happens.

Designed primarily for an iPad behind the bar — bartender maintains the tap list, customers spin.

## Stack

- React + Vite (static site)
- HTML Canvas wheel
- Browser `localStorage` / `sessionStorage` (no backend, no API)
- Soft bartender PIN (client-side only) for edit access

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static assets land in `dist/` and can be served by Nginx (e.g. on a Linode).

```bash
npm run preview
```

## Features

- Dynamic canvas wheel sized to the active beer list
- Crypto-backed random selection (animation lands on a pre-chosen winner)
- Result reveal with optional surprise message
- Optional “Remove this beer” after a spin
- Bartender edit page (password-gated): sticky list + form; Controls for reset-to-demo and password
- Touch-friendly controls and `prefers-reduced-motion` support

## Product notes

See [`PRODUCT.md`](PRODUCT.md) for the living product brief and backlog. Cursor agents load project rules from `.cursor/rules/`.
