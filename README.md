# Brewlette

A beer roulette / spinning-wheel app for bars. Pick a beer. Spin the thing. See what happens.

Designed primarily for an iPad behind the bar — bartender maintains the tap list, customers spin.

## Stack

- React + Vite (static site)
- HTML Canvas wheel
- Firestore `beer_lists/{uid}` — one tap list per bartender account
- Browser `localStorage` as the device cache (Spin Mode)
- Firebase Authentication (email/password + Google) for bartender Edit access

Copy `.env.example` → `.env` and fill Firebase project settings (`VITE_FIREBASE_*`). Enable Email/Password and Google in the Firebase console and create bartender accounts before signing in.

Deploy security rules from [`firestore.rules`](firestore.rules) (see `firebase.json`) so lists are publicly readable and only the owning bartender can write their doc.

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
- Cloud-synced tap list (one Firestore read per load; edits sync when signed in)
- Bartender edit page (Firebase sign-in): sticky list + form; Controls for reset-to-demo and sign out
- Touch-friendly controls and `prefers-reduced-motion` support

## Product notes

See [`PRODUCT.md`](PRODUCT.md) for the living product brief and backlog. Cursor agents load project rules from `.cursor/rules/`.
