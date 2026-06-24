import bcrypt from "bcryptjs";

export async function seed(knex) {
  await knex("ai_messages").del();
  await knex("promos").del();
  await knex("inventory").del();
  await knex("checklist_items").del();
  await knex("timeline_entries").del();
  await knex("communications").del();
  await knex("payments").del();
  await knex("orders").del();
  await knex("client_leads").del();
  await knex("clients").del();
  await knex("measurements").del();
  await knex("lead_finances").del();
  await knex("leads").del();
  await knex("user_settings").del();
  await knex("users").del();

  const hash = await bcrypt.hash("demo123", 10);

  // ── Users (MVP: admin + designer + support roles) ──
  await knex("users").insert([
    { id: 1, email: "admin@nova.ru", password: hash, name: "Администратор", avatar: "https://i.pravatar.cc/150?u=admin", role: "admin", phone: "+7 (912) 555-01-01", telegram: "@admin_nova" },
    { id: 2, email: "denis@nova.ru", password: hash, name: "Денис Козлов", avatar: "https://i.pravatar.cc/150?u=denis", role: "designer", phone: "+7 (912) 555-01-02", telegram: "@denis_nova" },
    { id: 3, email: "olga@nova.ru", password: hash, name: "Ольга Смирнова", avatar: "https://i.pravatar.cc/150?u=olga", role: "manager", phone: "+7 (912) 555-01-03", telegram: "@olga_nova" },
    { id: 4, email: "elena@nova.ru", password: hash, name: "Елена Павлова", avatar: "https://i.pravatar.cc/150?u=marina", role: "accountant", phone: "+7 (912) 555-01-04", telegram: "@elena_nova" },
    { id: 5, email: "sergey@nova.ru", password: hash, name: "Сергей Петров", avatar: "https://i.pravatar.cc/150?u=sergey", role: "designer", phone: "+7 (912) 555-01-05", telegram: "@sergey_nova" },
    { id: 6, email: "boris@nova.ru", password: hash, name: "Борис Зайцев", avatar: "https://i.pravatar.cc/150?u=mikhail", role: "manager", phone: "+7 (912) 555-01-06", telegram: "@boris_nova" },
  ]);

  // ── Leads ──
  const leads = [
    { id: 1, title: "Иванов, кухня 6м", type: "kitchen", source: "Сайт", phone: "+7 (912) 123-45-67", status: "negotiation", budget: 380000, deposit: 50000, assigned_to: 2, created_by: 2, deadline: "2026-07-01" },
    { id: 2, title: "Петрова, шкаф-купе 3м", type: "wardrobe", source: "VK", phone: "+7 (912) 234-56-78", status: "measurement", budget: 180000, deposit: 30000, assigned_to: 1, created_by: 1, deadline: "2026-06-20" },
    { id: 3, title: "Сидоров, гардеробная", type: "closet", source: "Telegram", phone: "+7 (912) 345-67-89", status: "production", budget: 520000, deposit: 150000, assigned_to: 3, created_by: 2, deadline: "2026-08-15" },
    { id: 4, title: "Кузнецов, кухня 9м", type: "kitchen", source: "Сарафан", phone: "+7 (912) 456-78-90", status: "contract", budget: 650000, deposit: 200000, assigned_to: 5, created_by: 5, deadline: "2026-07-30" },
    { id: 5, title: "Новикова, прихожая", type: "hallway", source: "Instagram", phone: "+7 (912) 567-89-01", status: "new", budget: 120000, deposit: 0, assigned_to: 3, created_by: 3, deadline: "2026-06-10" },
    { id: 6, title: "Морозов, офис 20м", type: "office", source: "Сайт", phone: "+7 (912) 678-90-12", status: "negotiation", budget: 890000, deposit: 100000, assigned_to: 2, created_by: 2, deadline: "2026-09-01" },
    { id: 7, title: "Белова, шкаф-купе 2.5м", type: "wardrobe", source: "2GIS", phone: "+7 (912) 789-01-23", status: "production", budget: 155000, deposit: 50000, assigned_to: 5, created_by: 1, deadline: "2026-06-28" },
    { id: 8, title: "Григорьев, кухня 4м", type: "kitchen", source: "Telegram", phone: "+7 (912) 890-12-34", status: "delivery", budget: 290000, deposit: 150000, assigned_to: 3, created_by: 3, deadline: "2026-06-05" },
    { id: 9, title: "Дмитриев, гардеробная", type: "closet", source: "Сарафан", phone: "+7 (912) 901-23-45", status: "completed", budget: 420000, deposit: 200000, assigned_to: 5, created_by: 5, deadline: "2026-05-15" },
    { id: 10, title: "Тимофеев, кухня 5м", type: "kitchen", source: "VK", phone: "+7 (912) 012-34-56", status: "cancelled", budget: 310000, deposit: 0, assigned_to: 2, created_by: 2, deadline: "2026-04-10" },
  ];
  await knex("leads").insert(leads);

  // ── Lead Finances ──
  await knex("lead_finances").insert([
    { lead_id: 1, materials_cost: 180000, master_pct: 15, accountant_pct: 5, overhead_pct: 10, final_price: 380000 },
    { lead_id: 2, materials_cost: 85000, master_pct: 12, accountant_pct: 5, overhead_pct: 8, final_price: 180000 },
    { lead_id: 3, materials_cost: 250000, master_pct: 18, accountant_pct: 5, overhead_pct: 12, final_price: 520000 },
    { lead_id: 4, materials_cost: 310000, master_pct: 15, accountant_pct: 5, overhead_pct: 10, final_price: 650000 },
    { lead_id: 8, materials_cost: 130000, master_pct: 12, accountant_pct: 5, overhead_pct: 8, final_price: 290000 },
    { lead_id: 9, materials_cost: 200000, master_pct: 15, accountant_pct: 5, overhead_pct: 10, final_price: 420000 },
  ]);

  // ── Clients ──
  await knex("clients").insert([
    { id: 1, name: "Иван Петров", phone: "+7 (912) 123-45-67", email: "ivan@mail.ru", telegram: "@ivan_p", source: "Сайт", tags: JSON.stringify(["vip"]), avatar_emoji: "👨‍💼", created_by: 2 },
    { id: 2, name: "Анна Сидорова", phone: "+7 (912) 234-56-78", email: "anna@yandex.ru", vk: "anna_s", source: "VK", tags: JSON.stringify([]), avatar_emoji: "👩‍🎨", created_by: 1 },
    { id: 3, name: "Михаил Кузнецов", phone: "+7 (912) 456-78-90", email: "mikhail@gmail.com", telegram: "@mkuznetsov", source: "Сарафан", tags: JSON.stringify(["problem"]), avatar_emoji: "👨‍🔧", created_by: 5 },
  ]);
  await knex("client_leads").insert([
    { client_id: 1, lead_id: 1 },
    { client_id: 2, lead_id: 2 },
    { client_id: 3, lead_id: 4 },
  ]);

  // ── Orders (deprecated — new schema in prices_orders migration) ──
  // await knex("orders").insert([
  //   { id: 1, client_id: 1, lead_id: 1, title: "Кухня 6м — Иванов", status: "production", total: 380000, prepayment: 50000, deadline: "2026-07-01" },
  //   { id: 2, client_id: 2, lead_id: 2, title: "Шкаф-купе 3м — Петрова", status: "prepayment", total: 180000, prepayment: 30000, deadline: "2026-06-20" },
  //   { id: 3, client_id: 3, lead_id: 4, title: "Кухня 9м — Кузнецов", status: "partial", total: 650000, prepayment: 200000, deadline: "2026-07-30" },
  // ]);

  // ── Payments (deprecated — references old orders) ──
  // await knex("payments").insert([
  //   { order_id: 1, type: "prepayment", amount: 50000, method: "card", created_by: 4, paid_at: "2026-05-10" },
  //   { order_id: 2, type: "prepayment", amount: 30000, method: "cash", created_by: 4, paid_at: "2026-05-15" },
  //   { order_id: 3, type: "prepayment", amount: 200000, method: "transfer", created_by: 4, paid_at: "2026-05-20" },
  //   { order_id: 3, type: "partial", amount: 150000, method: "card", created_by: 4, paid_at: "2026-06-01" },
  // ]);

  // ── Communications ──
  await knex("communications").insert([
    { client_id: 1, channel: "telegram", direction: "out", message: "Добрый день! Готовы обсудить детали кухни.", owner: 2 },
    { client_id: 1, channel: "telegram", direction: "in", message: "Здравствуйте! Да, удобно во вторник после 18:00.", owner: 2 },
    { client_id: 2, channel: "vk", direction: "out", message: "Отправлен эскиз шкафа-купе.", owner: 1 },
    { client_id: 3, channel: "phone", direction: "in", message: "Клиент уточнял сроки поставки.", owner: 5 },
  ]);

  // ── Timeline ──
  await knex("timeline_entries").insert([
    { lead_id: 3, member_id: 3, task: "Замер гардеробной", start_date: "2026-06-01", end_date: "2026-06-03", status: "active", color: "rgba(99,102,241,0.85)", sort_order: 1 },
    { lead_id: 3, member_id: 5, task: "Проект гардеробной", start_date: "2026-06-04", end_date: "2026-06-10", status: "planned", color: "rgba(168,85,247,0.85)", sort_order: 2 },
    { lead_id: 3, member_id: 2, task: "Согласование с клиентом", start_date: "2026-06-11", end_date: "2026-06-14", status: "planned", color: "rgba(249,115,22,0.85)", sort_order: 3 },
    { lead_id: 7, member_id: 5, task: "Раскрой шкафа", start_date: "2026-06-05", end_date: "2026-06-10", status: "active", color: "rgba(34,197,94,0.85)", sort_order: 1 },
    { lead_id: 7, member_id: 3, task: "Сборка на объекте", start_date: "2026-06-11", end_date: "2026-06-15", status: "planned", color: "rgba(99,102,241,0.85)", sort_order: 2 },
  ]);

  // ── Checklist items ──
  await knex("checklist_items").insert([
    // Кухня (lead 1)
    { lead_id: 1, template: "kitchen", category: "Замер", title: "Проверка уровня пола", sort_order: 1 },
    { lead_id: 1, template: "kitchen", category: "Замер", title: "Замер стен (3 точки)", sort_order: 2 },
    { lead_id: 1, template: "kitchen", category: "Материалы", title: "Выбор фасадов", sort_order: 3 },
    { lead_id: 1, template: "kitchen", category: "Материалы", title: "Выбор столешницы", sort_order: 4 },
    { lead_id: 1, template: "kitchen", category: "Производство", title: "Раскрой ДСП", sort_order: 5 },
    { lead_id: 1, template: "kitchen", category: "Производство", title: "Кромление", sort_order: 6 },
    { lead_id: 1, template: "kitchen", category: "Монтаж", title: "Установка кухни", sort_order: 7 },
    { lead_id: 1, template: "kitchen", category: "Монтаж", title: "Подключение техники", sort_order: 8 },
    // Шкаф-купе (lead 2)
    { lead_id: 2, template: "wardrobe", category: "Замер", title: "Замер проёма (ширина/высота/глубина)", sort_order: 1 },
    { lead_id: 2, template: "wardrobe", category: "Замер", title: "Проверка вертикали стен", sort_order: 2 },
    { lead_id: 2, template: "wardrobe", category: "Материалы", title: "Выбор дверей", sort_order: 3 },
    { lead_id: 2, template: "wardrobe", category: "Материалы", title: "Выбор наполнения", sort_order: 4 },
    // Кастомная (lead 2)
    { lead_id: 2, template: "wardrobe", category: "Другое", title: "Установка подсветки", is_custom: true, sort_order: 5 },
  ]);

  // ── Inventory ──
  await knex("inventory").insert([
    { zone: "retail", name: "Петля мебельная", category: "Фурнитура", unit: "шт", quantity: 200, price: 45, supplier: "Боярд" },
    { zone: "retail", name: "Направляющая полная", category: "Фурнитура", unit: "шт", quantity: 50, price: 320 },
    { zone: "retail", name: "ДСП 16мм дуб", category: "Материалы", unit: "лист", quantity: 12, price: 2100, supplier: "Леруа Мерлен" },
    { zone: "workshop", name: "Кромка ПВХ 2мм", category: "Расходники", unit: "м", quantity: 500, price: 28, supplier: "Техно-Кром" },
    { zone: "workshop", name: "Фреза концевая", category: "Инструмент", unit: "шт", quantity: 8, price: 1500 },
    { zone: "workshop", name: "Стружка", category: "Расходники", unit: "мешок", quantity: 3, price: 180 },
  ]);

  // ── Promos ──
  await knex("promos").insert([
    { title: "Скидка 15% на кухни до июля", description: "При заказе кухни до 1 июля — скидка на фурнитуру", url: "https://example.com/promo1", is_active: true },
    { title: "Шкаф-купе в подарок", description: "При заказе кухни от 500к — шкаф-купе бесплатно", url: "", is_active: false },
  ]);

  // ── Settings for each user ──
  for (let uid = 1; uid <= 6; uid++) {
    await knex("user_settings").insert({ user_id: uid });
  }
}
