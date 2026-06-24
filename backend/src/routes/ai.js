import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/chat", authRequired, async (req, res, next) => {
  try {
    const { message } = req.body;
    await req.db("ai_messages").insert({ user_id: req.user.id, role: "user", content: message });

    const history = await req.db("ai_messages").where({ user_id: req.user.id }).orderBy("created_at", "asc").limit(20);

    const apiKey = req.headers["x-gemini-key"];
    if (!apiKey) {
      const reply = "Ключ Gemini не указан. Добавьте заголовок X-Gemini-Key для AI-ответов.";
      await req.db("ai_messages").insert({ user_id: req.user.id, role: "assistant", content: reply });
      return res.json({ reply });
    }

    const context = history.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: context }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.json({ reply: `Ошибка Gemini: ${err}` });
    }

    const data = await resp.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Нет ответа";
    await req.db("ai_messages").insert({ user_id: req.user.id, role: "assistant", content: reply });
    res.json({ reply });
  } catch (e) { next(e); }
});

router.post("/boris-analyze", authRequired, async (req, res, next) => {
  try {
    const { lead_id } = req.body;
    const lead = await req.db("leads").where({ id: lead_id }).first();
    if (!lead) return res.status(404).json({ error: "Лид не найден" });

    const apiKey = req.headers["x-gemini-key"];
    if (!apiKey) return res.json({ result: "Нет ключа Gemini для анализа." });

    const prompt = `Ты — Борис, аналитик мебельной мастерской. Проанализируй лид:\n- Клиент: ${lead.title}\n- Тип: ${lead.type}\n- Бюджет: ${lead.budget || "не указан"}\n- Статус: ${lead.status}\n\nДай оценку рисков и рекомендации (2-3 предложения).`;
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    if (!resp.ok) return res.json({ result: "Ошибка Gemini API" });

    const data = await resp.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Анализ недоступен";
    res.json({ result });
  } catch (e) { next(e); }
});

export default router;
