export function up(knex) {
  return knex.schema.createTable("leads_v2", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.string("phone").notNullable().defaultTo("");
    t.string("status").notNullable().defaultTo("new");
    t.string("budget").notNullable().defaultTo("—");
    t.string("deadline").notNullable().defaultTo("");
    t.string("material").notNullable().defaultTo("");
    t.string("material_custom").defaultTo("");
    t.string("type").notNullable().defaultTo("");
    t.string("type_custom").defaultTo("");
    t.string("contact_method").notNullable().defaultTo("WhatsApp");
    t.string("source").notNullable().defaultTo("Сайт");
    t.string("source_custom").defaultTo("");
    t.text("messages").defaultTo("[]");
    t.text("activity_log").defaultTo("[]");
    t.text("assignee").defaultTo("{}");
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("leads_v2");
}
