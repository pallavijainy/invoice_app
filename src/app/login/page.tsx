"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import axiosInstance from "@/services/api";
import { saveToken } from "@/utils/auth";
import Footer from "@/components/Footer";

const LoginPage = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/Auth/Login", {
        email: email.trim(),
        password,
        rememberMe,
      });

      const data = response.data;

      saveToken(data.token, rememberMe);

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Invalid email or password.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white border border-gray-300 rounded-md">

      <header className="h-[76px] border-b border-gray-200 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xl text-gray-800">
          <span className="text-2xl">▤</span>
          <span>InvoiceApp</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4">

        <div className="mt-12 text-center">
          <h1 className="text-[30px] font-medium text-gray-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-base text-gray-500">
            Log in to your account.
          </p>
        </div>

        <div className="w-full max-w-[448px] mt-8 mb-12 border border-gray-200 rounded-lg shadow-sm p-6">

          <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-2"
              >
                Email Address<span className="text-red-500">*</span>
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-700 mb-2"
              >
                Password<span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 pr-11 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon fontSize="small" />
                  ) : (
                    <VisibilityOutlinedIcon fontSize="small" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">

              <label
                htmlFor="rememberMe"
                className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 cursor-pointer accent-gray-700"
                />

                <span>Remember me</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="h-10 min-w-[90px] px-6 rounded-md bg-gray-700 text-white text-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging..." : "Login"}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-red-500 text-center -mt-2"
              >
                {error}
              </p>
            )}

          </form>

          <div className="mt-7 text-center">
            <Link
              href="/signup"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>

<Footer />
    </div>
  );
};

export default LoginPage;