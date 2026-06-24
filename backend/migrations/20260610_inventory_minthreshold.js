export async function up(knex) {
  await knex.schema.alterTable("inventory", (t) => {
    t.decimal("minThreshold", 10, 2).defaultTo(0);
  });
}

export async function down(knex) {
  await knex.schema.alterTable("inventory", (t) => {
    t.dropColumn("minThreshold");
  });
}
