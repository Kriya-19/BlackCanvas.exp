import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TICKETS } from "../config/eventConfig";

const BookingContext = createContext(null);

const STORAGE_KEY = "blackcanvas_booking_v1";

function loadInitial() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function BookingProvider({ children }) {
  const saved = loadInitial();

  const [quantities, setQuantities] = useState(saved?.quantities ?? {});
  const [details, setDetails] = useState(
    saved?.details ?? { name: "", phone: "", email: "", instagram: "" }
  );
  const [lastBooking, setLastBooking] = useState(saved?.lastBooking ?? null);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ quantities, details, lastBooking })
    );
  }, [quantities, details, lastBooking]);

  const setQuantity = (ticketId, qty) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[ticketId];
      else next[ticketId] = qty;
      return next;
    });
  };

  const selectedItems = useMemo(() => {
    return TICKETS.filter((t) => quantities[t.id] > 0).map((t) => ({
      ...t,
      quantity: quantities[t.id],
      subtotal: quantities[t.id] * t.price,
    }));
  }, [quantities]);

  const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);

  const clearBookingDraft = () => {
    setQuantities({});
    setDetails({ name: "", phone: "", email: "", instagram: "" });
  };

  const value = {
    quantities,
    setQuantity,
    selectedItems,
    totalQuantity,
    totalAmount,
    details,
    setDetails,
    lastBooking,
    setLastBooking,
    clearBookingDraft,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
