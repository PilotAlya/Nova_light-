export function up(knex) {
  return knex.schema
    .createTable("prices", (t) => {
      t.increments("id").primary();
      t.string("key").unique().notNullable();
      t.float("value").notNullable().defaultTo(0);
    })
    .createTable("orders", (t) => {
      t.increments("id").primary();
      t.string("client_name", 255).defaultTo("");
      t.string("phone", 50).defaultTo("");
      t.string("material", 255).defaultTo("ЛДСП 16мм");
      t.string("payment_status", 50).defaultTo("предоплата");
      t.string("responsible", 100).defaultTo("Администратор");
      t.string("status", 50).defaultTo("новый");
      t.float("total_cost").defaultTo(0);
      t.text("positions_json").defaultTo("[]");
      t.string("created_at").defaultTo(knex.fn.now());
      t.string("updated_at").defaultTo(knex.fn.now());
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists("orders")
    .dropTableIfExists("prices");
}
