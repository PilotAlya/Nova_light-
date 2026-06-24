import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import knex from "knex";
import knexConfig from "./knexfile.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import leadRoutes from "./routes/leads.js";
import clientRoutes from "./routes/clients.js";
import timelineRoutes from "./routes/timeline.js";
import checklistRoutes from "./routes/checklist.js";
import inventoryRoutes from "./routes/inventory.js";
import promoRoutes from "./routes/promos.js";
import analyticsRoutes from "./routes/analytics.js";
import aiRoutes from "./routes/ai.js";
import appDataRoutes from "./routes/app-data.js";
import leadsV2Routes from "./routes/leads-v2.js";
import pricesRoutes from "./routes/prices.js";
import ordersRoutes from "./routes/orders.js";
import cashRoutes from "./routes/cash.js";
import cleaningRoutes from "./routes/cleaning.js";
import materialsRoutes from "./routes/materials.js";
import backupRoutes from "./routes/backup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = knex(knexConfig);
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use((req, res, next) => { req.db = db; next(); });

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/app-data", appDataRoutes);
app.use("/api/leads-v2", leadsV2Routes);
app.use("/api/prices", pricesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/backup", backupRoutes);

// Serve built frontend
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

// SPA fallback — any non-API route serves index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Nova API running on http://localhost:${PORT}`);
});
