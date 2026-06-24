export function up(knex) {
  return knex.schema.alterTable("orders", (t) => {
    t.text("history").defaultTo("[]");
  });
}

export function down(knex) {
  return knex.schema.alterTable("orders", (t) => {
    t.dropColumn("history");
  });
}
