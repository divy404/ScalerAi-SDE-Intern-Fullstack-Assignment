const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { DEFAULT_USER_ID } = require("../config");

// GET /api/event-types
router.get("/", async (req, res) => {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "asc" },
    });
    res.json(eventTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/event-types/:id
router.get("/:id", async (req, res) => {
  try {
    const et = await prisma.eventType.findFirst({
      where: { id: req.params.id, userId: DEFAULT_USER_ID },
    });
    if (!et) return res.status(404).json({ error: "Event type not found" });
    res.json(et);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/event-types
router.post("/", async (req, res) => {
  try {
    const { name, duration, slug, description, color } = req.body;
    if (!name || !duration || !slug) {
      return res.status(400).json({ error: "name, duration, and slug are required" });
    }

    // Check slug uniqueness
    const existing = await prisma.eventType.findFirst({
      where: { userId: DEFAULT_USER_ID, slug },
    });
    if (existing) {
      return res.status(400).json({ error: "Slug already exists. Please choose a different one." });
    }

    const et = await prisma.eventType.create({
      data: {
        userId: DEFAULT_USER_ID,
        name,
        duration: parseInt(duration),
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description: description || null,
        color: color || "#0069ff",
      },
    });
    res.status(201).json(et);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/event-types/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, duration, slug, description, color, isActive } = req.body;

    // If slug changed, check uniqueness
    if (slug) {
      const existing = await prisma.eventType.findFirst({
        where: {
          userId: DEFAULT_USER_ID,
          slug,
          NOT: { id: req.params.id },
        },
      });
      if (existing) {
        return res.status(400).json({ error: "Slug already in use" });
      }
    }

    const et = await prisma.eventType.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(duration && { duration: parseInt(duration) }),
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, "-") }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(et);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/event-types/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.eventType.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
