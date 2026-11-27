export function money(value: number | string, currency = "NGN", locale = "en-NG") {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value || 0));
}
export function date(value: Date | string, locale = "en-NG") {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}
