import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import knex from "knex";
import authRoutes from "../backend/src/routes/auth.js";
import userRoutes from "../backend/src/routes/users.js";
import leadRoutes from "../backend/src/routes/leads.js";
import clientRoutes from "../backend/src/routes/clients.js";
import timelineRoutes from "../backend/src/routes/timeline.js";
import checklistRoutes from "../backend/src/routes/checklist.js";
import inventoryRoutes from "../backend/src/routes/inventory.js";
import promoRoutes from "../backend/src/routes/promos.js";
import analyticsRoutes from "../backend/src/routes/analytics.js";
import aiRoutes from "../backend/src/routes/ai.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = !!process.env.VERCEL;
const dataDir = isVercel ? "/tmp" : path.resolve(__dirname, "../backend/data");
const dbPath = path.join(dataDir, "nova.db");

const db = knex({
  client: "better-sqlite3",
  connection: { filename: dbPath },
  useNullAsDefault: true,
  migrations: { directory: path.resolve(__dirname, "../backend/migrations") },
  seeds: { directory: path.resolve(__dirname, "../backend/seeds") },
});

async function ensureDb() {
  const exists = await db.schema.hasTable("users").catch(() => false);
  if (!exists) {
    await db.migrate.latest();
    await db.seed.run();
  }
}

const app = express();
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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

export default async function handler(req, res) {
  await ensureDb().catch(() => {});
  return app(req, res);
}
