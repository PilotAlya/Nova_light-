import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, any>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportLeadsToExcel(leads: { id: string; name: string; phone: string; status: string; budget: string; deadline: string; assignee: { name: string } }[]) {
  const data = leads.map(l => ({
    ID: l.id,
    Клиент: l.name,
    Телефон: l.phone,
    Статус: l.status,
    Бюджет: l.budget,
    Дедлайн: l.deadline,
    Менеджер: l.assignee.name,
  }));
  exportToExcel(data, `novacrm_leads_${new Date().toISOString().split('T')[0]}`);
}

export function exportOrdersToExcel(orders: { id: string; clientName: string; productType: string; budget: number; deadline: string; assignee: string; priority: string }[]) {
  const data = orders.map(o => ({
    ID: o.id,
    Клиент: o.clientName,
    Тип: o.productType,
    Бюджет: o.budget,
    Дедлайн: o.deadline,
    Ответственный: o.assignee,
    Приоритет: o.priority,
  }));
  exportToExcel(data, `novacrm_orders_${new Date().toISOString().split('T')[0]}`);
}
