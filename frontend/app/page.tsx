import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Task Manager</h1>
      <p className="text-gray-600">A work queue for tasks, issues, and failed builds.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded bg-black px-4 py-2 text-white">
          Log in
        </Link>
        <Link href="/register" className="rounded border border-black px-4 py-2">
          Register
        </Link>
      </div>
    </main>
  );
}
