# Suniti's Pre Wedding Planner

A calm, responsive React + Vite app organized into six timeline stages:
1. Pre pre pre, months before
2. Pre pre, the week before
3. Thursday
4. Friday
5. Saturday
6. Sunday (3:00 AM start)

## Run locally

Install Node.js (LTS), then from this project folder:

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Build for production

```bash
npm run build
npm run preview
```

Vite outputs the production site to `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, import that repository.
3. Vercel should detect Vite automatically. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

## Shared plan (optional)

By default the plan is stored in `localStorage`, so it is private to one browser.
To let everyone share one live plan, point the app at a Firebase Realtime Database.

1. In the [Firebase console](https://console.firebase.google.com) create a project.
2. **Build → Realtime Database → Create Database**, pick any region.
3. In the **Rules** tab publish permanent open rules (the URL is the secret):

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

4. Copy the database URL and put it in a `.env.local` file next to `package.json`:

   ```
   VITE_FIREBASE_DB_URL=https://your-project-id-default-rtdb.firebaseio.com
   ```

5. Add the same variable in Vercel under **Settings → Environment Variables**
   (key `VITE_FIREBASE_DB_URL`, value the database URL, all environments), then redeploy.

How it behaves once configured:

- Everyone with the link edits the same plan.
- Changes are merged by timestamp, so two people editing at the same time do not
  overwrite each other.
- Deletions are kept as tombstones so a removal is not undone by a later merge.
- The sidebar shows `Saved to the shared plan`, `Saving…` or `Offline`.
- `localStorage` stays as a cache, so the app still opens if the database is unreachable.

## How it works

- Six timeline stages, with tasks grouped by what happens together.
- Checkboxes and status dropdowns.
- Add, rename, and remove tasks.
- Progress counts by stage and across the whole plan.
- Edits persist in the current browser using `localStorage`.
- Optionally, edits are shared through a Firebase Realtime Database (see above).
- No authentication, budget tracker, or vendor CRM.

## Important notes

- The source workbook's event dates are May 6 to 9, 2027. The app starts with those dates.
- Sunday begins at 3:00 AM, but the source workbook did not contain the full Sunday schedule. The app deliberately leaves that schedule as a placeholder rather than inventing events.
- The workbook had a few unresolved decisions and count/timing conflicts. Those are preserved as notes in the relevant task.
- Without the Firebase setup above, browser-local data is not shared across devices or between family members.

