# Mock Test Platform

## Setup

Install the project dependencies with `npm install`. Copy `.env.example` to
`.env.local` and replace each placeholder with the corresponding value from your
Firebase project's web app configuration. Enable Email/Password sign-in and
create a Cloud Firestore database in the Firebase console before using auth or
database features.

Set `NEXT_PUBLIC_ADMIN_PIN` in `.env.local` to show the admin UI. This is only a
convenience gate; writes also require a signed-in Firebase user with the trusted
`admin: true` custom claim. Set that claim only from a trusted Firebase Admin
SDK environment. The provided [firestore.rules](firestore.rules) keeps answer
keys admin-only and saved results owner-readable. Deploy the rules with
`firebase deploy --only firestore:rules --project <firebase-project-id>` or paste
the file into the Firestore Rules tab in the Firebase console.

For server-side scoring, add the service account's project ID, client email, and
private key to `.env.local` as `FIREBASE_ADMIN_PROJECT_ID`,
`FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY`. Keep these values
server-only. Use a service account key from Firebase project settings, encode
newlines in the private key as `\n`, and add the same values as server environment
variables in Vercel. Never use `NEXT_PUBLIC_` for these credentials. The test
runner sends Firebase ID tokens for signed-in users; guest scores are returned
without saving a result.

For the UI alone, run `npm run dev` and open `http://localhost:3000`. To test
the Vercel scoring function locally, run `npx vercel dev` after linking the
project.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for both deployment paths: the full Next.js
app on Vercel, or a Firebase Spark static frontend backed by the Vercel scoring
API. Firebase App Hosting is also described as an optional billing-required
alternative.

The Firebase client exports are in `src/lib/firebase.js`: `app`, `auth`, and
`db`. Firebase configuration values use `NEXT_PUBLIC_` variables because the
Firebase Web SDK runs in the browser; never put service-account credentials in
this file or in a `NEXT_PUBLIC_` variable.

The admin page manages `exams`, `subjects`, `topics`, and `tests`; test answer
indices are stored separately in the admin-only `answerKeys` collection. Signed-in
results are stored in `results` with the authenticated UID; guest results are
shown after submission but are not saved permanently.

If you created tests before answer keys were separated, migrate or recreate those
documents before allowing public reads; old documents may still contain public
`correctOptionIndex` fields.