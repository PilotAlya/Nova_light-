import { Router } from "express";

const router = Router();

export const SUPPLIERS = [
  { id: "rondo", label: "Рондо / Ладья" },
  { id: "partner", label: "Партнер" },
  { id: "vasilyevo", label: "Васильево / Ортус" },
];

export const DAY_TASK_TITLES = [
  "Включить Инфопредприятие → интерфейс кассира",
  "Пересчитать деньги в кассе",
  "Перепроверить чеки: сумма на чеках = сумма в программе",
  "Отдать проверенные чеки бухгалтеру",
  "Платежные документы → оплата по эквайрингу: с АВТО на Д/Р (Доходы от реализации «Д» → Розничный покупатель «Р»)",
  "Платежные документы → поступление в кассу: с АВТО на Д/Р (Доходы от реализации «Д» → Розничный покупатель «Р»)",
  "Сверить остаток в программе и в магазине",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function ensureDay(db, date) {
  const existing = await db("work_day_tasks").where({ date }).orderBy("sort_order");
  if (existing.length === 0) {
    await db("work_day_tasks").insert(
      DAY_TASK_TITLES.map((title, i) => ({
        date,
        title,
        sort_order: i + 1,
        done: false,
        comment: "",
      })),
    );
  }
  let cash = await db("work_cash_days").where({ date }).first();
  if (!cash) {
    const [id] = await db("work_cash_days").insert({ date });
    cash = await db("work_cash_days").where({ id }).first();
  }
  const tasks = await db("work_day_tasks").where({ date }).orderBy("sort_order");
  const loaders = await db("work_loaders").where({ date }).orderBy("id");
  return { date, tasks, cash, loaders };
}

function normalizeFitting(body) {
  const supplier = SUPPLIERS.some((s) => s.id === body.supplier) ? body.supplier : "rondo";
  return {
    code: String(body.code || "").trim(),
    name: String(body.name || "").trim(),
    supplier,
    stock_fact: Number(body.stock_fact) || 0,
    stock_program: Number(body.stock_program) || 0,
    last_delivery_qty: Number(body.last_delivery_qty) || 0,
    order_qty: Number(body.order_qty) || 0,
    comment: String(body.comment || "").trim(),
    updated_at: new Date().toISOString(),
  };
}

router.get("/suppliers", (_req, res) => {
  res.json(SUPPLIERS);
});

router.get("/day", async (req, res, next) => {
  try {
    const date = String(req.query.date || todayIso()).slice(0, 10);
    res.json(await ensureDay(req.db, date));
  } catch (e) {
    next(e);
  }
});

router.patch("/tasks/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await req.db("work_day_tasks").where({ id }).first();
    if (!row) return res.status(404).json({ error: "Задача не найдена" });
    const patch = {};
    if (typeof req.body.done === "boolean") patch.done = req.body.done;
    if (typeof req.body.comment === "string") patch.comment = req.body.comment;
    if (Object.keys(patch).length) await req.db("work_day_tasks").where({ id }).update(patch);
    res.json(await req.db("work_day_tasks").where({ id }).first());
  } catch (e) {
    next(e);
  }
});

router.put("/cash", async (req, res, next) => {
  try {
    const date = String(req.body.date || todayIso()).slice(0, 10);
    await ensureDay(req.db, date);
    await req.db("work_cash_days").where({ date }).update({
      cash_start: Number(req.body.cash_start) || 0,
      cash_in: Number(req.body.cash_in) || 0,
      acquiring_in: Number(req.body.acquiring_in) || 0,
      expense_other: Number(req.body.expense_other) || 0,
      expense_other_note: String(req.body.expense_other_note || ""),
      cash_end_fact: Number(req.body.cash_end_fact) || 0,
      cash_in_program: Number(req.body.cash_in_program) || 0,
      receipts_to_accountant: !!req.body.receipts_to_accountant,
      comment: String(req.body.comment || ""),
    });
    res.json(await req.db("work_cash_days").where({ date }).first());
  } catch (e) {
    next(e);
  }
});

router.post("/loaders", async (req, res, next) => {
  try {
    const date = String(req.body.date || todayIso()).slice(0, 10);
    const [id] = await req.db("work_loaders").insert({
      date,
      order_title: String(req.body.order_title || "").trim(),
      amount: Number(req.body.amount) || 0,
      loader_name: String(req.body.loader_name || "").trim(),
      signed: !!req.body.signed,
      money_from: String(req.body.money_from || "касса"),
      comment: String(req.body.comment || ""),
    });
    res.status(201).json(await req.db("work_loaders").where({ id }).first());
  } catch (e) {
    next(e);
  }
});

router.patch("/loaders/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await req.db("work_loaders").where({ id }).first();
    if (!row) return res.status(404).json({ error: "Запись не найдена" });
    const patch = {};
    for (const key of ["order_title", "loader_name", "money_from", "comment"]) {
      if (typeof req.body[key] === "string") patch[key] = req.body[key];
    }
    if (req.body.amount != null) patch.amount = Number(req.body.amount) || 0;
    if (typeof req.body.signed === "boolean") patch.signed = req.body.signed;
    if (Object.keys(patch).length) await req.db("work_loaders").where({ id }).update(patch);
    res.json(await req.db("work_loaders").where({ id }).first());
  } catch (e) {
    next(e);
  }
});

router.delete("/loaders/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await req.db("work_loaders").where({ id }).del();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get("/fittings", async (req, res, next) => {
  try {
    const rows = await req.db("work_fittings").orderBy("code");
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/fittings", async (req, res, next) => {
  try {
    const data = normalizeFitting(req.body);
    if (!data.code) return res.status(400).json({ error: "Нужен код из Инфопредприятия" });
    const exists = await req.db("work_fittings").where({ code: data.code }).first();
    if (exists) return res.status(409).json({ error: "Такой код уже есть — открой строку и поправь количество" });
    const [id] = await req.db("work_fittings").insert(data);
    res.status(201).json(await req.db("work_fittings").where({ id }).first());
  } catch (e) {
    next(e);
  }
});

router.put("/fittings/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await req.db("work_fittings").where({ id }).first();
    if (!row) return res.status(404).json({ error: "Позиция не найдена" });
    const data = normalizeFitting({ ...row, ...req.body, code: req.body.code ?? row.code });
    if (!data.code) return res.status(400).json({ error: "Нужен код из Инфопредприятия" });
    const clash = await req.db("work_fittings").where({ code: data.code }).whereNot({ id }).first();
    if (clash) return res.status(409).json({ error: "Этот код уже занят другой строкой" });
    await req.db("work_fittings").where({ id }).update(data);
    res.json(await req.db("work_fittings").where({ id }).first());
  } catch (e) {
    next(e);
  }
});

router.delete("/fittings/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await req.db("work_fittings").where({ id }).del();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const rows = await req.db("work_fittings").where("order_qty", ">", 0).orderBy("code");
    const grouped = Object.fromEntries(SUPPLIERS.map((s) => [s.id, []]));
    for (const row of rows) {
      const key = grouped[row.supplier] ? row.supplier : "rondo";
      grouped[key].push(row);
    }
    res.json({ suppliers: SUPPLIERS, grouped });
  } catch (e) {
    next(e);
  }
});

export default router;
