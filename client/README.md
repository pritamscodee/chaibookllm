# Chaibook — client

Next.js 16 (App Router) frontend for Chaibook. Chat with your sources and turn them into revision material.

The browser only talks to this app. Requests to `/api/auth/*`, `/api/workspaces/*` and `/api/memory/*` are proxied by Next.js rewrites to the Express API in `../server`. That keeps auth cookies first-party, and the browser never needs the API's address.

## Local development

```bash
cp .env.example .env.local   # then edit if your API isn't on :4040
npm install
npm run dev                  # http://localhost:3000
```

The Express API (`../server`) must be running.

## Scripts

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Dev server                                     |
| `npm run build`     | Production build (fails if `API_URL` is unset) |
| `npm start`         | Serve the production build                     |
| `npm run lint`      | ESLint                                         |
| `npm run typecheck` | TypeScript, no emit                            |
| `npm run check`     | lint + typecheck + build (use in CI)           |

## Environment variables

| Variable              | Required          | Example                     | Purpose                                                           |
| --------------------- | ----------------- | --------------------------- | ----------------------------------------------------------------- |
| `API_URL`             | **Yes** (build)   | `https://api.chaibook.app`  | Express API origin, used by the rewrites and server-side fetches  |
| `NEXT_PUBLIC_APP_URL` | Yes in production | `https://chaibook.app`      | This app's public origin, used for metadata, robots and sitemap   |

`API_URL` is read when the app is built, because the rewrites are baked into the build. After changing it, redeploy.

## Deploying (e.g. Vercel)

1. Import the repo and set **Root Directory** to `client`.
2. Add `API_URL` and `NEXT_PUBLIC_APP_URL` under Project → Settings → Environment Variables, for Production and Preview.
3. Deploy. Node 20.9 or newer is required (see `engines` in `package.json`).

### Server settings that must match

On the Express API (`../server`), set:

- `CLIENT_URL` = your client origin, e.g. `https://chaibook.app` (CORS and better-auth `trustedOrigins`)
- `BETTER_AUTH_URL` = your **client** origin. Auth runs through the client's `/api/auth` rewrite, so OAuth callbacks land on the client domain.
- `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

In Google Cloud Console → OAuth client, add these:

- Authorized JavaScript origin: `https://chaibook.app`
- Authorized redirect URI: `https://chaibook.app/api/auth/callback/google`

## Project layout

```
app/          Routes (App Router). (auth) and (protected) route groups
features/     Feature modules: auth, chat, learn, sources, workspaces, memory, landing
shared/       Cross-feature components, hooks and lib
components/   shadcn/ui primitives
proxy.ts      Optimistic auth redirect for signed-in routes (cookie check only)
```
