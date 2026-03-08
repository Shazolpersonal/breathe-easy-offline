/**
 * 2Checkout ConvertPlus buy-link donation helper.
 * Opens a hosted checkout page in a new tab — works on every device.
 */

const MERCHANT_CODE = "254949309465";

export interface DonateOptions {
  amount: number;
  currency: "USD" | "BDT";
  language: "en" | "bn";
  productName?: string;
}

function buildDonationUrl(opts: DonateOptions): string {
  const name = opts.productName ??
    (opts.language === "bn" ? "মুহূর্ত ব্রেথ সহায়তা" : "Muhurto Breath Donation");

  const params = new URLSearchParams({
    merchant: MERCHANT_CODE,
    dynamic: "1",
    prod: name,
    type: "PRODUCT",
    qty: "1",
    price: String(opts.amount),
    tangible: "0",
    currency: opts.currency,
    language: opts.language === "bn" ? "bn" : "en",
  });

  return `https://secure.2checkout.com/checkout/buy/?${params.toString()}`;
}

export function openDonation(opts: DonateOptions): boolean {
  const url = buildDonationUrl(opts);
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
