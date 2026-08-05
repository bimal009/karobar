import { CURRENCIES, DEFAULT_CURRENCY } from "./currencies"

const symbolByCode = new Map(CURRENCIES.map((c) => [c.code, c.symbol]))

export function getCurrencySymbol(code?: string | null): string {
  return symbolByCode.get(code ?? "") ?? symbolByCode.get(DEFAULT_CURRENCY)!
}

/**
 * Formats an amount using the store's currency. Locale is pinned to "en-US" so
 * grouping/decimal punctuation stays consistent across servers — only the
 * currency symbol/code varies with `code`.
 */
export function formatCurrency(
  amount: number,
  code?: string | null,
  options: Intl.NumberFormatOptions = {}
): string {
  const currency = code || DEFAULT_CURRENCY
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount)
  } catch {
    const digits = options.maximumFractionDigits ?? 2
    return `${getCurrencySymbol(currency)}${amount.toFixed(digits)}`
  }
}
