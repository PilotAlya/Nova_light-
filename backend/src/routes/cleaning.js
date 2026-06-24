import { Router } from "express";

const router = Router();

// GET /api/cleaning — list all schedule entries
router.get("/", async (req, res, next) => {
  try {
    const rows = await req.db("cleaning_schedule").orderBy("day_of_week", "asc").orderBy("id", "asc");
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/cleaning — create entry
router.post("/", async (req, res, next) => {
  try {
    const { task_name, day_of_week, assignee, notes } = req.body;
    if (!task_name || day_of_week == null) return res.status(400).json({ error: "task_name and day_of_week required" });
    const [id] = await req.db("cleaning_schedule").insert({ task_name, day_of_week, assignee: assignee || "", notes: notes || "" });
    const item = await req.db("cleaning_schedule").where({ id }).first();
    res.status(201).json(item);
  } catch (e) { next(e); }
});

// PUT /api/cleaning/:id — update entry
router.put("/:id", async (req, res, next) => {
  try {
    const { task_name, day_of_week, assignee, notes } = req.body;
    await req.db("cleaning_schedule").where({ id: req.params.id }).update({ task_name, day_of_week, assignee: assignee || "", notes: notes || "" });
    const item = await req.db("cleaning_schedule").where({ id: req.params.id }).first();
    res.json(item);
  } catch (e) { next(e); }
});

// DELETE /api/cleaning/:id — delete entry
router.delete("/:id", async (req, res, next) => {
  try {
    await req.db("cleaning_schedule").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
