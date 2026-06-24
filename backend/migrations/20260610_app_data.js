export function up(knex) {
  return knex.schema.createTable("app_data", (t) => {
    t.integer("user_id").references("id").inTable("users").onDelete("CASCADE");
    t.string("key").notNullable();
    t.text("value").notNullable(); // JSON blob
    t.timestamp("updated_at").defaultTo(knex.fn.now());
    t.primary(["user_id", "key"]);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("app_data");
}
