import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * POST /api/verify-payment
 * body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Verifies the HMAC signature Razorpay sends back so a payment can't be
 * faked from the browser. This is the ONLY place a booking should be
 * marked as paid.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body ?? {};

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ verified: false, error: "Missing payment fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ verified: false, error: "Razorpay is not configured on the server" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(razorpay_signature, "utf8")
      );

    if (!isValid) {
      return res.status(400).json({ verified: false, error: "Signature mismatch" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (order.id !== razorpay_order_id || payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ verified: false, error: "Payment does not match order" });
    }

    const notes = order.notes ?? {};
    const bookingId = notes.bookingId;
    const ticketType = notes.ticketType;
    const quantity = Number(notes.quantity);
    const amount = Number(notes.amount);

    if (
      !bookingId ||
      !notes.customerName ||
      !notes.customerEmail ||
      !notes.customerPhone ||
      !ticketType ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      order.amount !== amount * 100
    ) {
      return res.status(500).json({ verified: false, error: "Invalid order metadata" });
    }

    let sheetsSaved = false;
    let persistenceError;
    if (process.env.GOOGLE_APPS_SCRIPT_URL && process.env.GOOGLE_APPS_SCRIPT_API_KEY) {
      try {
        const sheetsResponse = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: process.env.GOOGLE_APPS_SCRIPT_API_KEY,
            action: "save_booking",
            bookingId,
            name: notes.customerName,
            email: notes.customerEmail,
            phone: notes.customerPhone,
            ticketType,
            quantity,
            amount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            paymentStatus: "PAID",
            ticketToken: bookingId,
          }),
        });

        if (!sheetsResponse.ok) {
          throw new Error(`Apps Script returned HTTP ${sheetsResponse.status}`);
        }
        const sheetsData = await sheetsResponse.json();
        if (sheetsData.success !== true) {
          throw new Error("Apps Script reported persistence failure");
        }
        sheetsSaved = true;
      } catch (err) {
        persistenceError = "Booking verified, but Google Sheets persistence failed";
        console.error("booking persistence error:", err.message);
      }
    } else {
      persistenceError = "Google Sheets persistence is not configured";
      console.error("booking persistence error: missing Apps Script configuration");
    }

    return res.status(200).json({
      verified: true,
      success: true,
      sheetsSaved,
      ...(persistenceError ? { persistenceError } : {}),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ verified: false, error: "Could not verify payment" });
  }
}
