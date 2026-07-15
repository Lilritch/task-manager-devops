"use client";

import { useEffect, useState } from "react";
import { createTask, deleteTask, getTasks, Task, updateTask } from "@/lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await getTasks());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim());
    setTitle("");
    refresh();
  }

  async function toggleComplete(task: Task) {
    await updateTask(task.id, { completed: !task.completed });
    refresh();
  }

  async function remove(task: Task) {
    await deleteTask(task.id);
    refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">My Tasks</h1>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <span
                onClick={() => toggleComplete(task)}
                className={`cursor-pointer ${
                  task.completed ? "text-gray-400 line-through" : ""
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => remove(task)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-500">No tasks yet — add one above.</p>
          )}
        </ul>
      )}
    </main>
  );
}
