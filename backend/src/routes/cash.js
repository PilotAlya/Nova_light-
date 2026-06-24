import { Router } from "express";

const router = Router();

// GET /api/cash/shifts — list all shifts
router.get("/shifts", async (req, res, next) => {
  try {
    const rows = await req.db("cash_shifts").orderBy("date", "desc");
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/cash/shifts/:id — single shift with entries
router.get("/shifts/:id", async (req, res, next) => {
  try {
    const shift = await req.db("cash_shifts").where({ id: req.params.id }).first();
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    const entries = await req.db("cash_entries").where({ shift_id: req.params.id }).orderBy("created_at", "asc");
    shift.entries = entries;
    res.json(shift);
  } catch (e) { next(e); }
});

// GET /api/cash/today — get today's open shift (or create one)
router.get("/today", async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    let shift = await req.db("cash_shifts").where({ date: today, status: "open" }).first();
    if (!shift) {
      const [id] = await req.db("cash_shifts").insert({
        date: today,
        start_amount: 0,
        cash_total: 0,
        cashless_total: 0,
        expense_total: 0,
        expected_balance: 0,
        actual_balance: 0,
        status: "open",
        opened_by: "Администратор",
        opened_at: new Date().toISOString(),
      });
      shift = await req.db("cash_shifts").where({ id }).first();
    }
    const entries = await req.db("cash_entries").where({ shift_id: shift.id }).orderBy("created_at", "asc");
    shift.entries = entries;
    res.json(shift);
  } catch (e) { next(e); }
});

// PUT /api/cash/shifts/:id/open — open shift (set start amount)
router.put("/shifts/:id/open", async (req, res, next) => {
  try {
    const { start_amount, opened_by } = req.body;
    await req.db("cash_shifts").where({ id: req.params.id }).update({
      start_amount: start_amount || 0,
      opened_by: opened_by || "Администратор",
      opened_at: new Date().toISOString(),
    });
    const updated = await req.db("cash_shifts").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { next(e); }
});

// PUT /api/cash/shifts/:id/close — close shift
router.put("/shifts/:id/close", async (req, res, next) => {
  try {
    const { actual_balance, closed_by } = req.body;
    const shift = await req.db("cash_shifts").where({ id: req.params.id }).first();
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    await req.db("cash_shifts").where({ id: req.params.id }).update({
      actual_balance: actual_balance || 0,
      expected_balance: shift.start_amount + (shift.cash_total || 0) - (shift.expense_total || 0),
      status: "closed",
      closed_by: closed_by || "Администратор",
      closed_at: new Date().toISOString(),
    });
    const updated = await req.db("cash_shifts").where({ id: req.params.id }).first();
    res.json(updated);
  } catch (e) { next(e); }
});

// POST /api/cash/entries — add entry (sale or expense)
router.post("/entries", async (req, res, next) => {
  try {
    const { shift_id, type, amount, method, category, notes } = req.body;
    if (!shift_id || !type) return res.status(400).json({ error: "shift_id and type required" });
    const [id] = await req.db("cash_entries").insert({
      shift_id,
      type,
      amount: amount || 0,
      method: method || "cash",
      category: category || "",
      notes: notes || "",
      created_at: new Date().toISOString(),
    });
    const entry = await req.db("cash_entries").where({ id }).first();

    // Update shift totals
    const shift = await req.db("cash_shifts").where({ id: shift_id }).first();
    if (shift) {
      const updateData = { expected_balance: shift.start_amount };
      if (type === "sale") {
        if (method === "cash") updateData.cash_total = (shift.cash_total || 0) + Number(amount);
        else updateData.cashless_total = (shift.cashless_total || 0) + Number(amount);
      } else if (type === "expense") {
        updateData.expense_total = (shift.expense_total || 0) + Number(amount);
      }
      updateData.expected_balance = (shift.start_amount || 0) + (updateData.cash_total ?? shift.cash_total ?? 0) - (updateData.expense_total ?? shift.expense_total ?? 0);
      await req.db("cash_shifts").where({ id: shift_id }).update(updateData);
    }

    res.status(201).json(entry);
  } catch (e) { next(e); }
});

// DELETE /api/cash/entries/:id — delete an entry
router.delete("/entries/:id", async (req, res, next) => {
  try {
    const entry = await req.db("cash_entries").where({ id: req.params.id }).first();
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    const shift = await req.db("cash_shifts").where({ id: entry.shift_id }).first();
    await req.db("cash_entries").where({ id: req.params.id }).del();
    // Recalculate shift totals
    if (shift) {
      const entries = await req.db("cash_entries").where({ shift_id: shift.id });
      const cashTotal = entries.filter(e => e.type === "sale" && e.method === "cash").reduce((s, e) => s + Number(e.amount), 0);
      const cashlessTotal = entries.filter(e => e.type === "sale" && e.method !== "cash").reduce((s, e) => s + Number(e.amount), 0);
      const expenseTotal = entries.filter(e => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
      await req.db("cash_shifts").where({ id: shift.id }).update({
        cash_total: cashTotal,
        cashless_total: cashlessTotal,
        expense_total: expenseTotal,
        expected_balance: (shift.start_amount || 0) + cashTotal - expenseTotal,
      });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
