import styles from "./QuantityControl.module.css";

export default function QuantityControl({ quantity, max = 6, onChange, label }) {
  const dec = () => onChange(Math.max(0, quantity - 1));
  const inc = () => onChange(Math.min(max, quantity + 1));

  return (
    <div className={styles.control} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.btn}
        onClick={dec}
        disabled={quantity <= 0}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={styles.count} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={inc}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
