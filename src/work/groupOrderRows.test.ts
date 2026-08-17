import { describe, it, expect } from "vitest";
import { groupOrderRows } from "./orders";
import type { WorkFitting } from "./api";

const rows: WorkFitting[] = [
  { id: 1, code: "A1", name: "Петля", supplier: "rondo", stock_fact: 0, stock_program: 0, last_delivery_qty: 10, order_qty: 10, comment: "", updated_at: "" },
  { id: 2, code: "B2", name: "Направляющая", supplier: "partner", stock_fact: 1, stock_program: 1, last_delivery_qty: 5, order_qty: 0, comment: "", updated_at: "" },
  { id: 3, code: "C3", name: "Ручка", supplier: "vasilyevo", stock_fact: 0, stock_program: 0, last_delivery_qty: 20, order_qty: 20, comment: "", updated_at: "" },
];

describe("groupOrderRows", () => {
  it("puts items with order_qty > 0 into the matching supplier list", () => {
    const grouped = groupOrderRows(rows);
    expect(grouped.rondo.map((r) => r.code)).toEqual(["A1"]);
    expect(grouped.partner).toEqual([]);
    expect(grouped.vasilyevo.map((r) => r.code)).toEqual(["C3"]);
  });
});
