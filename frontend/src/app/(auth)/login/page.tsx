"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/components/authContext/authContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      // alert("hellooo")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v3/auth/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.get("username"),
            password: formData.get("password"),
          }),
        }
      );

      const data = await response.json();
      console.log("Login response:", {
        status: response.status,
        data: data,
      });

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      setUser({
        isAuthenticated: true,
        token: data.access,
        data: { token: data.access, refreshToken: data.refresh },
      });
      // Store tokens with proper configuration
      Cookies.set("token", data.access, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: 1, // 1 day
      });

      Cookies.set("refresh_token", data.refresh, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: 7, // 7 days
      });

      console.log("Stored tokens:", {
        access: Cookies.get("token")?.substring(0, 20) + "...",
        refresh: Cookies.get("refresh_token")?.substring(0, 20) + "...",
      });

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="relative bg-gray-900 h-screen w-full">
      <div className="absolute z-20 w-full h-full">
        <div className="container mx-auto h-full flex flex-col justify-center px-3">
          <div className="flex justify-center items-center mb-8">
            <Image
              src="/images/airp-logo.svg"
              alt="AI Radio"
              width={200}
              height={200}
              priority
              className="w-200 h-auto"
            />
          </div>

          <div className="w-full max-w-[400px] bg-[#1a1a1a] rounded-2xl p-8 mx-auto">
            <h1 className="text-xl md:text-2xl text-white text-center font-semibold mb-8">
              LOGIN TO AI RADIO CMS
            </h1>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 border-0 focus:ring-2 focus:ring-[#7ac5be]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 border-0 focus:ring-2 focus:ring-[#7ac5be]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7ac5be] hover:bg-[#68b1aa] text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
