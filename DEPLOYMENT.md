# Deployment Options

The Firebase CLI is bound to project `mock-test-a40aa` in `.firebaserc`. Firebase
Authentication and Firestore remain the backend for both deployment choices.

Before either deploy, publish the Firestore rules:

```powershell
firebase deploy --only firestore:rules --project mock-test-a40aa
```

Admin and scoring credentials must remain server-only. Never set
`FIREBASE_ADMIN_*` as `NEXT_PUBLIC_` variables or commit them to this repository.

## Vercel: Full Next.js App

Import this repository into Vercel and use its detected Next.js framework
settings. Add the public Firebase values from `.env.example`, plus
`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and
`FIREBASE_ADMIN_PRIVATE_KEY` as server environment variables. Vercel serves the
Next.js pages and the root `api/` scoring function. Leave
`NEXT_PUBLIC_SCORING_API_URL` unset so the app uses the same-origin API.
Set `SCORING_ALLOWED_ORIGINS` to the Firebase Hosting domains if you also deploy
the static frontend there.

For local development of the root Vercel function, use `npx vercel dev` after
linking the project. `npm run dev` starts only the Next.js frontend.

## Firebase Hosting: Static Frontend + Vercel API

This is the Firebase Spark option. The static frontend is exported to `out/` and
deployed to site `competetiveexamprep`; the Vercel scoring function remains the
server. It keeps answer keys private while Firebase Hosting, Auth, and Firestore
use the Spark project.

1. Deploy the full app to Vercel first. Copy its production origin, for example
	`https://your-app.vercel.app`.
2. In Vercel environment variables, set `SCORING_ALLOWED_ORIGINS` to
	`https://competetiveexamprep.web.app,https://competetiveexamprep.firebaseapp.com`.
	Add any custom Firebase Hosting domain you use.
3. In PowerShell, build the static frontend with the Vercel API origin:

```powershell
$env:NEXT_PUBLIC_SCORING_API_URL = "https://your-app.vercel.app"
npm run build:firebase
```

This build uses `output: "export"` and `trailingSlash: true`; tests use
`/test/?id=<test-id>` so routes can be generated statically. Do not set
`FIREBASE_STATIC_EXPORT` on the Vercel deployment.

4. Deploy the generated `out/` directory:

```powershell
firebase deploy --only hosting:competetiveexamprep --project mock-test-a40aa
```

The Hosting site target is mapped in `.firebaserc` and configured in
`firebase.json`. The app's admin page still requires an authenticated user with
the `admin: true` custom claim. Grant it from a trusted local environment after
setting Admin SDK credentials in `.env.local`:

```powershell
npm run set-admin-claim -- <firebase-user-uid>
```

Local API calls need the Vercel CLI because Next's development server does not
serve the root `api/` functions: use `npx vercel dev` after linking the Vercel
project. The Firebase-hosted frontend calls the production Vercel API origin.

## Firebase App Hosting

Firebase App Hosting can run the full Next.js app without a separate Vercel API,
but Firebase reported that billing must be enabled for this project. It remains
an optional paid alternative; do not enable it for the Spark-only path above.