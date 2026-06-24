import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function toDb(lead) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone || "",
    status: lead.status || "new",
    budget: lead.budget || "—",
    deadline: lead.deadline || "",
    material: lead.material || "",
    material_custom: lead.materialCustom || "",
    type: lead.type || "",
    type_custom: lead.typeCustom || "",
    contact_method: lead.contactMethod || "WhatsApp",
    source: lead.source || "Сайт",
    source_custom: lead.sourceCustom || "",
    messages: JSON.stringify(lead.messages || []),
    activity_log: JSON.stringify(lead.activityLog || []),
    assignee: JSON.stringify(lead.assignee || {}),
  };
}

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    status: row.status,
    budget: row.budget,
    deadline: row.deadline,
    material: row.material,
    materialCustom: row.material_custom,
    type: row.type,
    typeCustom: row.type_custom,
    contactMethod: row.contact_method,
    source: row.source,
    sourceCustom: row.source_custom,
    messages: JSON.parse(row.messages || "[]"),
    activityLog: JSON.parse(row.activity_log || "[]"),
    assignee: JSON.parse(row.assignee || "{}"),
  };
}

// GET /api/leads-v2 — list all leads
router.get("/", authRequired, async (req, res, next) => {
  try {
    const rows = await req.db("leads_v2").orderBy("created_at", "desc");
    res.json(rows.map(fromDb));
  } catch (e) { next(e); }
});

// POST /api/leads-v2 — create lead
router.post("/", authRequired, async (req, res, next) => {
  try {
    const { name, ...rest } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Generate next ID (LD-001, LD-002, ...)
    const last = await req.db("leads_v2").orderBy("created_at", "desc").first();
    const nextNum = last ? parseInt(last.id.replace("LD-", ""), 10) + 1 : 1;
    const id = `LD-${String(nextNum).padStart(3, "0")}`;

    const lead = { id, name, ...rest };
    const dbRow = toDb(lead);
    dbRow.created_at = new Date().toISOString();
    dbRow.updated_at = dbRow.created_at;

    await req.db("leads_v2").insert(dbRow);
    const created = await req.db("leads_v2").where({ id }).first();
    res.status(201).json(fromDb(created));
  } catch (e) { next(e); }
});

// GET /api/leads-v2/:id — get one lead
router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const row = await req.db("leads_v2").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Lead not found" });
    res.json(fromDb(row));
  } catch (e) { next(e); }
});

// PUT /api/leads-v2/:id — update lead
router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const existing = await req.db("leads_v2").where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: "Lead not found" });

    const dbRow = toDb({ ...fromDb(existing), ...req.body });
    dbRow.updated_at = new Date().toISOString();

    await req.db("leads_v2").where({ id: req.params.id }).update(dbRow);
    const updated = await req.db("leads_v2").where({ id: req.params.id }).first();
    res.json(fromDb(updated));
  } catch (e) { next(e); }
});

// DELETE /api/leads-v2/:id — delete lead
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const deleted = await req.db("leads_v2").where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: "Lead not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
