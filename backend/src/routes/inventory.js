import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const { zone } = req.query;
    let query = req.db("inventory").orderBy("name", "asc");
    if (zone) query = query.where({ zone });
    const items = await query;
    res.json(items);
  } catch (e) { next(e); }
});

router.post("/", authRequired, async (req, res, next) => {
  try {
    const { zone, name, category, unit, quantity, price, supplier, url, note, minThreshold } = req.body;
    const [id] = await req.db("inventory").insert({ zone, name, category, unit, quantity, price, supplier, url, note, minThreshold });
    const item = await req.db("inventory").where({ id }).first();
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { zone, name, category, unit, quantity, price, supplier, url, note, minThreshold } = req.body;
    await req.db("inventory").where({ id: req.params.id }).update({ zone, name, category, unit, quantity, price, supplier, url, note, minThreshold, updated_at: req.db.fn.now() });
    const item = await req.db("inventory").where({ id: req.params.id }).first();
    res.json(item);
  } catch (e) { next(e); }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    await req.db("inventory").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
