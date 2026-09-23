# Brewlette

A beer roulette / spinning-wheel app for bars. Pick a beer. Spin the thing. See what happens.

Designed primarily for an iPad behind the bar — bartender maintains the tap list, customers spin.

## Stack

- React + Vite (static site)
- HTML Canvas wheel
- Browser `localStorage` (no backend, no auth, no API)

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
- Bartender editor: add / edit / delete / reorder / reset defaults
- Touch-friendly controls and `prefers-reduced-motion` support
