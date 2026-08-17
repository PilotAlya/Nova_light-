import type { WorkFitting } from "./api";
import { SUPPLIERS } from "./api";

export function groupOrderRows(rows: WorkFitting[]): Record<string, WorkFitting[]> {
  const grouped: Record<string, WorkFitting[]> = Object.fromEntries(SUPPLIERS.map((s) => [s.id, []]));
  for (const row of rows) {
    if (!(Number(row.order_qty) > 0)) continue;
    const key = grouped[row.supplier] ? row.supplier : "rondo";
    grouped[key].push(row);
  }
  return grouped;
}
