

# Fix Donation System — Switch to ConvertPlus Buy Links

## Problem

The 2Checkout InLine Checkout (JavaScript overlay) fails because:
- On mobile: the overlay script doesn't load or render inside the PWA/iframe context
- On PC: the script loads but the cart initialization fails with "Payment system is loading"
- The InLine Checkout requires specific account-level ConvertPlus configuration that may not be enabled

## Solution

Replace the JavaScript overlay approach with **ConvertPlus buy-link URLs** — a simple redirect to 2Checkout's hosted checkout page. This is the most reliable method available to all 2Checkout accounts, requires zero JavaScript SDK, and works on every device.

The URL format (from official 2Checkout docs):
```text
https://secure.2checkout.com/checkout/buy/?merchant=254949309465&dynamic=1&prod=Muhurto+Breath+Donation&type=PRODUCT&qty=1&price=5&tangible=0&currency=USD&language=en
```

User clicks "Donate" → new tab opens with 2Checkout's hosted checkout → user pays → done.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/donate.ts` | Replace entire file — remove script loading, InLine Cart API, and global types. New function `buildDonationUrl()` that constructs the ConvertPlus URL with dynamic parameters. `openDonation()` simply calls `window.open(url, '_blank')`. ~25 lines total. |
| `src/components/DonateDialog.tsx` | Simplify `handleDonate` — call the new `openDonation()` (synchronous, no async/await needed). Show thank-you state immediately after opening the link. Remove `preloadDonateScript` call. |

### Key parameters in the URL:
- `merchant=254949309465` — your merchant code
- `dynamic=1` — enables dynamic product (no pre-configured catalog needed)
- `prod=` — product name (localized EN/BN)
- `type=PRODUCT` — product type
- `price=` — user-selected amount
- `qty=1` — single unit
- `tangible=0` — digital/intangible
- `currency=USD` or `BDT`
- `language=en` or `bn`

### Why this is better:
- Works on ALL devices — phone, tablet, PC, PWA, iframe
- Zero JavaScript SDK dependency
- 2Checkout handles all payment UI, security, PCI compliance
- No script loading failures possible
- Instant — no waiting for external scripts

