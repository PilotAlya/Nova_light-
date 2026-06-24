import { Router } from "express";

const router = Router();

// GET /api/prices — get all prices
router.get("/", async (req, res, next) => {
  try {
    const rows = await req.db("prices");
    const prices = {};
    rows.forEach((row) => { prices[row.key] = row.value; });
    res.json(prices);
  } catch (e) { next(e); }
});

// PUT /api/prices — update prices
router.put("/", async (req, res, next) => {
  try {
    const { price_l_ka, price_edge, price_hinge, price_internal_operation } = req.body;
    const entries = [
      ["price_l_ka", price_l_ka],
      ["price_edge", price_edge],
      ["price_hinge", price_hinge],
      ["price_internal_operation", price_internal_operation],
    ];
    for (const [key, value] of entries) {
      if (value !== undefined) {
        await req.db("prices").insert({ key, value }).onConflict("key").merge();
      }
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
