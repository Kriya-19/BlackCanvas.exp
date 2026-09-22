import crypto from "crypto";

/**
 * POST /api/verify-payment
 * body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   bookingId, customer, lineItems, amount
 * }
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
      bookingId,
      customer,
      lineItems,
      amount,
    } = req.body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: "Missing payment fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ verified: false, error: "Razorpay is not configured on the server" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ verified: false, error: "Signature mismatch" });
    }

    // NOTE: for a production launch, this is where you'd flip the booking
    // record (matched by bookingId) to status: "paid" in your database,
    // and optionally send a confirmation email/SMS here.

    return res.status(200).json({
      verified: true,
      bookingId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      customer,
      lineItems,
      amount,
    });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ verified: false, error: "Could not verify payment" });
  }
}
