import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const { lead_id } = req.query;
    let query = req.db("timeline_entries").orderBy("sort_order", "asc");
    if (lead_id) query = query.where({ lead_id });
    const entries = await query;
    for (const e of entries) {
      e.member = await req.db("users").where({ id: e.member_id }).select("id", "name", "avatar").first();
    }
    res.json(entries);
  } catch (e) { next(e); }
});

router.post("/", authRequired, async (req, res, next) => {
  try {
    const { lead_id, member_id, task, start_date, end_date, status, color } = req.body;
    const [id] = await req.db("timeline_entries").insert({ lead_id, member_id, task, start_date, end_date, status: status || "planned", color });
    const entry = await req.db("timeline_entries").where({ id }).first();
    res.status(201).json(entry);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { member_id, task, start_date, end_date, status, color } = req.body;
    await req.db("timeline_entries").where({ id: req.params.id }).update({ member_id, task, start_date, end_date, status, color });
    const entry = await req.db("timeline_entries").where({ id: req.params.id }).first();
    res.json(entry);
  } catch (e) { next(e); }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    await req.db("timeline_entries").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
