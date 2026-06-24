export function up(knex) {
  return knex.schema
    .createTable("materials", (t) => {
      t.increments("id");
      t.string("name", 255).notNullable();
      t.decimal("total_qty", 10, 2).defaultTo(0);
      t.decimal("used_qty", 10, 2).defaultTo(0);
      t.string("unit", 20).defaultTo("лист");
      t.string("notes", 500).defaultTo("");
      t.timestamps(true, true);
    })
    .createTable("material_consumption", (t) => {
      t.increments("id");
      t.integer("material_id").references("id").inTable("materials").onDelete("CASCADE");
      t.integer("order_id").nullable();
      t.decimal("qty", 10, 2).defaultTo(0);
      t.string("notes", 500).defaultTo("");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("material_consumption").dropTableIfExists("materials");
}
