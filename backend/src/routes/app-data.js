import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// GET /api/app-data/:key — get data blob for current user
router.get("/:key", authRequired, async (req, res) => {
  try {
    const row = await req.db("app_data")
      .where({ user_id: req.user.id, key: req.params.key })
      .first();
    res.json(row ? JSON.parse(row.value) : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/app-data/:key — upsert data blob for current user
router.put("/:key", authRequired, async (req, res) => {
  try {
    const value = JSON.stringify(req.body);
    await req.db("app_data")
      .insert({ user_id: req.user.id, key: req.params.key, value })
      .onConflict(["user_id", "key"])
      .merge();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
