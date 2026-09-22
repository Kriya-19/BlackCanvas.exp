import { CURRENCY_SYMBOL } from "../config/eventConfig";
import styles from "./OrderSummary.module.css";

export default function OrderSummary({ items, total, compact = false }) {
  if (!items.length) return null;

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      {!compact && <h3 className={styles.heading}>Order summary</h3>}
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.row}>
            <span className={styles.label}>
              {item.name} <span className={styles.qty}>× {item.quantity}</span>
            </span>
            <span className={styles.value}>
              {CURRENCY_SYMBOL}
              {item.subtotal.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.divider} />
      <div className={styles.totalRow}>
        <span>Total</span>
        <span className={styles.totalValue}>
          {CURRENCY_SYMBOL}
          {total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
