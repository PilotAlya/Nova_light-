import { Router } from "express";

const router = Router();

// GET /api/materials
router.get("/", async (req, res, next) => {
  try {
    const rows = await req.db("materials").orderBy("name");
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/materials
router.post("/", async (req, res, next) => {
  try {
    const { name, total_qty, unit, notes } = req.body;
    const result = await req.db("materials").insert({
      name: name || "Материал",
      total_qty: total_qty || 0,
      used_qty: 0,
      unit: unit || "лист",
      notes: notes || "",
    });
    const id = result[0];
    const created = await req.db("materials").where({ id }).first();
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// PUT /api/materials/:id
router.put("/:id", async (req, res, next) => {
  try {
    const existing = await req.db("materials").where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: "Material not found" });
    await req.db("materials").where({ id: req.params.id }).update({
      ...req.body,
      updated_at: new Date().toISOString(),
    });
    const updated = await req.db("materials").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/materials/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await req.db("materials").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /api/materials/:id/consume — record consumption
router.post("/:id/consume", async (req, res, next) => {
  try {
    const { qty, order_id, notes } = req.body;
    const material = await req.db("materials").where({ id: req.params.id }).first();
    if (!material) return res.status(404).json({ error: "Material not found" });

    await req.db("material_consumption").insert({
      material_id: parseInt(req.params.id),
      order_id: order_id || null,
      qty: qty || 0,
      notes: notes || "",
    });

    const newUsed = parseFloat(material.used_qty) + parseFloat(qty || 0);
    await req.db("materials").where({ id: req.params.id }).update({
      used_qty: newUsed,
      updated_at: new Date().toISOString(),
    });

    const updated = await req.db("materials").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { next(e); }
});

// GET /api/materials/:id/consumption — get consumption log
router.get("/:id/consumption", async (req, res, next) => {
  try {
    const rows = await req.db("material_consumption")
      .where({ material_id: req.params.id })
      .orderBy("created_at", "desc");
    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
