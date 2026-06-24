export function up(knex) {
  return knex.schema
    .createTable("cash_shifts", (t) => {
      t.increments("id").primary();
      t.string("date", 20).notNullable();
      t.float("start_amount").defaultTo(0);
      t.float("cash_total").defaultTo(0);
      t.float("cashless_total").defaultTo(0);
      t.float("expense_total").defaultTo(0);
      t.float("expected_balance").defaultTo(0);
      t.float("actual_balance").defaultTo(0);
      t.string("status", 20).defaultTo("open");
      t.string("opened_by", 100).defaultTo("");
      t.string("closed_by", 100).defaultTo("");
      t.string("opened_at", 30).defaultTo(knex.fn.now());
      t.string("closed_at", 30).defaultTo("");
    })
    .createTable("cash_entries", (t) => {
      t.increments("id").primary();
      t.integer("shift_id").references("id").inTable("cash_shifts").onDelete("CASCADE");
      t.string("type", 20).notNullable();
      t.float("amount").defaultTo(0);
      t.string("method", 20).defaultTo("cash");
      t.string("category", 100).defaultTo("");
      t.string("notes", 255).defaultTo("");
      t.string("created_at", 30).defaultTo(knex.fn.now());
    })
    .createTable("cleaning_schedule", (t) => {
      t.increments("id").primary();
      t.string("task_name", 255).notNullable();
      t.integer("day_of_week").notNullable();
      t.string("assignee", 100).defaultTo("");
      t.string("notes", 255).defaultTo("");
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists("cash_entries")
    .dropTableIfExists("cash_shifts")
    .dropTableIfExists("cleaning_schedule");
}
