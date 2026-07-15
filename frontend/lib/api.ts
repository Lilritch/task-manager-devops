const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
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

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function createTask(title: string, description = ""): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, "title" | "description" | "completed">>
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
