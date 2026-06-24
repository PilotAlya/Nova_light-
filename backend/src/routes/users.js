import { Router } from "express";
import { authRequired, roleAuthorized } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, async (req, res, next) => {
  try {
    const users = await req.db("users").select("id", "name", "email", "avatar", "role", "phone", "telegram", "created_at");
    res.json(users);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { name, avatar, phone, telegram } = req.body;
    await req.db("users").where({ id: req.params.id }).update({ name, avatar, phone, telegram });
    const user = await req.db("users").where({ id: req.params.id }).first();
    delete user.password;
    res.json(user);
  } catch (e) { next(e); }
});

router.get("/settings", authRequired, async (req, res, next) => {
  try {
    let settings = await req.db("user_settings").where({ user_id: req.user.id }).first();
    if (!settings) {
      await req.db("user_settings").insert({ user_id: req.user.id });
      settings = { theme: "dark", brightness: 100, start_tab: "kanban", pinned_sections: "{}" };
    }
    res.json(settings);
  } catch (e) { next(e); }
});

router.put("/settings", authRequired, async (req, res, next) => {
  try {
    const { theme, brightness, start_tab, pinned_sections } = req.body;
    await req.db("user_settings").where({ user_id: req.user.id }).update({ theme, brightness, start_tab, pinned_sections });
    const settings = await req.db("user_settings").where({ user_id: req.user.id }).first();
    res.json(settings);
  } catch (e) { next(e); }
});

export default router;
