import { useEffect, useMemo, useState } from "react";
import { workApi, type WorkDay, type WorkTask } from "../api";
import { isDone } from "../format";

export default function TodayPage({
  date,
  day,
  onReload,
}: {
  date: string;
  day: WorkDay;
  onReload: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const doneCount = useMemo(
    () => day.tasks.filter((t) => isDone(t.done)).length,
    [day.tasks],
  );

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
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">Сегодня</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {date} · сделано {doneCount} из {day.tasks.length}. Данные пишутся в SQLite (`backend/data/nova.db`) и не пропадают после перезагрузки.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <ol className="mt-6 space-y-3">
        {day.tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={() => toggle(task)} onComment={saveComment} />
        ))}
      </ol>
    </section>
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
    <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={isDone(task.done)}
          onChange={onToggle}
        />
        <span className={isDone(task.done) ? "text-zinc-400 line-through" : "text-zinc-800"}>
          <span className="mr-2 text-xs font-medium text-zinc-400">{task.sort_order}</span>
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
        className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-sky-400"
      />
    </li>
  );
}
