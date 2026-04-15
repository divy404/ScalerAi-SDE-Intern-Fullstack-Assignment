require("dotenv").config();
const express = require("express");
const cors = require("cors");

const eventTypeRoutes = require("./routes/eventTypes");
const availabilityRoutes = require("./routes/availability");
const bookingRoutes = require("./routes/bookings");
const publicRoutes = require("./routes/public");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/public", publicRoutes); // Public booking page routes

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
