import Razorpay from "razorpay";
import { TICKETS } from "../src/config/eventConfig.js";

/**
 * POST /api/create-order
 * body: { items: [{ id, quantity }], customer: { name, phone, email, instagram } }
 *
 * Prices are re-derived from the server-side TICKETS config — the amount is
 * NEVER trusted from the client, so a tampered request can't change the price.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items, customer } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No tickets selected" });
    }
    if (!customer?.name || !customer?.phone || !customer?.email) {
      return res.status(400).json({ error: "Missing customer details" });
    }

    // Recompute the order server-side from the trusted config.
    let amount = 0;
    const lineItems = [];
    for (const { id, quantity } of items) {
      const ticket = TICKETS.find((t) => t.id === id);
      if (!ticket) return res.status(400).json({ error: `Unknown ticket: ${id}` });
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > ticket.maxPerOrder) {
        return res.status(400).json({ error: `Invalid quantity for ${ticket.name}` });
      }
      amount += ticket.price * qty;
      lineItems.push({ id: ticket.id, name: ticket.name, price: ticket.price, quantity: qty });
    }

    if (amount * 100 < 100) {
      return res.status(400).json({ error: "Order amount must be at least 100 paise" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay is not configured on the server" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const bookingId = `BC${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: bookingId,
      notes: {
        bookingId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        instagram: customer.instagram || "",
        items: JSON.stringify(lineItems),
      },
    });

    // NOTE: for a production launch, persist { bookingId, order, customer,
    // lineItems, status: "created" } to a database here so you have a
    // record even if the user closes the tab before paying.

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId,
      lineItems,
    });
  } catch (err) {
    console.error("create-order error:", err);
    if (err?.statusCode === 401 || err?.status === 401) {
      return res.status(401).json({ error: "Razorpay authentication failed" });
    }
    return res.status(500).json({ error: "Could not create order" });
  }
}
