import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/revenue", authRequired, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let query = req.db("leads").where("status", "delivery").orWhere("status", "completed");
    if (from) query = query.where("updated_at", ">=", from);
    if (to) query = query.where("updated_at", "<=", to);
    const leads = await query;
    const total = leads.reduce((s, l) => s + Number(l.budget || 0), 0);
    res.json({ total, count: leads.length });
  } catch (e) { next(e); }
});

router.get("/avg-check", authRequired, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let query = req.db("leads").where("status", "delivery").orWhere("status", "completed");
    if (from) query = query.where("updated_at", ">=", from);
    if (to) query = query.where("updated_at", "<=", to);
    const leads = await query;
    const total = leads.reduce((s, l) => s + Number(l.budget || 0), 0);
    res.json({ avg: leads.length ? Math.round(total / leads.length) : 0, count: leads.length });
  } catch (e) { next(e); }
});

router.get("/production", authRequired, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let query = req.db("leads").where("status", "production");
    if (from) query = query.where("created_at", ">=", from);
    if (to) query = query.where("created_at", "<=", to);
    const leads = await query;
    const statuses = { production: leads.length };
    const completed = await req.db("leads").where("status", "completed").whereBetween("updated_at", [from || "1970-01-01", to || "2099-12-31"]);
    res.json({ ...statuses, completed_count: completed.length });
  } catch (e) { next(e); }
});

router.get("/team-stats", authRequired, async (req, res, next) => {
  try {
    const users = await req.db("users").select("id", "name", "avatar");
    const stats = [];
    for (const u of users) {
      const assigned = await req.db("leads").where("assigned_to", u.id).whereNot("status", "cancelled");
      const done = await req.db("leads").where("assigned_to", u.id).where("status", "completed");
      const revenue = done.reduce((s, l) => s + Number(l.budget || 0), 0);
      stats.push({ ...u, leads_count: assigned.length, completed_count: done.length, revenue });
    }
    res.json(stats);
  } catch (e) { next(e); }
});

export default router;
