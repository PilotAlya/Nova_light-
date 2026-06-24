export function up(knex) {
  return knex.schema
    .createTable("users", (t) => {
      t.increments("id");
      t.string("email").unique().notNullable();
      t.string("password").notNullable();
      t.string("name").notNullable();
      t.string("avatar");
      t.string("role").notNullable().defaultTo("manager");
      t.string("phone");
      t.string("telegram");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("user_settings", (t) => {
      t.integer("user_id").references("id").inTable("users").onDelete("CASCADE");
      t.string("theme").defaultTo("dark");
      t.integer("brightness").defaultTo(100);
      t.string("start_tab").defaultTo("kanban");
      t.text("pinned_sections").defaultTo("[]");
    })
    .createTable("leads", (t) => {
      t.increments("id");
      t.string("title").notNullable();
      t.string("type").notNullable();
      t.string("type_custom");
      t.string("source");
      t.string("source_custom");
      t.string("phone");
      t.string("status").notNullable().defaultTo("new");
      t.decimal("budget", 12, 2);
      t.decimal("deposit", 12, 2);
      t.integer("assigned_to").references("id").inTable("users");
      t.integer("created_by").references("id").inTable("users");
      t.date("deadline");
      t.text("notes");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("lead_finances", (t) => {
      t.integer("lead_id").references("id").inTable("leads").onDelete("CASCADE");
      t.decimal("materials_cost", 12, 2).defaultTo(0);
      t.decimal("master_pct", 5, 2).defaultTo(0);
      t.decimal("accountant_pct", 5, 2).defaultTo(0);
      t.decimal("overhead_pct", 5, 2).defaultTo(0);
      t.decimal("final_price", 12, 2).defaultTo(0);
    })
    .createTable("measurements", (t) => {
      t.increments("id");
      t.integer("lead_id").references("id").inTable("leads").onDelete("CASCADE");
      t.text("data"); // JSON
      t.integer("created_by").references("id").inTable("users");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("clients", (t) => {
      t.increments("id");
      t.string("name").notNullable();
      t.string("phone");
      t.string("email");
      t.string("telegram");
      t.string("vk");
      t.string("whatsapp");
      t.string("source");
      t.text("tags").defaultTo("[]"); // JSON array
      t.text("notes");
      t.integer("created_by").references("id").inTable("users");
      t.string("avatar_emoji").defaultTo("👤");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("client_leads", (t) => {
      t.integer("client_id").references("id").inTable("clients").onDelete("CASCADE");
      t.integer("lead_id").references("id").inTable("leads").onDelete("CASCADE");
      t.primary(["client_id", "lead_id"]);
    })
    .createTable("orders", (t) => {
      t.increments("id");
      t.integer("client_id").references("id").inTable("clients").onDelete("CASCADE");
      t.integer("lead_id").references("id").inTable("leads");
      t.string("title").notNullable();
      t.string("status").notNullable().defaultTo("prepayment");
      t.decimal("total", 12, 2).notNullable();
      t.decimal("prepayment", 12, 2).defaultTo(0);
      t.date("deadline");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("payments", (t) => {
      t.increments("id");
      t.integer("order_id").references("id").inTable("orders").onDelete("CASCADE");
      t.string("type").notNullable();
      t.decimal("amount", 12, 2).notNullable();
      t.string("method");
      t.text("note");
      t.timestamp("paid_at").defaultTo(knex.fn.now());
      t.integer("created_by").references("id").inTable("users");
    })
    .createTable("communications", (t) => {
      t.increments("id");
      t.integer("client_id").references("id").inTable("clients").onDelete("CASCADE");
      t.string("channel").notNullable();
      t.string("direction").notNullable();
      t.text("message").notNullable();
      t.integer("owner").references("id").inTable("users");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("timeline_entries", (t) => {
      t.increments("id");
      t.integer("lead_id").references("id").inTable("leads").onDelete("CASCADE");
      t.integer("member_id").references("id").inTable("users");
      t.string("task").notNullable();
      t.date("start_date").notNullable();
      t.date("end_date").notNullable();
      t.string("status").defaultTo("planned");
      t.string("color");
      t.integer("sort_order").defaultTo(0);
    })
    .createTable("checklist_items", (t) => {
      t.increments("id");
      t.integer("lead_id").references("id").inTable("leads").onDelete("CASCADE");
      t.string("template").notNullable();
      t.string("category").notNullable();
      t.string("title").notNullable();
      t.boolean("is_custom").defaultTo(false);
      t.boolean("done").defaultTo(false);
      t.integer("done_by").references("id").inTable("users");
      t.timestamp("done_at");
      t.integer("sort_order").defaultTo(0);
    })
    .createTable("inventory", (t) => {
      t.increments("id");
      t.string("zone").notNullable();
      t.string("name").notNullable();
      t.string("category");
      t.string("unit");
      t.decimal("quantity", 10, 2).defaultTo(0);
      t.decimal("price", 10, 2);
      t.string("supplier");
      t.string("url");
      t.text("note");
      t.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("promos", (t) => {
      t.increments("id");
      t.string("title").notNullable();
      t.text("description");
      t.string("url");
      t.string("supplier");
      t.boolean("is_active").defaultTo(true);
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("ai_messages", (t) => {
      t.increments("id");
      t.integer("user_id").references("id").inTable("users");
      t.string("role").notNullable();
      t.text("content").notNullable();
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists("ai_messages")
    .dropTableIfExists("promos")
    .dropTableIfExists("inventory")
    .dropTableIfExists("checklist_items")
    .dropTableIfExists("timeline_entries")
    .dropTableIfExists("communications")
    .dropTableIfExists("payments")
    .dropTableIfExists("orders")
    .dropTableIfExists("client_leads")
    .dropTableIfExists("clients")
    .dropTableIfExists("measurements")
    .dropTableIfExists("lead_finances")
    .dropTableIfExists("leads")
    .dropTableIfExists("user_settings")
    .dropTableIfExists("users");
}
