const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");

const DEFAULT_USER_ID = "default-user-id";

// GET /api/availability
router.get("/", async (req, res) => {
  try {
    const availability = await prisma.availability.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { dayOfWeek: "asc" },
    });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/availability - Upsert full week availability
router.put("/", async (req, res) => {
  try {
    const { schedule } = req.body;
    // schedule: [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true }, ...]

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: "schedule must be an array" });
    }

    const results = await Promise.all(
      schedule.map((day) =>
        prisma.availability.upsert({
          where: {
            userId_dayOfWeek: {
              userId: DEFAULT_USER_ID,
              dayOfWeek: day.dayOfWeek,
            },
          },
          update: {
            startTime: day.startTime,
            endTime: day.endTime,
            isActive: day.isActive,
          },
          create: {
            userId: DEFAULT_USER_ID,
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
            isActive: day.isActive,
          },
        })
      )
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/availability/user - Get user info + timezone
router.get("/user", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      select: { id: true, name: true, username: true, timezone: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/availability/timezone
router.put("/timezone", async (req, res) => {
  try {
    const { timezone } = req.body;
    if (!timezone) return res.status(400).json({ error: "timezone required" });

    const user = await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: { timezone },
    });
    res.json({ timezone: user.timezone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
