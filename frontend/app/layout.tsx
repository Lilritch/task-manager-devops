import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Cloud-native task manager with a full DevOps pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
