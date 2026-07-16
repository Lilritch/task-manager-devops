const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  source: string;
  external_id: string | null;
  external_url: string | null;
  priority: string;
  due_date: string | null;
  created_at: string;
};

export type TaskStats = {
  total: number;
  open: number;
  completed: number;
  by_source: Record<string, number>;
};

export type SyncResult = {
  source: string;
  imported: number;
  skipped: number;
  message: string;
};

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  return data.access_token as string;
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Registration failed");
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.detail || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function getTasks(source?: string): Promise<Task[]> {
  const url = new URL(`${API_URL}/tasks/`);
  if (source && source !== "all") url.searchParams.set("source", source);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function getTaskStats(): Promise<TaskStats> {
  const res = await fetch(`${API_URL}/tasks/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load task stats");
  return res.json();
}

export async function createTask(
  title: string,
  description = "",
  priority = "medium"
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title, description, priority }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, "title" | "description" | "completed" | "priority">>
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function syncGitHubIssues(
  owner: string,
  repo: string
): Promise<SyncResult> {
  const res = await fetch(`${API_URL}/integrations/github/issues/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ owner, repo }),
  });
  if (!res.ok) throw await parseError(res, "Failed to sync GitHub issues");
  return res.json();
}

export async function syncGitHubActions(
  owner: string,
  repo: string
): Promise<SyncResult> {
  const res = await fetch(`${API_URL}/integrations/github/actions/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ owner, repo }),
  });
  if (!res.ok) throw await parseError(res, "Failed to sync GitHub Actions");
  return res.json();
}
