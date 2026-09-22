import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { BRAND, EVENT } from "../config/eventConfig.js";
import { useBooking } from "../context/BookingContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import styles from "./SuccessPage.module.css";

export default function SuccessPage() {
  const navigate = useNavigate();
  const { lastBooking, clearBookingDraft } = useBooking();
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!lastBooking) navigate("/", { replace: true });
  }, [lastBooking, navigate]);

  if (!lastBooking) return null;

  const { bookingId, customer, lineItems, totalQuantity, amount, date, venue } = lastBooking;
  const ticketTypeLabel = lineItems.map((i) => `${i.name} × ${i.quantity}`).join(", ");

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: "#09090c",
      });
      const link = document.createElement("a");
      link.download = `blackcanvas-wild-night-${bookingId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Ticket download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDone = () => {
    clearBookingDraft();
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <main className="container">
        <div className={styles.headline}>
          <div className={styles.check}>✓</div>
          <h1 className={styles.title}>YOU'RE IN. 🖤</h1>
          <p className={styles.subtitle}>Your spot at {EVENT.title} is locked in.</p>
        </div>

        <div className={styles.ticket} ref={ticketRef}>
          <div className={styles.ticketHeader}>
            <span className={styles.brand}>{BRAND.name}</span>
            <span className={styles.eventName}>{EVENT.title}</span>
          </div>

          <div className={styles.qrWrap}>
            <div className={styles.qrCard}>
              <QRCodeSVG value={bookingId} size={148} bgColor="#ffffff" fgColor="#09090c" level="M" />
            </div>
          </div>

          <div className={styles.details}>
            <DetailRow label="Name" value={customer.name} />
            <DetailRow label="Ticket" value={ticketTypeLabel} />
            <DetailRow label="Quantity" value={totalQuantity} />
            <DetailRow label="Amount paid" value={formatCurrency(amount)} />
            <DetailRow label="Booking ID" value={bookingId} mono />
            <DetailRow label="Date" value={date} />
            <DetailRow label="Venue" value={venue} />
          </div>

          <div className={styles.perforation}>
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>

          <p className={styles.ticketFooter}>Show this QR code at entry. Non-transferable.</p>
        </div>

        <button type="button" className={styles.downloadBtn} onClick={handleDownload} disabled={downloading}>
          {downloading ? "Preparing…" : "DOWNLOAD TICKET"}
        </button>

        <button type="button" className={styles.doneBtn} onClick={handleDone}>
          Back to event page
        </button>
      </main>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${mono ? styles.mono : ""}`}>{value}</span>
    </div>
  );
}
