import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/authContext/authContext";
import ReactQueryProvider from "@/lib/utils/reactQueryProvider";

const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Radio CMS",
  description: "Content Management System for AI Radio Player",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={figtree.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <ReactQueryProvider>
            <main>
              <AuthProvider>{children}</AuthProvider>
            </main>
            <Toaster richColors position="top-right" />
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  );
}
