# v0-seguria-website

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below - start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 ->](https://v0.app/chat/projects/prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn)

## Integrations

The portal now includes a first integration layer for the security platform:

- `GET /api/integrations/status`
- `POST /api/integrations/home-assistant`
- `POST /api/integrations/tuya`

Required environment variables:

- `HOME_ASSISTANT_WEBHOOK_SECRET`
- `TUYA_SYNC_SECRET`

## Auth

The portal now includes a persistent local auth scaffold with roles and tenant scope:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Demo accounts:

- `admin@seguria.local` / `seguria-admin`
- `tech@seguria.local` / `seguria-tech`
- `client@seguria.local` / `seguria-client`

## Local Gateway

The repository also includes a gateway scaffold under `gateway/` for the local-first architecture. It is intended to run in a property network and sync events to the portal when connectivity is available.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
