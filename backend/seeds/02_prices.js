export async function seed(knex) {
  await knex("prices").del();
  await knex("prices").insert([
    { key: "price_l_ka", value: 1400 },
    { key: "price_edge", value: 300 },
    { key: "price_hinge", value: 50 },
    { key: "price_internal_operation", value: 200 },
  ]);
}
