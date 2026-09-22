import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import StickyCTA from "../components/StickyCTA.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import { useBooking } from "../context/BookingContext.jsx";
import { EVENT, BRAND } from "../config/eventConfig.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { loadRazorpayScript, openRazorpayCheckout } from "../utils/razorpayCheckout.js";
import styles from "./DetailsPage.module.css";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DetailsPage() {
  const navigate = useNavigate();
  const { selectedItems, totalQuantity, totalAmount, details, setDetails, setLastBooking } =
    useBooking();

  const [form, setForm] = useState(details);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // Guard: land here without a selection — send back to pick tickets.
    if (totalQuantity === 0) navigate("/tickets", { replace: true });
  }, [totalQuantity, navigate]);

  if (totalQuantity === 0) return null;

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your full name";
    if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid 10-digit number";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = async () => {
    setNotice("");
    if (!validate()) return;

    setDetails(form);
    setLoading(true);

    try {
      await loadRazorpayScript();

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((i) => ({ id: i.id, quantity: i.quantity })),
          customer: form,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Could not start payment");

      const paymentResponse = await openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: BRAND.name,
        description: `${EVENT.title} — ${totalQuantity} ticket${totalQuantity > 1 ? "s" : ""}`,
        order_id: orderData.order_id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#8b5cf6" },
      });

      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentResponse,
        }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        throw Object.assign(new Error("verification_failed"), { fatal: true });
      }

      setLastBooking({
        bookingId: orderData.bookingId,
        paymentId: verifyData.paymentId,
        customer: form,
        lineItems: selectedItems,
        totalQuantity,
        amount: totalAmount,
        date: EVENT.date,
        venue: `${EVENT.venue.name}, ${EVENT.venue.area}`,
      });

      navigate("/success");
    } catch (err) {
      setLoading(false);
      if (err?.message === "dismissed") {
        setNotice("Payment cancelled. You can try again whenever you're ready.");
        return;
      }
      navigate("/failure", {
        state: { reason: err?.description || err?.message || "Payment could not be completed." },
      });
    }
  };

  return (
    <div className={styles.page}>
      <Header showBack step={3} totalSteps={4} />

      <main className="container">
        <div className={styles.heading}>
          <h1 className={styles.title}>Your details</h1>
          <p className={styles.subtitle}>We'll send your ticket here. Keep it accurate.</p>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
          <Field
            label="Full name"
            value={form.name}
            onChange={updateField("name")}
            error={errors.name}
            placeholder="As it appears on ID"
            autoComplete="name"
          />
          <Field
            label="Phone number"
            value={form.phone}
            onChange={updateField("phone")}
            error={errors.phone}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={updateField("email")}
            error={errors.email}
            placeholder="you@email.com"
            type="email"
            autoComplete="email"
          />
          <Field
            label="Instagram username"
            optional
            value={form.instagram}
            onChange={updateField("instagram")}
            placeholder="@yourhandle"
            autoComplete="off"
          />
        </form>

        <div className={styles.summary}>
          <OrderSummary items={selectedItems} total={totalAmount} />
        </div>

        {notice && <p className={styles.notice}>{notice}</p>}
      </main>

      <StickyCTA
        label={`PAY ${formatCurrency(totalAmount)}`}
        onClick={handlePay}
        loading={loading}
      />
    </div>
  );
}

function Field({ label, optional, error, ...inputProps }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label} {optional && <span className={styles.optional}>(optional)</span>}
      </span>
      <input className={`${styles.input} ${error ? styles.inputError : ""}`} {...inputProps} />
      {error && <span className={styles.errorText}>{error}</span>}
    </label>
  );
}
