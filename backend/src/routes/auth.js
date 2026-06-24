import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateToken, authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const existing = await req.db("users").where({ email }).first();
    if (existing) return res.status(409).json({ error: "Email уже занят" });

    const hash = await bcrypt.hash(password, 10);
    const [id] = await req.db("users").insert({ email, password: hash, name, role });
    const user = await req.db("users").where({ id }).first();
    const token = generateToken(user);
    delete user.password;
    res.status(201).json({ user, token });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await req.db("users").where({ email }).first();
    if (!user) return res.status(401).json({ error: "Неверный email или пароль" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Неверный email или пароль" });

    const token = generateToken(user);
    delete user.password;
    res.json({ user, token });
  } catch (e) { next(e); }
});

const KEY_USERS = {
  nova2026: { name: "Администратор", role: "admin" },
  denis2026: { name: "Денис Козлов", role: "designer" },
};

router.post("/key-login", async (req, res, next) => {
  try {
    const { key } = req.body;
    const mapping = KEY_USERS[key];
    if (!mapping) return res.status(401).json({ error: "Неверный ключ доступа" });

    let user = await req.db("users").where({ name: mapping.name }).first();
    if (!user) {
      const [id] = await req.db("users").insert({
        email: `${mapping.name.toLowerCase().replace(/\s+/g, ".")}@nova.ru`,
        password: "",
        name: mapping.name,
        role: mapping.role,
      });
      user = await req.db("users").where({ id }).first();
    }

    const token = generateToken(user);
    delete user.password;
    res.json({ user, token });
  } catch (e) { next(e); }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await req.db("users").where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    delete user.password;
    res.json(user);
  } catch (e) { next(e); }
});

export default router;
