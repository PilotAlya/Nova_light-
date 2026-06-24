import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/:lead_id", authRequired, async (req, res, next) => {
  try {
    const items = await req.db("checklist_items").where({ lead_id: req.params.lead_id }).orderBy("sort_order", "asc");
    res.json(items);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { done } = req.body;
    await req.db("checklist_items").where({ id: req.params.id }).update({ done, done_by: done ? req.user.id : null, done_at: done ? req.db.fn.now() : null });
    const item = await req.db("checklist_items").where({ id: req.params.id }).first();
    res.json(item);
  } catch (e) { next(e); }
});

router.post("/:lead_id", authRequired, async (req, res, next) => {
  try {
    const { category, title, template } = req.body;
    const [id] = await req.db("checklist_items").insert({ lead_id: req.params.lead_id, template: template || "kitchen", category, title, is_custom: true });
    const item = await req.db("checklist_items").where({ id }).first();
    res.status(201).json(item);
  } catch (e) { next(e); }
});

export default router;
