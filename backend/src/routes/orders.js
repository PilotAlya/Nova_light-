import { Router } from "express";

const router = Router();

// GET /api/orders — list all orders
router.get("/", async (req, res, next) => {
  try {
    const rows = await req.db("orders").orderBy("created_at", "desc");
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/orders — create order
router.post("/", async (req, res, next) => {
  try {
    const { client_name, phone, material, payment_status, responsible, status, total_cost, positions_json, source, deadline, pickup_location } = req.body;
    const created_at = new Date().toISOString();
    const computedDeadline = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const result = await req.db("orders").insert({
      client_name: client_name || "",
      phone: phone || "",
      material: material || "ЛДСП 16мм",
      payment_status: payment_status || "предоплата",
      responsible: responsible || "Администратор",
      status: status || "новый",
      total_cost: total_cost || 0,
      positions_json: JSON.stringify(positions_json || []),
      source: source || "салон",
      deadline: computedDeadline,
      pickup_location: pickup_location || "салон РЭЛАН",
      created_at,
      updated_at: created_at,
    });
    const id = result[0];
    const created = await req.db("orders").where({ id }).first();
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// GET /api/orders/:id — get one order
router.get("/:id", async (req, res, next) => {
  try {
    const row = await req.db("orders").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Order not found" });
    row.positions_json = JSON.parse(row.positions_json || "[]");
    row.history = JSON.parse(row.history || "[]");
    res.json(row);
  } catch (e) { next(e); }
});

// PUT /api/orders/:id — update order
router.put("/:id", async (req, res, next) => {
  try {
    const existing = await req.db("orders").where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: "Order not found" });

    const changedFields = {};
    for (const key of Object.keys(req.body)) {
      if (key === "history" || key === "updated_at") continue;
      const oldVal = existing[key];
      const newVal = req.body[key];
      if (String(oldVal) !== String(newVal)) {
        changedFields[key] = { from: oldVal, to: newVal };
      }
    }

    let history = [];
    try { history = JSON.parse(existing.history || "[]"); } catch {}

    if (Object.keys(changedFields).length > 0) {
      history.push({
        timestamp: new Date().toISOString(),
        changed_by: req.body.changed_by || "Система",
        fields: changedFields,
      });
    }

    const updateData = { ...req.body, history: JSON.stringify(history), updated_at: new Date().toISOString() };
    if (req.body.positions_json) {
      updateData.positions_json = JSON.stringify(req.body.positions_json);
    }

    await req.db("orders").where({ id: req.params.id }).update(updateData);
    const updated = await req.db("orders").where({ id: req.params.id }).first();
    updated.positions_json = JSON.parse(updated.positions_json || "[]");
    updated.history = JSON.parse(updated.history || "[]");
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/orders/:id — delete order
router.delete("/:id", async (req, res, next) => {
  try {
    await req.db("orders").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
