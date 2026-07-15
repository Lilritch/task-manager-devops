"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const token = await login(email, password);
      localStorage.setItem("token", token);
      router.push("/tasks");
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Log in
        </button>
      </form>
    </main>
  );
}
