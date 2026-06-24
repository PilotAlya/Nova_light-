import React, { useState, useRef } from "react";
import { Download, Upload, CheckCircle, AlertTriangle, Database, RefreshCw } from "lucide-react";
import { exportBackup, importBackup, BackupDump } from "../api/backup";

const BackupPage: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    setResult(null);
    try {
      const dump = await exportBackup();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nova_light_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLastExport(new Date().toLocaleString("ru-RU"));
      setResult({ type: "success", message: `Резервная копия создана (${Object.keys(dump).length} таблиц)` });
    } catch (e) {
      setResult({ type: "error", message: "Ошибка при создании бэкапа" });
    }
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Восстановление из бэкапа ЗАМЕНИТ все текущие данные. Продолжить?")) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const dump: BackupDump = JSON.parse(text);
      const res = await importBackup(dump);
      if (res.errors.length === 0) {
        setResult({ type: "success", message: `Восстановлено: ${res.restored.join(", ")}` });
      } else {
        setResult({ type: "error", message: `Ошибки: ${res.errors.join("; ")}` });
      }
    } catch (e) {
      setResult({ type: "error", message: "Ошибка при восстановлении: неверный формат файла" });
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto fade-in space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Резервное копирование</h2>
        <p className="text-slate-400 text-sm mt-1">Экспорт и восстановление всех данных системы</p>
      </div>

      {result && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 text-sm font-bold ${result.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {result.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {result.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Download size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Экспорт</h3>
              <p className="text-[10px] text-slate-500">Скачать JSON-дамп всех таблиц</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Сохраняет: заказы, материалы, клиентов, кассу, склад, Wiki и другие данные.
            {lastExport && <><br />Последний экспорт: <strong className="text-white">{lastExport}</strong></>}
          </p>
          <button onClick={handleExport} disabled={exporting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Экспорт..." : "Скачать бэкап"}
          </button>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Upload size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Импорт</h3>
              <p className="text-[10px] text-slate-500">Восстановить из JSON-дампа</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-rose-400 font-bold">Внимание:</span> все текущие данные будут заменены. Перед восстановлением рекомендуется сделать экспорт.
          </p>
          <button onClick={() => fileRef.current?.click()} disabled={importing} className="w-full bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-300 border border-amber-500/30 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            {importing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            {importing ? "Восстановление..." : "Загрузить бэкап"}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={16} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Состав бэкапа</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {["orders", "prices", "leads_v2", "clients", "inventory", "app_data", "cash_shifts", "cash_entries", "cleaning_schedule", "materials", "material_consumption"].map(t => (
            <div key={t} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/5">
              <Database size={12} className="text-slate-500" />
              <span className="text-slate-300">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
