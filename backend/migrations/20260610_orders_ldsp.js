export function up(knex) {
  return knex.schema.alterTable("orders", (t) => {
    t.string("source", 20).defaultTo("салон");
    t.string("deadline", 50).defaultTo("");
    t.string("pickup_location", 255).defaultTo("салон РЭЛАН");
  });
}

export function down(knex) {
  return knex.schema.alterTable("orders", (t) => {
    t.dropColumn("source");
    t.dropColumn("deadline");
    t.dropColumn("pickup_location");
  });
}
