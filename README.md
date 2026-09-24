# Brewlette

A beer roulette / spinning-wheel app for bars. Pick a beer. Spin the thing. See what happens.

Designed primarily for an iPad behind the bar — bartender maintains the tap list, customers spin.

## Stack

- React + Vite (static site)
- HTML Canvas wheel
- Browser `localStorage` for the beer list
- Firebase Authentication (email/password + Google) for bartender Edit access

Copy `.env` keys from Firebase project settings (`VITE_FIREBASE_*`). Enable Email/Password and Google in the Firebase console and create or allow a bartender account before signing in.

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
- Bartender edit page (Firebase sign-in): sticky list + form; Controls for reset-to-demo and sign out
- Touch-friendly controls and `prefers-reduced-motion` support

## Product notes

See [`PRODUCT.md`](PRODUCT.md) for the living product brief and backlog. Cursor agents load project rules from `.cursor/rules/`.
