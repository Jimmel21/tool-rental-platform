# Security Headers & Production Checklist

## Configured Security Headers

- **HSTS** – `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options** – `SAMEORIGIN` (prevents clickjacking)
- **X-Content-Type-Options** – `nosniff`
- **X-XSS-Protection** – `1; mode=block`
- **Referrer-Policy** – `strict-origin-when-cross-origin`
- **Permissions-Policy** – camera/microphone disabled; geolocation and payment limited to self
- **Content-Security-Policy** – see `lib/security/csp.ts` (env-specific: dev allows `unsafe-eval`, production does not)

## Production Checklist

- [ ] HSTS enabled with long max-age
- [ ] X-Frame-Options prevents clickjacking
- [ ] CSP blocks inline scripts (except required for Next.js/Tailwind)
- [ ] No sensitive data in Referrer
- [ ] Permissions-Policy restricts APIs
- [ ] All third-party domains whitelisted in CSP (Stripe, WiPay, Resend, Cloudinary as needed)

## Testing

- Use [securityheaders.com](https://securityheaders.com) to verify.
- Check browser console for CSP violations after deployment.
- Test payment and external integrations (WiPay, etc.) with CSP enabled.

## Optional Environment Variables

- `SECURITY_RESTRICT_ADMIN_API=true` – Restrict `/api/admin/*` to same-origin or localhost.
- `SECURITY_LOG_EVENTS=true` – Log security events in production (path, method, host, UA).

## API Responses

For JSON API routes, use `jsonResponse()` from `lib/api-response.ts` to send consistent `Content-Type`, `X-Content-Type-Options`, and `Cache-Control` headers.
