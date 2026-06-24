import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const promos = await req.db("promos").orderBy("created_at", "desc");
    res.json(promos);
  } catch (e) { next(e); }
});

router.post("/", authRequired, async (req, res, next) => {
  try {
    const { title, description, url, supplier, is_active } = req.body;
    const [id] = await req.db("promos").insert({ title, description, url, supplier, is_active: is_active !== false });
    const promo = await req.db("promos").where({ id }).first();
    res.status(201).json(promo);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { title, description, url, supplier, is_active } = req.body;
    await req.db("promos").where({ id: req.params.id }).update({ title, description, url, supplier, is_active });
    const promo = await req.db("promos").where({ id: req.params.id }).first();
    res.json(promo);
  } catch (e) { next(e); }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    await req.db("promos").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
