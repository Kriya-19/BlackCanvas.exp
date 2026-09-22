import styles from "./StickyCTA.module.css";

export default function StickyCTA({
  label,
  subLabel,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  fixedOnMobile = false,
}) {
  return (
    <div className={`${styles.wrap} ${fixedOnMobile ? styles.fixedOnMobile : ""}`}>
      <div className={styles.inner}>
        {subLabel ? <div className={styles.sub}>{subLabel}</div> : null}
        <button
          type={type}
          className={styles.btn}
          onClick={onClick}
          disabled={disabled || loading}
        >
          {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          {loading ? "Please wait…" : label}
        </button>
      </div>
    </div>
  );
}
