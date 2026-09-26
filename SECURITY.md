# Security architecture

SentraAI is designed to minimize the sensitive data it handles. The scan function inspects text in memory, returns category and offsets rather than matched values, and persists only tool, category, count, action, and timing metadata. Request bodies and raw prompts must never be added to application logs, analytics, tracing, or error reporting.

Authentication uses bcrypt-hashed passwords and NextAuth.js signed, HttpOnly session cookies. NextAuth provides CSRF tokens for its own auth actions. Custom browser mutations require same-origin requests and JSON bodies. API keys are 256-bit random values; only SHA-256 hashes are stored, and full keys are returned once at creation. Keys can be revoked. Authentication and scan endpoints use PostgreSQL-backed rate buckets so limits survive serverless instance changes.

Customer authorization is enforced in API route handlers and Prisma query filters using the signed-in organization ID. Owners and customer admins can change workspace resources; members can read. Internal admins use a separate role. Tenant management and read-only tenant preview are restricted to internal admins, with an audit entry for each sensitive admin action. Internal preview does not create a customer session.

Input is validated with Zod. Prisma parameterizes database access; no raw SQL string construction is used. React escapes rendered text. Security headers include CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and a restrictive Permissions-Policy. Secrets belong in environment variables and are absent from the repository.

Operational owners should use HTTPS, restrict database credentials, rotate `NEXTAUTH_SECRET` and API keys when required, configure email for password resets, and define retention and incident response procedures. Detection patterns are a first control layer and can produce false positives or misses. GDPR and local-law references describe control alignment, not certification or legal advice. Formal threat modeling, penetration testing, and legal review are required before regulated production use.
