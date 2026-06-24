import React, { useState } from 'react';
import { FileText, FileSignature, Receipt, Plus, Eye, Download, Search, Filter, CheckCircle2, Clock, AlertTriangle, XCircle, Send, UserCheck } from 'lucide-react';
import { Lead } from '../types';

type DocType = 'kp' | 'contract' | 'invoice';

interface Document {
  id: string;
  type: DocType;
  number: string;
  client: string;
  leadId: string;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'signed' | 'paid' | 'cancelled';
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Черновик', color: 'text-slate-400 bg-slate-500/10', icon: <Clock size={12} /> },
  sent: { label: 'Отправлен', color: 'text-sky-400 bg-sky-500/10', icon: <Eye size={12} /> },
  signed: { label: 'Подписан', color: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle2 size={12} /> },
  paid: { label: 'Оплачен', color: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'Отменён', color: 'text-rose-400 bg-rose-500/10', icon: <XCircle size={12} /> },
};

const typeConfig: Record<DocType, { label: string; icon: React.ReactNode; color: string }> = {
  kp: { label: 'КП', icon: <FileText size={14} />, color: 'text-indigo-400' },
  contract: { label: 'Договор', icon: <FileSignature size={14} />, color: 'text-amber-400' },
  invoice: { label: 'Счёт', icon: <Receipt size={14} />, color: 'text-emerald-400' },
};

const generateMockDocs = (leads: Lead[]): Document[] => {
  const docs: Document[] = [];
  const statuses: Document['status'][] = ['draft', 'sent', 'signed', 'paid', 'cancelled'];
  leads.forEach((l, i) => {
    const amount = Number(l.budget.replace(/[^\d]/g, '')) || 100000;
    docs.push({
      id: `KP-${String(i + 1).padStart(3, '0')}`,
      type: 'kp',
      number: `КП-${String(i + 1).padStart(3, '0')}/2026`,
      client: l.name,
      leadId: l.id,
      amount,
      date: l.deadline,
      status: statuses[i % statuses.length],
    });
    if (i % 2 === 0) {
      docs.push({
        id: `DOG-${String(i + 1).padStart(3, '0')}`,
        type: 'contract',
        number: `Д-${String(i + 1).padStart(3, '0')}/2026`,
        client: l.name,
        leadId: l.id,
        amount,
        date: l.deadline,
        status: statuses[(i + 1) % statuses.length],
      });
    }
    if (i % 3 === 0) {
      docs.push({
        id: `SCH-${String(i + 1).padStart(3, '0')}`,
        type: 'invoice',
        number: `Сч-${String(i + 1).padStart(3, '0')}/2026`,
        client: l.name,
        leadId: l.id,
        amount: Math.round(amount * 0.5),
        date: l.deadline,
        status: statuses[(i + 2) % statuses.length],
      });
    }
  });
  return docs;
};

interface DocumentsProps {
  leads: Lead[];
  currentUser?: string | null;
  currentUserRole?: string;
}

const Documents: React.FC<DocumentsProps> = ({ leads, currentUser, currentUserRole }) => {
  const [allDocs, setAllDocs] = useState(() => generateMockDocs(leads));
  const [activeType, setActiveType] = useState<DocType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [accountantRequests, setAccountantRequests] = useState<Set<string>>(new Set());
  const [processedInvoices, setProcessedInvoices] = useState<Record<string, { accountant: string; date: string }>>({});

  const canCreateInvoice = currentUserRole === "Administrator" || currentUserRole === "Бухгалтер";

  const filtered = allDocs.filter(d => {
    if (activeType !== 'all' && d.type !== activeType) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search && !d.client.toLowerCase().includes(search.toLowerCase()) && !d.number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0);

  const counts = {
    kp: allDocs.filter(d => d.type === 'kp').length,
    contract: allDocs.filter(d => d.type === 'contract').length,
    invoice: allDocs.filter(d => d.type === 'invoice').length,
  };

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <div className="flex items-start gap-4 border-b border-white/10 pb-6 mb-6 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border border-amber-500/30">
          <FileText size={24} className="text-amber-300" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Документы</h2>
          <p className="text-sm text-slate-400">КП, договоры и счета</p>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-2xl p-1 border border-white/5 flex-wrap">
        {[
          { key: 'all', label: 'Все', count: allDocs.length, color: 'text-slate-300' },
          { key: 'kp', label: 'КП', count: counts.kp, color: 'text-indigo-400' },
          { key: 'contract', label: 'Договоры', count: counts.contract, color: 'text-amber-400' },
          { key: 'invoice', label: 'Счета', count: counts.invoice, color: 'text-emerald-400' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveType(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === t.key ? 'bg-indigo-500/20 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {t.color && <span className={t.color}>{typeConfig[t.key as DocType]?.icon}</span>} {t.label}
            <span className="text-xs text-slate-500 ml-0.5">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по клиенту или номеру..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50">
          <option value="all">Все статусы</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="text-xs text-slate-400 ml-auto">
          Сумма: <span className="font-bold text-amber-300">{totalAmount.toLocaleString()} ₽</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-black/40 text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-bold">Тип</th>
              <th className="px-5 py-3 font-bold">Номер</th>
              <th className="px-5 py-3 font-bold">Клиент</th>
              <th className="px-5 py-3 font-bold">Сумма</th>
              <th className="px-5 py-3 font-bold">Дата</th>
              <th className="px-5 py-3 font-bold">Статус</th>
              <th className="px-5 py-3 font-bold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((doc, i) => {
              const tc = typeConfig[doc.type];
              const sc = statusConfig[doc.status];
              return (
                <tr key={doc.id} className={`${i % 2 === 0 ? 'bg-black/10' : 'bg-transparent'} hover:bg-white/5 transition-colors`}>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1.5 ${tc.color} font-bold`}>
                      {tc.icon} {tc.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-200 text-xs">{doc.number}</td>
                  <td className="px-5 py-3 text-white font-medium">{doc.client}</td>
                  <td className="px-5 py-3 text-amber-300 font-bold">{doc.amount.toLocaleString()} ₽</td>
                  <td className="px-5 py-3 text-slate-400">{doc.date}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {doc.type === "invoice" && doc.status === "draft" && !canCreateInvoice ? (
                      <div className="flex items-center gap-1.5">
                        {accountantRequests.has(doc.id) ? (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <Clock size={10} /> Запрос отправлен бухгалтеру
                          </span>
                        ) : processedInvoices[doc.id] ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <UserCheck size={10} /> Счёт обработан (бухгалтер: {processedInvoices[doc.id].accountant})
                          </span>
                        ) : (
                          <button onClick={() => setAccountantRequests(prev => { const n = new Set(prev); n.add(doc.id); return n; })}
                            className="text-[10px] text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 border border-amber-500/20">
                            <Send size={10} /> Запросить счёт
                          </button>
                        )}
                        {!accountantRequests.has(doc.id) && !processedInvoices[doc.id] && (
                          <button onClick={() => { setProcessedInvoices(prev => ({ ...prev, [doc.id]: { accountant: "Бухгалтер", date: new Date().toLocaleDateString("ru-RU") } })); }}
                            className="text-[10px] text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 border border-indigo-500/20 opacity-50 hover:opacity-100">
                            <CheckCircle2 size={10} /> (тест обор.)
                          </button>
                        )}
                      </div>
                    ) : (
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <Download size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 py-10 text-xs">Нет документов, соответствующих выбранным фильтрам</div>
        )}
      </div>
    </div>
  );
};

export default Documents;
