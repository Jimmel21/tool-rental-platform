# Production environment checklist

Use this checklist before deploying Tool Rental TT to production.

## Required variables

### Database
- [ ] **DATABASE_URL** — PostgreSQL connection string for production.
  - Use a managed DB (Neon, Supabase, Railway, etc.) or your own server.
  - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
  - Run migrations: `npx prisma migrate deploy`

### NextAuth
- [ ] **NEXTAUTH_SECRET** — Random secret for session signing (min 32 chars).
  - Generate: `openssl rand -base64 32`
- [ ] **NEXTAUTH_URL** — Full URL of your app in production.
  - Example: `https://toolrental.tt`

### Optional but recommended
- [ ] **NEXT_PUBLIC_SITE_URL** — Same as NEXTAUTH_URL; used for sitemap, OG tags, and canonical URLs.
- [ ] **NEXT_PUBLIC_WHATSAPP_NUMBER** — Business WhatsApp number (digits only, e.g. `18681234567` for T&T).

## Pre-launch steps

1. **Database**
   - Create production database and get `DATABASE_URL`.
   - Run `npx prisma migrate deploy`.
   - Run seed if you want sample data: `npx prisma db seed` (optional; creates admin user and sample tools).

2. **Secrets**
   - Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in your host’s environment (Vercel, Railway, etc.).

3. **Build**
   - Run `npm run build` locally or in CI to confirm no errors.

4. **Smoke test**
   - After deploy, open the site, register, browse tools, and create a test booking to confirm flows work.

## Example `.env.production` (do not commit)

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_WHATSAPP_NUMBER="18681234567"
```

## Database connection notes

- **Neon / Supabase**: Use the pooled connection string if offered (better for serverless).
- **SSL**: Many hosts require `?sslmode=require` in the URL; add it if you see connection errors.
- **Connection limit**: Ensure your plan allows enough connections for your traffic.
