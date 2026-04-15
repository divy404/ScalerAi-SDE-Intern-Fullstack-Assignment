const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { sendCancellationEmail } = require("../utils/email");
const { DEFAULT_USER_ID } = require("../config");

// GET /api/bookings?filter=upcoming|past
router.get("/", async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();

    let where = { userId: DEFAULT_USER_ID };
    if (filter === "upcoming") {
      where.startTime = { gte: now };
      where.status = "CONFIRMED";
    } else if (filter === "past") {
      where.OR = [
        { startTime: { lt: now } },
        { status: "CANCELLED" },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { eventType: true },
      orderBy: { startTime: filter === "past" ? "desc" : "asc" },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id — also used by confirmation page
router.get("/:id", async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { eventType: true, user: { select: { name: true, email: true } } },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: DEFAULT_USER_ID },
      include: { eventType: true, user: true },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED", cancelReason: cancelReason || null },
      include: { eventType: true },
    });

    // Send cancellation email (non-blocking)
    sendCancellationEmail({
      booking: updated,
      eventType: updated.eventType,
      hostName: booking.user.name,
    }).catch(console.error);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
