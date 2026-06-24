import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const { status, assigned_to, search } = req.query;
    let query = req.db("leads").orderBy("created_at", "desc");
    if (status) query = query.where({ status });
    if (assigned_to) query = query.where({ assigned_to });
    if (search) query = query.where(function () { this.where("title", "like", `%${search}%`).orWhere("phone", "like", `%${search}%`); });
    const leads = await query;
    const finances = await req.db("lead_finances").select("*");
    const finMap = Object.fromEntries(finances.map(f => [f.lead_id, f]));
    res.json(leads.map(l => ({ ...l, finances: finMap[l.id] || null })));
  } catch (e) { next(e); }
});

router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const lead = await req.db("leads").where({ id: req.params.id }).first();
    if (!lead) return res.status(404).json({ error: "Лид не найден" });
    const finances = await req.db("lead_finances").where({ lead_id: lead.id }).first();
    res.json({ ...lead, finances: finances || null });
  } catch (e) { next(e); }
});

router.post("/", authRequired, async (req, res, next) => {
  try {
    const { title, type, type_custom, source, source_custom, phone, status, budget, deposit, assigned_to, deadline, notes } = req.body;
    const [id] = await req.db("leads").insert({ title, type, type_custom, source, source_custom, phone, status: status || "new", budget, deposit, assigned_to, deadline, notes, created_by: req.user.id });
    const lead = await req.db("leads").where({ id }).first();
    res.status(201).json(lead);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { title, type, type_custom, source, source_custom, phone, status, budget, deposit, assigned_to, deadline, notes } = req.body;
    await req.db("leads").where({ id: req.params.id }).update({ title, type, type_custom, source, source_custom, phone, status, budget, deposit, assigned_to, deadline, notes, updated_at: req.db.fn.now() });
    if (req.body.finances) {
      const f = req.body.finances;
      await req.db("lead_finances").where({ lead_id: req.params.id }).update({ materials_cost: f.materials_cost, master_pct: f.master_pct, accountant_pct: f.accountant_pct, overhead_pct: f.overhead_pct, final_price: f.final_price });
    }
    const lead = await req.db("leads").where({ id: req.params.id }).first();
    const finances = await req.db("lead_finances").where({ lead_id: lead.id }).first();
    res.json({ ...lead, finances: finances || null });
  } catch (e) { next(e); }
});

router.patch("/:id/status", authRequired, async (req, res, next) => {
  try {
    await req.db("leads").where({ id: req.params.id }).update({ status: req.body.status });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    await req.db("leads").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── Finances ──
router.put("/:id/finances", authRequired, async (req, res, next) => {
  try {
    const exists = await req.db("lead_finances").where({ lead_id: req.params.id }).first();
    if (exists) {
      await req.db("lead_finances").where({ lead_id: req.params.id }).update(req.body);
    } else {
      await req.db("lead_finances").insert({ lead_id: req.params.id, ...req.body });
    }
    const data = await req.db("lead_finances").where({ lead_id: req.params.id }).first();
    res.json(data);
  } catch (e) { next(e); }
});

// ── Measurements ──
router.get("/:id/measurements", authRequired, async (req, res, next) => {
  try {
    const ms = await req.db("measurements").where({ lead_id: req.params.id }).orderBy("created_at", "desc");
    res.json(ms);
  } catch (e) { next(e); }
});

router.post("/:id/measurements", authRequired, async (req, res, next) => {
  try {
    const [id] = await req.db("measurements").insert({ lead_id: req.params.id, data: JSON.stringify(req.body.data), created_by: req.user.id });
    const m = await req.db("measurements").where({ id }).first();
    res.status(201).json(m);
  } catch (e) { next(e); }
});

export default router;
