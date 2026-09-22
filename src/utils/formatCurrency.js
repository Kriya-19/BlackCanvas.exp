import { CURRENCY_SYMBOL } from "../config/eventConfig";

export function formatCurrency(amount) {
  return `${CURRENCY_SYMBOL}${Number(amount).toLocaleString("en-IN")}`;
}
