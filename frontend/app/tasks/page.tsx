"use client";

import { useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  getTaskStats,
  syncGitHubActions,
  syncGitHubIssues,
  Task,
  TaskStats,
  updateTask,
} from "@/lib/api";

const sourceLabels: Record<string, string> = {
  all: "All",
  manual: "Manual",
  github_issue: "GitHub Issues",
  github_action: "Failed CI",
  slack: "Slack",
  calendar: "Calendar",
};

const sourceOptions = [
  "all",
  "manual",
  "github_issue",
  "github_action",
  "slack",
  "calendar",
];

function sourceLabel(source: string) {
  return sourceLabels[source] || source;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [source, setSource] = useState("all");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [nextTasks, nextStats] = await Promise.all([
        getTasks(source),
        getTaskStats(),
      ]);
      setTasks(nextTasks);
      setStats(nextStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [source]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim(), description.trim(), priority);
    setTitle("");
    setDescription("");
    setPriority("medium");
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

  async function sync(kind: "issues" | "actions") {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError("Enter the GitHub owner and repo first.");
      return;
    }

    setSyncing(kind);
    setError("");
    setMessage("");
    try {
      const result =
        kind === "issues"
          ? await syncGitHubIssues(repoOwner.trim(), repoName.trim())
          : await syncGitHubActions(repoOwner.trim(), repoName.trim());
      setMessage(`${result.message} Imported ${result.imported}, skipped ${result.skipped}.`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing("");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2 border-b pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">DevOps task dashboard</p>
          <h1 className="text-3xl font-bold">My Work Queue</h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="w-fit rounded border px-4 py-2 text-sm font-medium hover:bg-white"
        >
          Log out
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-3xl font-bold">{stats?.open ?? 0}</p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold">{stats?.completed ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded border bg-white p-4">
          <h2 className="text-lg font-semibold">Add Manual Task</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="rounded border px-3 py-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes or context"
            className="min-h-24 rounded border px-3 py-2"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded border px-3 py-2"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <button type="submit" className="rounded bg-black px-4 py-2 font-medium text-white">
            Add task
          </button>
        </form>

        <section className="flex flex-col gap-3 rounded border bg-white p-4">
          <h2 className="text-lg font-semibold">Sync GitHub Work</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="Owner, e.g. vercel"
              className="rounded border px-3 py-2"
            />
            <input
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="Repo, e.g. next.js"
              className="rounded border px-3 py-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => sync("issues")}
              disabled={!!syncing}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {syncing === "issues" ? "Syncing..." : "Sync issues"}
            </button>
            <button
              type="button"
              onClick={() => sync("actions")}
              disabled={!!syncing}
              className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {syncing === "actions" ? "Syncing..." : "Sync failed CI"}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border px-3 py-2">
              <p className="text-sm text-gray-500">GitHub issues</p>
              <p className="font-semibold">{stats?.by_source.github_issue ?? 0}</p>
            </div>
            <div className="rounded border px-3 py-2">
              <p className="text-sm text-gray-500">Failed CI</p>
              <p className="font-semibold">{stats?.by_source.github_action ?? 0}</p>
            </div>
          </div>
          {message && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </section>
      </section>

      <nav className="flex flex-wrap gap-2">
        {sourceOptions.map((option) => (
          <button
            key={option}
            onClick={() => setSource(option)}
            className={`rounded border px-3 py-2 text-sm font-medium ${
              source === option ? "border-black bg-black text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            {sourceLabel(option)}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="grid gap-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="grid gap-3 rounded border bg-white p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">
                    {sourceLabel(task.source)}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      task.priority === "high"
                        ? "bg-red-50 text-red-700"
                        : task.priority === "low"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.external_url && (
                    <a
                      href={task.external_url}
                      target="_blank"
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Open source
                    </a>
                  )}
                </div>
                <button
                  onClick={() => toggleComplete(task)}
                  className={`max-w-full text-left text-lg font-semibold ${
                    task.completed ? "text-gray-400 line-through" : ""
                  }`}
                >
                  {task.title}
                </button>
                {task.description && (
                  <p className="whitespace-pre-line break-words text-sm text-gray-600">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleComplete(task)}
                  className="rounded border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  {task.completed ? "Reopen" : "Complete"}
                </button>
                <button
                  onClick={() => remove(task)}
                  className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {tasks.length === 0 && (
            <p className="rounded border bg-white p-4 text-gray-500">
              No tasks found for this filter.
            </p>
          )}
        </ul>
      )}
    </main>
  );
}
