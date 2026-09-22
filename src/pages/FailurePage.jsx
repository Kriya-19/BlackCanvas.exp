import { useLocation, useNavigate } from "react-router-dom";
import styles from "./FailurePage.module.css";

export default function FailurePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason || "Your payment could not be completed.";

  return (
    <div className={styles.page}>
      <main className="container">
        <div className={styles.body}>
          <div className={styles.icon}>✕</div>
          <h1 className={styles.title}>Payment didn't go through</h1>
          <p className={styles.reason}>{reason}</p>
          <p className={styles.note}>
            No amount has been charged if this failed before completion. If money was
            deducted, it will be refunded automatically within 5–7 business days.
          </p>

          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => navigate("/details")}
          >
            TRY AGAIN
          </button>
          <button type="button" className={styles.homeBtn} onClick={() => navigate("/")}>
            Back to event page
          </button>
        </div>
      </main>
    </div>
  );
}
