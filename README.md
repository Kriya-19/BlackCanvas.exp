# BLACKCANVAS — WILD NIGHT

Premium, mobile-first ticket booking site. React + Vite, plain CSS (CSS Modules),
Razorpay payments via Vercel serverless functions.

Flow: **Event Page → Ticket Selection → Details → Razorpay Checkout → Confirmation**

---

## 1. Run it locally

```bash
npm install
```

The UI alone (no live payments) runs with:

```bash
npm run dev
```

Because payments need the serverless functions in `/api`, which plain `vite dev`
doesn't execute, **test the full payment flow with the Vercel CLI** instead:

```bash
npm i -g vercel
vercel dev
```

`vercel dev` serves the React app **and** runs `/api/create-order` and
`/api/verify-payment` locally, exactly like production.

Build for production / preview the build:

```bash
npm run build
npm run preview
```

---

## 2. Environment variables

Copy `.env.example` to `.env` and fill in real values (use Razorpay **test mode**
keys first):

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — read **only** by the server code in
  `/api`. The secret is never sent to, or readable by, the browser.
- `VITE_RAZORPAY_KEY_ID` — not currently used by the client (the key id used to
  open the checkout widget comes back from `/api/create-order`'s response
  instead, which is the safer pattern), but it's included in case you want to
  reference it client-side later. Anything prefixed `VITE_` is public by
  Vite's convention — never put the secret there.

When deploying, add the two server variables (`RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`) in **Vercel → Project → Settings → Environment
Variables**, not in a committed `.env` file.

---

## 3. Connecting Razorpay

1. Create a [Razorpay account](https://dashboard.razorpay.com/) and grab your
   **test** API keys from *Settings → API Keys*.
2. Drop them into `.env` (locally) and into Vercel's environment variables
   (in production).
3. The flow:
   - `DetailsPage` calls `POST /api/create-order` with the selected tickets
     and customer info.
   - `api/create-order.js` **recomputes the price server-side** from
     `src/config/eventConfig.js` (it never trusts a price from the browser),
     creates a Razorpay order, and returns the `order_id` + a generated
     `bookingId`.
   - The browser opens Razorpay's checkout widget with that `order_id`.
   - On success, `POST /api/verify-payment` recomputes the HMAC signature
     with your `RAZORPAY_KEY_SECRET` and confirms it matches what Razorpay
     sent back — this is what actually proves the payment is genuine.
   - Only after that verification does the app show the confirmation page.
4. Switch to **live keys** in Vercel's env vars once you're ready to accept
   real payments — no code changes needed.
5. **Persisting bookings:** right now a successful booking only lives in the
   browser's `sessionStorage` for the confirmation screen. Before a real
   launch, add a database write in `api/create-order.js` (status: "created")
   and `api/verify-payment.js` (status: "paid") — both files have a `NOTE:`
   comment marking exactly where. This also gives you a way to look up a
   booking by ID (e.g. at the door) — right now the QR code encodes the
   booking ID, but nothing looks it up.

---

## 4. Deploying to Vercel

```bash
npm i -g vercel
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

Or connect the GitHub repo in the Vercel dashboard for automatic deploys on
push. Either way, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the
project's environment variables before the first real payment. The included
`vercel.json` handles the SPA routing (so refreshing `/tickets` doesn't
404) and the `/api/*` functions automatically.

---

## 5. Where to change things

**Everything editorial — prices, event copy, date, venue, what's included —
lives in one file:**

```
src/config/eventConfig.js
```

- `TICKETS` — array of ticket types. Add/remove/edit `id`, `name`, `price`,
  `tagline`, `maxPerOrder`. The price here is also what the server charges
  (see §3), so this really is the single source of truth.
- `EVENT` — title, tagline, date, time, venue, about copy, "what's included"
  list, limited-spots message, and an optional real poster photo URL
  (`posterImageUrl` — leave `null` to keep the generative art hero).
- `BRAND` — brand name shown in the header and on the ticket.

Nothing else in the codebase needs to change to update pricing or event
details.

---

## Project structure

```
api/
  create-order.js      Creates a Razorpay order (server-side price calc)
  verify-payment.js    Verifies the payment signature
src/
  config/eventConfig.js   ← edit prices/event details here
  context/BookingContext.jsx  Selected tickets + form state, shared across pages
  components/           Reusable UI: TicketCard, QuantityControl, OrderSummary,
                         Header, StickyCTA, PosterArt
  pages/                 EventPage, TicketPage, DetailsPage, SuccessPage,
                          FailurePage
  utils/                 Razorpay checkout loader, currency formatting
```

## Notes on the "screenshots"

No screenshots came through with this request on my end — only the text
brief. I built the flow (poster hero → sticky "Book your spot" → ticket
steppers with a live summary → details form → checkout → QR confirmation)
from how this class of booking flow generally works well on mobile,
skinned entirely in BLACKCANVAS's own dark/violet identity rather than any
particular reference brand. If you re-send the screenshots I can tune the
specific layout details to match more closely.
