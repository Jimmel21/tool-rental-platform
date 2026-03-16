# Manual testing checklist

Use this checklist to verify critical flows before and after launch.

## Prerequisites

- Database seeded: `npx prisma db seed`
- Dev server: `npm run dev`
- Test accounts: Admin `admin@toolrental.tt` / `Admin123`, Partner `partner@toolrental.tt` / `Partner123`

---

## 1. Customer flow: Registration → Browse → Book → Pay → Complete

### 1.1 Registration
- [ ] Open `/register`.
- [ ] Submit with invalid email → see validation/error.
- [ ] Submit with short password → see validation/error.
- [ ] Submit with valid name, email, password → redirect to login or dashboard; can log in with new credentials.

### 1.2 Browse
- [ ] Open `/` — hero, categories, and popular tools load.
- [ ] Open `/tools` — tool list and filters load.
- [ ] Filter by category → list updates.
- [ ] Change sort (e.g. price low to high) → list updates.
- [ ] Click a tool card → tool detail page loads (images, price, description, “Book this tool”).

### 1.3 Book
- [ ] On tool detail, click “Book this tool” → go to booking form (logged-in) or redirect to login.
- [ ] Select start and end dates → summary shows total.
- [ ] Choose delivery (if available) → zone and address appear; total includes delivery fee.
- [ ] Accept terms, submit → booking created; redirect to confirmation page with reference.

### 1.4 Pay
- [ ] On confirmation page, click “Pay now” (or go to `/checkout/[bookingId]`) → checkout page loads.
- [ ] Select payment method (e.g. bank transfer) → instructions/reference shown.
- [ ] If “I’ve made the transfer” is available, submit → payment recorded (or marked pending) and UI updates.

### 1.5 Complete (post-rental)
- [ ] As admin (see Admin flow), mark booking Active then Complete.
- [ ] As customer, open dashboard → booking appears in Completed; can leave a review if implemented.

---

## 2. Admin flow: Add tool → Manage booking → Process payment

### 2.1 Add tool
- [ ] Log in as admin, go to `/admin/tools`.
- [ ] Click “Add tool” (or `/admin/tools/new`).
- [ ] Fill name, category, rates, deposit, description → submit.
- [ ] New tool appears in admin list and is visible on public `/tools` (if status is AVAILABLE).

### 2.2 Manage booking
- [ ] Go to `/admin/bookings` — list of bookings with filters.
- [ ] Filter by status (e.g. PENDING) and/or date range.
- [ ] Click a booking → booking detail page: customer, tool, payments, notes.
- [ ] Change status: PENDING → Confirm → CONFIRMED; CONFIRMED → Mark active → ACTIVE; ACTIVE → Complete → COMPLETED.
- [ ] Add or edit notes, save → notes persist.
- [ ] Cancel booking → status CANCELLED.

### 2.3 Process payment
- [ ] On booking detail, if balance due > 0: use “Record payment” (amount + method) → payment created, balance updates.
- [ ] Go to `/admin/payments` — “Pending bank transfers” and “All payments” sections load.
- [ ] For a pending bank transfer, click “Confirm payment” → status updates and list refreshes.
- [ ] Deposit: for a booking with deposit HELD, use “Release deposit” or “Deduct” (amount + reason) → deposit status and notes update.

---

## 3. Cross-cutting checks

### Error handling
- [ ] Open a non-existent URL (e.g. `/tools/fake-slug-xyz`) → custom 404 with links to home and tools.
- [ ] Trigger an error (e.g. invalid API call) → error boundary or error message shown; “Try again” or navigation works.

### Loading and toasts
- [ ] Navigate to `/tools` → loading skeleton or spinner appears briefly before list.
- [ ] Submit a form that shows success (e.g. booking created) → success toast or message appears and dismisses.

### SEO and content
- [ ] View page source on tool detail → meta title/description and JSON-LD Product schema present.
- [ ] Open `/about`, `/how-it-works`, `/faq`, `/terms`, `/privacy`, `/contact` → each loads and footer links work.

### Mobile
- [ ] Resize to mobile width → hamburger menu, sticky “Book now” on tool detail, and bottom tab bar (dashboard) behave correctly.

---

## 4. Quick smoke (post-deploy)

- [ ] Homepage loads.
- [ ] `/tools` loads and shows tools.
- [ ] One tool detail page loads.
- [ ] Login with test admin works.
- [ ] `/admin/bookings` loads (admin only).
- [ ] `/sitemap.xml` and `/robots.txt` return expected content.
