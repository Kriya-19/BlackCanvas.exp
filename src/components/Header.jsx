import { useNavigate } from "react-router-dom";
import { BRAND } from "../config/eventConfig";
import styles from "./Header.module.css";

export default function Header({ showBack = false, onBack, step, totalSteps }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <header className={styles.header}>
      <div className={styles.row}>
        {showBack ? (
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span className={styles.spacer} />
        )}

        <span className={styles.wordmark}>{BRAND.name}</span>

        <span className={styles.spacer} />
      </div>

      {step && totalSteps ? (
        <div className={styles.progress} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i < step ? styles.dotActive : ""}`}
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}
