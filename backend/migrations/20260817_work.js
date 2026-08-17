export function up(knex) {
  return knex.schema
    .createTable("work_day_tasks", (t) => {
      t.increments("id").primary();
      t.string("date", 20).notNullable();
      t.string("title", 500).notNullable();
      t.integer("sort_order").notNullable().defaultTo(0);
      t.boolean("done").notNullable().defaultTo(false);
      t.string("comment", 500).notNullable().defaultTo("");
      t.index("date");
    })
    .createTable("work_cash_days", (t) => {
      t.increments("id").primary();
      t.string("date", 20).notNullable().unique();
      t.float("cash_start").notNullable().defaultTo(0);
      t.float("cash_in").notNullable().defaultTo(0);
      t.float("acquiring_in").notNullable().defaultTo(0);
      t.float("expense_other").notNullable().defaultTo(0);
      t.string("expense_other_note", 500).notNullable().defaultTo("");
      t.float("cash_end_fact").notNullable().defaultTo(0);
      t.float("cash_in_program").notNullable().defaultTo(0);
      t.boolean("receipts_to_accountant").notNullable().defaultTo(false);
      t.string("comment", 500).notNullable().defaultTo("");
    })
    .createTable("work_loaders", (t) => {
      t.increments("id").primary();
      t.string("date", 20).notNullable();
      t.string("order_title", 255).notNullable().defaultTo("");
      t.float("amount").notNullable().defaultTo(0);
      t.string("loader_name", 200).notNullable().defaultTo("");
      t.boolean("signed").notNullable().defaultTo(false);
      t.string("money_from", 100).notNullable().defaultTo("касса");
      t.string("comment", 500).notNullable().defaultTo("");
      t.index("date");
    })
    .createTable("work_fittings", (t) => {
      t.increments("id").primary();
      t.string("code", 80).notNullable();
      t.string("name", 255).notNullable().defaultTo("");
      t.string("supplier", 80).notNullable();
      t.float("stock_fact").notNullable().defaultTo(0);
      t.float("stock_program").notNullable().defaultTo(0);
      t.float("last_delivery_qty").notNullable().defaultTo(0);
      t.float("order_qty").notNullable().defaultTo(0);
      t.string("comment", 500).notNullable().defaultTo("");
      t.string("updated_at", 40).notNullable().defaultTo("");
      t.unique("code");
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists("work_fittings")
    .dropTableIfExists("work_loaders")
    .dropTableIfExists("work_cash_days")
    .dropTableIfExists("work_day_tasks");
}
