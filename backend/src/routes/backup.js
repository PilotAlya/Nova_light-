import { Router } from "express";

const router = Router();

const TABLES = [
  "orders", "prices", "leads_v2", "clients", "inventory",
  "app_data", "cash_shifts", "cash_entries", "cleaning_schedule",
  "materials", "material_consumption",
];

// GET /api/backup/export — full JSON dump
router.get("/export", async (req, res, next) => {
  try {
    const dump = {};
    for (const table of TABLES) {
      try {
        const exists = await req.db.schema.hasTable(table);
        if (exists) {
          dump[table] = await req.db(table).select("*");
        }
      } catch {}
    }
    dump["_exported_at"] = new Date().toISOString();
    res.json(dump);
  } catch (e) { next(e); }
});

// POST /api/backup/import — restore from JSON dump
router.post("/import", async (req, res, next) => {
  try {
    const dump = req.body;
    const results = { restored: [], errors: [] };

    for (const table of TABLES) {
      if (!dump[table] || !Array.isArray(dump[table])) continue;
      try {
        const exists = await req.db.schema.hasTable(table);
        if (!exists) continue;

        await req.db(table).del();
        if (dump[table].length > 0) {
          await req.db(table).insert(dump[table]);
        }
        results.restored.push(`${table}: ${dump[table].length} записей`);
      } catch (e) {
        results.errors.push(`${table}: ${e.message}`);
      }
    }

    res.json(results);
  } catch (e) { next(e); }
});

export default router;
