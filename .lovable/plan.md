

# Donation System with 2Checkout — Design Plan

## How 2Checkout Works (Summary)

2Checkout (now Verifone) offers an **InLine Checkout** — a JavaScript library that opens a secure payment overlay directly on your page. No redirect, no backend needed for the checkout flow itself. It supports a **DYNAMIC mode** where you don't need pre-configured products — you set the product name, price, and currency in JavaScript at runtime. This is perfect for donations with user-selected amounts.

The flow: User clicks "Donate" -> selects amount -> `TwoCoInlineCart` opens a secure overlay -> user pays via card/PayPal/etc -> 2Checkout handles everything -> callback confirms success -> thank-you message shown.

**Zero backend required.** The JavaScript library is loaded from 2Checkout's CDN and handles all payment security via their PCI-compliant iframe.

---

## What You Need from Your 2Checkout Account

You need **one variable** to set in your code:

| Variable | Where to Find | Value |
|----------|--------------|-------|
| **Merchant Code** | 2Checkout Control Panel -> top-right profile area, or Integrations -> Webhooks & API -> Merchant Code | A string like `"251234567890"` |

This is a **public identifier** (like a Stripe publishable key) — safe to embed in frontend code. It only identifies your merchant account; it cannot be used to extract money or access your dashboard.

---

## Implementation Plan

### 1. New File: `src/lib/donate.ts` (~30 lines)
- Function `openDonation(merchantCode, amount, currency, lang)` that:
  - Calls `TwoCoInlineCart.setup.setMerchant(merchantCode)`
  - Sets `DYNAMIC` mode
  - Adds a product named "Muhurto Breath Donation" (or Bengali equivalent) with the chosen amount
  - Sets currency (USD default, BDT option for Bangla users)
  - Calls `TwoCoInlineCart.cart.checkout()` to open the overlay
- Event subscriptions for `cart:closed` and order completion callbacks

### 2. New File: `src/components/DonateDialog.tsx` (~80 lines)
A dialog/drawer with:
- A heartfelt message: "Help us reach millions" (localized EN/BN)
- **Preset amount buttons**: $2, $5, $10, $25 (or ৳200, ৳500, ৳1000, ৳2500 for BN)
- **Custom amount** input field
- A "Donate" button that calls `openDonation()`
- Thank-you state after successful payment

### 3. Load 2Checkout Script: `index.html`
Add one script tag:
```html
<script src="https://secure.2checkout.com/checkout/client/twoCoInlineCart.js"></script>
```
This is 2Checkout's official InLine Checkout library (~15KB). It's loaded from their CDN, always up-to-date, and free.

### 4. Strategic Placements

| Location | Trigger | Why |
|----------|---------|-----|
| **Settings page** — new "Support Us" card below "Invite Friends" | Always visible, prominent heart icon | Users exploring settings are engaged and committed |
| **Home page** — subtle heart icon in the header area | Small, non-intrusive | Ambient visibility without disrupting the breathing UX |
| **Session Done screen** — small "Support Us" link below the action buttons | Post-session gratitude moment | Users feel good after breathing — peak generosity moment |

### 5. Localization: `en.ts` and `bn.ts` (~15 new keys each)
- `donate.title`: "Support Muhurto" / "মুহূর্ত সমর্থন করুন"
- `donate.subtitle`: "Help us reach millions with free breathing tools" / "বিনামূল্যে শ্বাস-প্রশ্বাসের সরঞ্জাম লক্ষ লক্ষ মানুষের কাছে পৌঁছাতে সাহায্য করুন"
- `donate.amount`: "Choose amount" / "পরিমাণ নির্বাচন করুন"
- `donate.custom`: "Custom" / "কাস্টম"
- `donate.button`: "Donate" / "দান করুন"
- `donate.thanks`: "Thank you for your generous support!" / "আপনার উদার সহায়তার জন্য ধন্যবাদ!"
- `donate.currency`: Currency labels
- Plus button labels for placements

### 6. Files Changed Summary

| File | Change |
|------|--------|
| `index.html` | Add 2Checkout InLine Checkout script tag |
| `src/lib/donate.ts` | **New** — donation logic using TwoCoInlineCart |
| `src/components/DonateDialog.tsx` | **New** — donation amount picker + messaging UI |
| `src/pages/Settings.tsx` | Add "Support Us" card with heart icon |
| `src/pages/Home.tsx` | Add small heart icon button in header |
| `src/pages/Session.tsx` | Add "Support Us" link on done screen |
| `src/locales/en.ts` | ~15 new donation keys |
| `src/locales/bn.ts` | ~15 matching Bengali keys |

---

## What You Need To Do

1. **Get your Merchant Code** from 2Checkout Control Panel
2. Tell me the code so I can embed it (it's public/safe)
3. **Enable InLine Checkout** in your 2Checkout account: Go to Setup -> Generate Links -> click "Inline Checkout" tab. If not available, contact 2Checkout support to enable ConvertPlus on your account (it's free for all merchants)

---

## Technical Notes
- **Zero cost to you**: 2Checkout charges standard transaction fees only when someone donates — no monthly fee for InLine Checkout
- **Zero backend**: The JavaScript library handles all PCI-compliant payment processing client-side via iframe
- **Sustainable**: 2Checkout's InLine Checkout JS library has been stable since 2018, is actively maintained by Verifone
- **No new npm dependencies**: Script loaded from CDN
- **Works on all devices**: The overlay is mobile-responsive by default
- **Security**: Payment details never touch your code — they go directly to 2Checkout's PCI DSS Level 1 certified servers

