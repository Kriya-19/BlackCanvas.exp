import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import StickyCTA from "../components/StickyCTA.jsx";
import TicketCard from "../components/TicketCard.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import { TICKETS } from "../config/eventConfig.js";
import { useBooking } from "../context/BookingContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import styles from "./TicketPage.module.css";

export default function TicketPage() {
  const navigate = useNavigate();
  const { quantities, setQuantity, selectedItems, totalQuantity, totalAmount } =
    useBooking();

  const canContinue = totalQuantity > 0;

  return (
    <div className={styles.page}>
      <Header showBack step={2} totalSteps={4} />

      <main className="container">
        <div className={styles.heading}>
          <h1 className={styles.title}>Select tickets</h1>
          <p className={styles.subtitle}>Choose how many you need. Prices are per person.</p>
        </div>

        <div className={styles.cards}>
          {TICKETS.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              quantity={quantities[ticket.id] || 0}
              onChange={setQuantity}
            />
          ))}
        </div>

        {canContinue && (
          <div className={styles.summary}>
            <OrderSummary items={selectedItems} total={totalAmount} />
          </div>
        )}
      </main>

      <StickyCTA
        label="CONTINUE"
        subLabel={canContinue ? `${totalQuantity} ticket${totalQuantity > 1 ? "s" : ""} · ${formatCurrency(totalAmount)}` : "Select at least one ticket"}
        onClick={() => navigate("/details")}
        disabled={!canContinue}
      />
    </div>
  );
}
