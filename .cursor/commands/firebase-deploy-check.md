## Firebase Deploy Check

Decide whether recent commits need any Firebase deploy beyond Hosting.

**Range:** use the range the user gives (commits, `A..B`, branch). Otherwise use `@{upstream}..HEAD`; if there is no upstream or that range is empty, use `HEAD~1..HEAD`. State the range used.

Inspect with `git log --oneline <range>` and `git diff --stat <range>`, then read the relevant diffs.

### Deploy targets (from `firebase.json`)

| Changed | Target / action |
|---------|-----------------|
| `firestore.rules`, `firestore.indexes.json` | `firestore` (rules / indexes) |
| `storage.rules` | `storage` |
| `extensions/`, `extensions` key in `firebase.json` | `extensions` |
| `firestore` / `storage` / `extensions` / any new product key in `firebase.json` | that target |
| `cors.json` | Not a Firebase deploy — re-apply with `gcloud storage buckets update gs://<bucket> --cors-file=cors.json` |
| `src/`, `public/`, `index.html`, `vite.config.js`, `package*.json`, `hosting` key in `firebase.json` | `hosting` only |

### Code changes that need Firebase-side work without a file change

Scan the `src/` diff for these and flag any hit:

- **Firestore:** new collection/doc paths, new write shapes or fields the rules validate, new compound queries or `orderBy` that need an index
- **Storage:** new upload paths, content types, or size limits not covered by `storage.rules`
- **Auth:** new sign-in providers or authorized domains (Firebase console)
- **AI Logic / other SDKs:** newly imported Firebase products that must be enabled in the console or need App Check
- **Env:** new `VITE_FIREBASE_*` vars — must exist in `.env` before `npm run build`

### Output

Return only:

1. **Range** checked
2. **Verdict:** `Hosting only` or `Hosting + <targets>`
3. **Why:** one bullet per non-hosting finding (file or code location + what it affects); omit if hosting only
4. **Command:**

```bash
npm run build && npx firebase deploy --only hosting[,firestore:rules,storage,extensions,...]
```

Plus any manual console / `gcloud` steps. Do not run the deploy.
