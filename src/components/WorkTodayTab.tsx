import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { workApi, type WorkDay, type WorkTask } from "../api/work";

function isDone(v: number | boolean): boolean {
  return v === true || v === 1;
}

interface WorkTodayTabProps {
  date: string;
  day: WorkDay;
  onReload: () => Promise<void>;
}

export default function WorkTodayTab({ date, day, onReload }: WorkTodayTabProps) {
  const [error, setError] = useState("");
  const doneCount = useMemo(() => day.tasks.filter((t) => isDone(t.done)).length, [day.tasks]);

  async function toggle(task: WorkTask) {
    setError("");
    try {
      await workApi.patchTask(task.id, { done: !isDone(task.done) });
      await onReload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function saveComment(task: WorkTask, comment: string) {
    setError("");
    try {
      await workApi.patchTask(task.id, { comment });
      await onReload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 size={18} className="text-indigo-400" />
        <p className="text-sm text-slate-400">
          {date} · сделано {doneCount} из {day.tasks.length}
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <ol className="space-y-3">
        {day.tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={() => toggle(task)} onComment={saveComment} />
        ))}
        {day.tasks.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Задач на сегодня нет</p>}
      </ol>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onComment,
}: {
  task: WorkTask;
  onToggle: () => void;
  onComment: (task: WorkTask, comment: string) => Promise<void>;
}) {
  const [comment, setComment] = useState(task.comment || "");
  useEffect(() => {
    setComment(task.comment || "");
  }, [task.comment]);

  return (
    <li className="glass-panel rounded-xl border border-white/5 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-indigo-500" checked={isDone(task.done)} onChange={onToggle} />
        <span className={isDone(task.done) ? "text-slate-500 line-through" : "text-slate-200"}>
          <span className="mr-2 text-xs font-bold text-slate-500">{task.sort_order}</span>
          {task.title}
        </span>
      </label>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onBlur={() => {
          if (comment !== (task.comment || "")) void onComment(task, comment);
        }}
        placeholder="Комментарий, если что-то не так"
        className="mt-3 w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
      />
    </li>
  );
}
