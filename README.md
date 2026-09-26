# SentraAI

SentraAI is a single-deployment enterprise AI security gateway and SaaS console. It inspects outgoing AI prompts, applies organization policies, and records privacy-preserving incident metadata. The repository contains a public marketing site, customer workspace, internal admin panel, and Next.js API.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn-style Radix UI components, Framer Motion, NextAuth.js, PostgreSQL with Prisma, and a standalone TypeScript detection engine. The application deploys as one Vercel project; PostgreSQL is the only required external data service.

## Local setup

1. Create a PostgreSQL database in Neon or Supabase. Use a pooled URL for `DATABASE_URL` and a direct URL for `DIRECT_URL`.
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, and a long random `NEXTAUTH_SECRET`. Prisma CLI and Next.js both load `.env`.
3. Run `npm install`.
4. Run `npx prisma migrate dev` to create the schema.
5. For populated demo screens, set strong `SEED_OWNER_PASSWORD` and `SEED_ADMIN_PASSWORD`, then run `npm run db:seed`.
6. Run `npm run dev` and open `http://localhost:3000`.

Seeded sign-in emails are `owner@caspianmeridian.example` and `admin@sentraai.example`. Passwords are the values you supplied in the seed environment variables. These are demo-only accounts; remove them before serving real customers. New customer accounts can sign up and complete onboarding without seed data.

Password reset email uses the optional `RESEND_API_KEY` and `RESEND_FROM_EMAIL` values, with a verified sender domain. If they are absent, the reset endpoint returns a clear service-unavailable error. No email provider is needed for core scanning, dashboards, or admin operations.

## Vercel deployment

1. Push this repository to GitHub and import it as a single Vercel project.
2. Attach a Vercel-compatible PostgreSQL provider such as Neon or Supabase.
3. Set `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL` (your production HTTPS URL), `NEXTAUTH_SECRET`, and `CRON_SECRET` in the Vercel dashboard. The daily Vercel Cron clears expired rate-limit buckets and reset tokens. Set the optional email variables if password reset delivery is required.
4. Deploy. `vercel.json` runs `npx prisma migrate deploy && npm run build`, so schema migrations apply during deployment and Prisma Client is generated for the build. No additional build configuration is needed.
5. Deploy. Create the first internal admin account through a controlled seed run or secure database provisioning process; the public signup creates customer owners only.

No Docker image, separate API server, queue, worker, or browser extension is included.

## Gateway contract

Create an API key under **Settings → API keys**. Its full value appears exactly once. Send scans to `POST /api/v1/scan`:

```http
Authorization: Bearer sentra_live_<issued-key>
Content-Type: application/json

{"text":"Prompt to inspect","tool":"ChatGPT","employeeEmail":"person@company.example"}
```

The response contains `clean`, `matches` (category, offsets, confidence, policy action), `maskedText`, and `blocked`. A connected gateway or future browser extension must stop transmission when `blocked` is true and submit `maskedText` when a mask action applies. The scan API never logs or stores the original prompt or detected values. The TypeScript contract is documented in `app/api/v1/scan/route.ts` and `lib/detection-engine/index.ts`; no extension code is part of this repository.

## Product behavior

- Customer APIs scope database queries to the signed-in organization; managers can change rules and issue keys, while members have read access.
- Internal admins have a separate role and routes under `/admin`. Tenant preview is read-only and creates an audit entry.
- Seeded system-health figures and marketing testimonials are explicitly labeled as illustrative or fictional. Billing is a presentation-only management screen.
- Detection rules cover cards with Luhn validation, Azerbaijani FIN patterns and phone numbers, email, secrets, Azerbaijani IBANs, financial figures, and confidential clauses. The classifier interface is available for a future in-process ML implementation.

See [SECURITY.md](SECURITY.md) for the security model and operational limitations.
