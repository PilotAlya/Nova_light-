import React, { useState } from 'react';
import { X, FileText, Upload, CheckCircle2 } from 'lucide-react';

interface MeasurementModalProps {
  leadId: string;
  leadName: string;
  onComplete: (leadId: string, files: { sketch: string; dimensions: string }) => void;
  onClose: () => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ leadId, leadName, onComplete, onClose }) => {
  const [files, setFiles] = useState({ sketch: false, dimensions: false });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (type: 'sketch' | 'dimensions') => {
    setIsUploading(true);
    setTimeout(() => {
      setFiles(prev => ({ ...prev, [type]: true }));
      setIsUploading(false);
    }, 800);
  };

  const canSubmit = files.sketch && files.dimensions;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📐 Завершение замера
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-slate-400 mb-6">
          Заказ: <span className="text-slate-200 font-semibold">{leadName}</span>. 
          Загрузите обязательные файлы для передачи в отдел проектирования.
        </p>

        <div className="space-y-3 mb-8">
          {/* Sketch Upload */}
          <div 
            onClick={() => !files.sketch && handleFileUpload('sketch')}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-4 ${
              files.sketch ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-600 hover:border-sky-500/50 bg-slate-900/40"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${files.sketch ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
              {files.sketch ? <CheckCircle2 size={20} /> : <FileText size={20} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200">{files.sketch ? "Эскиз загружен" : "Загрузить эскиз замера"}</div>
              <div className="text-[10px] text-slate-500">{files.sketch ? "sketch_1402.jpg" : "JPG, PNG или PDF"}</div>
            </div>
            {isUploading && !files.sketch && <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-500 border-t-transparent" />}
          </div>

          {/* Dimensions Upload */}
          <div 
            onClick={() => !files.dimensions && handleFileUpload('dimensions')}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-4 ${
              files.dimensions ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-600 hover:border-sky-500/50 bg-slate-900/40"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${files.dimensions ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
              {files.dimensions ? <CheckCircle2 size={20} /> : <Upload size={20} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200">{files.dimensions ? "Габариты загружены" : "Загрузить XML/JSON габариты"}</div>
              <div className="text-[10px] text-slate-500">{files.dimensions ? "dims_1402.xml" : "Технический файл спецификации"}</div>
            </div>
            {isUploading && !files.dimensions && <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-500 border-t-transparent" />}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-bold transition-all"
          >
            Отмена
          </button>
          <button 
            disabled={!canSubmit}
            onClick={() => onComplete(leadId, { sketch: 'sketch.jpg', dimensions: 'dims.xml' })}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              canSubmit 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            Замер выполнен
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurementModal;
