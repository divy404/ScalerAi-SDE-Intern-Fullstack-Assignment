const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { generateAvailableSlots } = require("../utils/slotCalculator");
const { sendBookingConfirmation } = require("../utils/email");

// GET /api/public/:username - Get user profile + event types (public scheduling page)
router.get("/:username", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, name: true, username: true, timezone: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, slug: true, duration: true, description: true, color: true },
    });

    // Also return availability so the frontend can grey-out unavailable days
    const availability = await prisma.availability.findMany({
      where: { userId: user.id, isActive: true },
      select: { dayOfWeek: true },
    });
    const availableDays = availability.map((a) => a.dayOfWeek);

    res.json({ user, eventTypes, availableDays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/:username/:slug - Get event type details
router.get("/:username/:slug", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug: req.params.slug, isActive: true },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    // Return availability days so the calendar knows which days to enable
    const availability = await prisma.availability.findMany({
      where: { userId: user.id, isActive: true },
      select: { dayOfWeek: true },
    });
    const availableDays = availability.map((a) => a.dayOfWeek);

    res.json({
      user: { name: user.name, username: user.username, timezone: user.timezone },
      eventType,
      availableDays,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/:username/:slug/slots?date=YYYY-MM-DD
router.get("/:username/:slug/slots", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });

    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug: req.params.slug, isActive: true },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    // Parse the requested date — use wide window to catch cross-day overlaps
    const targetDate = new Date(date + "T00:00:00.000Z");
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Get availability for this user
    const availabilities = await prisma.availability.findMany({
      where: { userId: user.id, isActive: true },
    });

    // Fixed: Use overlap logic to catch bookings that span day boundaries
    const existingBookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    });

    const slots = generateAvailableSlots(
      targetDate,
      eventType.duration,
      availabilities,
      existingBookings,
      user.timezone
    );

    res.json({ slots, timezone: user.timezone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/public/:username/:slug/book
router.post("/:username/:slug/book", async (req, res) => {
  try {
    const { inviteeName, inviteeEmail, startTime, timezone, notes } = req.body;

    if (!inviteeName || !inviteeEmail || !startTime) {
      return res.status(400).json({ error: "inviteeName, inviteeEmail, and startTime are required" });
    }

    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug: req.params.slug, isActive: true },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + eventType.duration * 60000);

    // Double-booking check
    const conflict = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({ error: "This time slot is no longer available. Please choose another." });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        eventTypeId: eventType.id,
        inviteeName,
        inviteeEmail,
        startTime: start,
        endTime: end,
        timezone: timezone || user.timezone,
        notes: notes || null,
        status: "CONFIRMED",
      },
      include: { eventType: true },
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation({
      booking,
      eventType,
      hostName: user.name,
    }).catch(console.error);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
