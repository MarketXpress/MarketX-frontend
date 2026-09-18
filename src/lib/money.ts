/**
 * Price display helpers.
 *
 * The architecture settles in USDC and treats XLM as a display conversion
 * only, because a three-day escrow can move 15% and somebody has to eat it.
 * Sellers therefore price in dollars and never type an XLM figure.
 */

/**
 * XLM per USD, used to fill `products.xlm_price` at listing time.
 *
 * A hardcoded rate, and openly so. It matches the ratio the seeded catalogue
 * was built with (XLM ≈ $0.206) purely so new listings sit alongside the demo
 * ones without looking wrong.
 *
 * This is display-only and must not be used to settle anything. Before any
 * real money moves, the figure has to come from a price oracle read at the
 * moment of the transaction — see the escrow phase of the roadmap.
 */
export const XLM_PER_USD = 4.85;

export function usdToXlm(usd: number): number {
  // Stellar carries seven decimal places and the column is numeric(20,7);
  // rounding here keeps the stored value from being silently truncated.
  return Math.round(usd * XLM_PER_USD * 1e7) / 1e7;
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}

const xlmFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatXlm(amount: number): string {
  return `${xlmFormatter.format(amount)} XLM`;
}
