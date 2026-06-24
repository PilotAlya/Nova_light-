import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    let query = req.db("clients").orderBy("created_at", "desc");
    if (search) query = query.where(function () { this.where("name", "like", `%${search}%`).orWhere("phone", "like", `%${search}%`); });
    if (tag) query = query.whereRaw("? = ANY(tags)", [tag]);
    const clients = await query;
    for (const c of clients) {
      c.orders = await req.db("orders").where({ client_id: c.id }).orderBy("created_at", "desc");
      for (const o of c.orders) {
        o.payments = await req.db("payments").where({ order_id: o.id }).orderBy("paid_at", "asc");
      }
      c.communications = await req.db("communications").where({ client_id: c.id }).orderBy("created_at", "desc").limit(20);
      const leadIds = (await req.db("client_leads").where({ client_id: c.id })).map(cl => cl.lead_id);
      c.lead_ids = leadIds;
    }
    res.json(clients);
  } catch (e) { next(e); }
});

router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const c = await req.db("clients").where({ id: req.params.id }).first();
    if (!c) return res.status(404).json({ error: "Клиент не найден" });
    c.orders = await req.db("orders").where({ client_id: c.id }).orderBy("created_at", "desc");
    for (const o of c.orders) {
      o.payments = await req.db("payments").where({ order_id: o.id }).orderBy("paid_at", "asc");
    }
    c.communications = await req.db("communications").where({ client_id: c.id }).orderBy("created_at", "desc").limit(20);
    const leadIds = (await req.db("client_leads").where({ client_id: c.id })).map(cl => cl.lead_id);
    c.lead_ids = leadIds;
    res.json(c);
  } catch (e) { next(e); }
});

router.post("/", authRequired, async (req, res, next) => {
  try {
    const { name, phone, email, telegram, vk, whatsapp, source, tags, notes, avatar_emoji } = req.body;
    const [id] = await req.db("clients").insert({ name, phone, email, telegram, vk, whatsapp, source, tags: JSON.stringify(tags || []), notes, avatar_emoji, created_by: req.user.id });
    const client = await req.db("clients").where({ id }).first();
    res.status(201).json(client);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { name, phone, email, telegram, vk, whatsapp, source, tags, notes, avatar_emoji } = req.body;
    await req.db("clients").where({ id: req.params.id }).update({ name, phone, email, telegram, vk, whatsapp, source, tags: JSON.stringify(tags || []), notes, avatar_emoji, updated_at: req.db.fn.now() });
    const client = await req.db("clients").where({ id: req.params.id }).first();
    res.json(client);
  } catch (e) { next(e); }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    await req.db("clients").where({ id: req.params.id }).del();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── Orders ──
router.get("/:id/orders", authRequired, async (req, res, next) => {
  try {
    const orders = await req.db("orders").where({ client_id: req.params.id }).orderBy("created_at", "desc");
    for (const o of orders) {
      o.payments = await req.db("payments").where({ order_id: o.id }).orderBy("paid_at", "asc");
    }
    res.json(orders);
  } catch (e) { next(e); }
});

router.post("/:id/orders", authRequired, async (req, res, next) => {
  try {
    const { lead_id, title, status, total, prepayment, deadline } = req.body;
    const [id] = await req.db("orders").insert({ client_id: req.params.id, lead_id, title, status: status || "prepayment", total, prepayment: prepayment || 0, deadline });
    const order = await req.db("orders").where({ id }).first();
    if (prepayment) {
      await req.db("payments").insert({ order_id: id, type: "prepayment", amount: prepayment, created_by: req.user.id });
    }
    res.status(201).json(order);
  } catch (e) { next(e); }
});

// ── Payments ──
router.get("/orders/:id/payments", authRequired, async (req, res, next) => {
  try {
    const payments = await req.db("payments").where({ order_id: req.params.id }).orderBy("paid_at", "asc");
    res.json(payments);
  } catch (e) { next(e); }
});

router.post("/orders/:id/payments", authRequired, async (req, res, next) => {
  try {
    const { type, amount, method, note } = req.body;
    const [id] = await req.db("payments").insert({ order_id: req.params.id, type, amount, method, note, created_by: req.user.id });
    const payment = await req.db("payments").where({ id }).first();
    res.status(201).json(payment);
  } catch (e) { next(e); }
});

// ── Communications ──
router.get("/:id/communications", authRequired, async (req, res, next) => {
  try {
    const comms = await req.db("communications").where({ client_id: req.params.id }).orderBy("created_at", "desc").limit(50);
    res.json(comms);
  } catch (e) { next(e); }
});

router.post("/:id/communications", authRequired, async (req, res, next) => {
  try {
    const { channel, direction, message } = req.body;
    const [id] = await req.db("communications").insert({ client_id: req.params.id, channel, direction, message, owner: req.user.id });
    const comm = await req.db("communications").where({ id }).first();
    res.status(201).json(comm);
  } catch (e) { next(e); }
});

export default router;
