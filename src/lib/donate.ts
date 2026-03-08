/**
 * 2Checkout (Verifone) InLine Checkout — donation helper.
 * Uses the TwoCoInlineCart global loaded from their CDN script.
 * Merchant code is a PUBLIC identifier — safe in frontend code.
 */

declare global {
  interface Window {
    TwoCoInlineCart?: {
      setup: {
        setMerchant: (code: string) => void;
        setMode: (mode: string) => void;
        setLanguage: (lang: string) => void;
      };
      cart: {
        setCurrency: (currency: string) => void;
        checkout: () => void;
      };
      products: {
        removeAll: () => void;
        addDynamic: (product: {
          name: string;
          quantity: number;
          price: number;
          tangible: boolean;
        }) => void;
      };
      events: {
        subscribe: (event: string, cb: (...args: unknown[]) => void) => void;
      };
    };
  }
}

// Replace with your actual 2Checkout Merchant Code
const MERCHANT_CODE = "254949309465";

export interface DonateOptions {
  amount: number;
  currency: "USD" | "BDT";
  language: "en" | "bn";
  productName?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function openDonation(opts: DonateOptions): boolean {
  const cart = window.TwoCoInlineCart;
  if (!cart) {
    console.warn("2Checkout InLine Checkout script not loaded");
    return false;
  }

  const name = opts.productName ??
    (opts.language === "bn" ? "মুহূর্ত ব্রেথ সহায়তা" : "Muhurto Breath Donation");

  cart.setup.setMerchant(MERCHANT_CODE);
  cart.setup.setMode("DYNAMIC");
  cart.setup.setLanguage(opts.language === "bn" ? "bn" : "en");

  cart.products.removeAll();
  cart.products.addDynamic({
    name,
    quantity: 1,
    price: opts.amount,
    tangible: false,
  });

  cart.cart.setCurrency(opts.currency);

  if (opts.onSuccess) {
    cart.events.subscribe("cart:payment:finish", opts.onSuccess);
  }
  if (opts.onClose) {
    cart.events.subscribe("cart:closed", opts.onClose);
  }

  cart.cart.checkout();
  return true;
}

export function isDonateAvailable(): boolean {
  return !!window.TwoCoInlineCart;
}
