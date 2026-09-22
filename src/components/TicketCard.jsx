import { CURRENCY_SYMBOL } from "../config/eventConfig";
import QuantityControl from "./QuantityControl.jsx";
import styles from "./TicketCard.module.css";

export default function TicketCard({ ticket, quantity, onChange }) {
  const active = quantity > 0;

  return (
    <div className={`${styles.card} ${active ? styles.cardActive : ""}`}>
      <div className={styles.top}>
        <div>
          <h3 className={styles.name}>{ticket.name}</h3>
          <p className={styles.tagline}>{ticket.tagline}</p>
        </div>
        <div className={styles.price}>
          {CURRENCY_SYMBOL}
          {ticket.price}
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.perHead}>per person</span>
        <QuantityControl
          quantity={quantity}
          max={ticket.maxPerOrder}
          onChange={(q) => onChange(ticket.id, q)}
          label={`${ticket.name} quantity`}
        />
      </div>
    </div>
  );
}
