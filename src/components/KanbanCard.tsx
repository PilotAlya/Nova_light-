import React, { useState } from 'react';
import { Edit2, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { LeadStatus, Lead } from '../types';

export interface KanbanTask {
  id: string;
  title: string;
  status: LeadStatus;
  customer: string;
}

interface KanbanCardProps {
  task: KanbanTask;
  lead?: Lead;
  onStatusChange: (id: string, newStatus: LeadStatus) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  qcProgress?: number;
  overdue?: boolean;
  taskCount?: { done: number; total: number };
}

const nextStatus: Record<LeadStatus, LeadStatus | null> = {
  new: 'project',
  project: 'measure',
  measure: 'production',
  production: 'mounting',
  mounting: null,
};

const prevStatus: Record<LeadStatus, LeadStatus | null> = {
  new: null,
  project: 'new',
  measure: 'project',
  production: 'measure',
  mounting: 'production',
};

const statusLabels: Record<LeadStatus, { next: string; prev: string }> = {
  new: { next: 'В работу', prev: '' },
  project: { next: 'На замер', prev: '↩ В лиды' },
  measure: { next: 'В производство', prev: '↩ В проект' },
  production: { next: 'На монтаж', prev: '↩ На замер' },
  mounting: { next: '', prev: '↩ В производство' },
};

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  project: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  measure: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  production: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  mounting: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, lead, onStatusChange, onDragStart, qcProgress, overdue, taskCount }) => {
  const [isDragging, setIsDragging] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: overdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    marginBottom: '12px',
    cursor: isDragging ? 'grabbing' : 'grab',
    boxShadow: isDragging ? 'var(--shadow-drag)' : overdue ? '0 0 12px rgba(239,68,68,0.15)' : 'var(--shadow-sm)',
    transform: isDragging ? 'scale(1.02) rotate(1deg)' : 'scale(1)',
    transition: 'var(--transition-smooth)',
    userSelect: 'none',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e, task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const material = lead?.material && lead.material !== '—' ? lead.material : null;
  const type = lead?.type || null;
  const budget = lead?.budget && lead.budget !== '—' ? lead.budget : null;
  const risks: string[] = [];
  if (overdue) risks.push('Просрочен');
  if (lead && !budget) risks.push('Нет бюджета');

  return (
    <div
      style={cardStyle}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{
          color: 'var(--color-accent)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.03em',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Edit2 size={12} style={{ opacity: 0.5 }} />
          {task.id}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          {task.customer}
        </span>
      </div>
      <h4 style={{
        color: 'var(--text-primary)',
        margin: '0 0 8px 0',
        fontSize: '15px',
        fontWeight: 600,
        lineHeight: 1.3,
      }}>
        {task.title}
      </h4>

      {risks.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {risks.map((risk, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(239,68,68,0.12)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <AlertTriangle size={10} />
              {risk}
            </span>
          ))}
        </div>
      )}

      {(type || material || budget) && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {type && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(99,102,241,0.1)',
              color: '#818cf8',
            }}>
              {type}
            </span>
          )}
          {material && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: '#34d399',
            }}>
              {material}
            </span>
          )}
          {budget && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(251,191,36,0.1)',
              color: '#fbbf24',
            }}>
              {budget}
            </span>
          )}
        </div>
      )}

      {taskCount && taskCount.total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <CheckCircle2 size={12} style={{ color: taskCount.done === taskCount.total ? '#34d399' : '#64748b' }} />
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {taskCount.done}/{taskCount.total}
          </span>
          <div style={{
            flex: 1,
            height: '4px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(taskCount.done / taskCount.total) * 100}%`,
              backgroundColor: taskCount.done === taskCount.total ? '#34d399' : '#818cf8',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {qcProgress !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Clock size={12} style={{ color: qcProgress >= 80 ? '#34d399' : '#818cf8' }} />
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            QC: {qcProgress}%
          </span>
          <div style={{
            flex: 1,
            height: '4px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${qcProgress}%`,
              backgroundColor: qcProgress === 100 ? '#34d399' : qcProgress >= 50 ? '#818cf8' : '#f87171',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
        {prevStatus[task.status] && (
          <button
            onClick={() => onStatusChange(task.id, prevStatus[task.status]!)}
            style={buttonStyle}
          >
            {statusLabels[task.status].prev}
          </button>
        )}
        {nextStatus[task.status] && (
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status]!)}
            style={{ ...buttonStyle, color: 'var(--color-accent)' }}
          >
            {statusLabels[task.status].next}
          </button>
        )}
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--bg-main)',
};
