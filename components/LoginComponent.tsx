"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AlertType = "success" | "error" | "info" | null;

export default function LoginComponent() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
  }>({ type: null, message: "" });

  /** Load message from localStorage (one-time) */
  useEffect(() => {
    const storedMessage = localStorage.getItem("message");
    if (storedMessage) {
      setAlert({ type: "info", message: storedMessage });
      localStorage.removeItem("message");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ type: null, message: "" });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store auth data
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("isLoggedIn", "true");
      // UX feedback
      setAlert({ type: "success", message: "Login successful! Redirecting…" });
      setTimeout(() => {
        if (data.role_type === "Student") router.push("/student/dashboard");
        else if (data.role_type === "Alumni") router.push("/alumni/dashboard");
        else if (data.role_type === "Company")
          router.push("/company/dashboard");
        else if (data.role_type === "Dean") router.push("/dean/dashboard");
        else if (
          data.role_type === "Management" ||
          data.role_type === "Admission_Office"
        )
          router.push("/management/dashboard");
        else if (data.role_type === "Parents")
          router.push("/parents/dashboard");
        else if (data.role_type === "Placement_Officer")
          router.push("/placement/dashboard");
        else throw new Error("Role doesn't Exist");
      }, 1000);
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* ================= ALERT ================= */}
          {alert.type && (
            <div
              className={`alert mb-4 ${
                alert.type === "success"
                  ? "alert-success"
                  : alert.type === "error"
                    ? "alert-error"
                    : "alert-info"
              }`}
            >
              <span>{alert.message}</span>
            </div>
          )}

          {/* ================= HEADER ================= */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Login</h2>
            <p className="text-base-content/60 mt-2">Sign in to continue</p>
          </div>

          {/* ================= TEST CREDS ================= */}
          <div className="alert alert-info mb-4 text-xs">
            <div>
              <strong>Test Credentials</strong>
              <div>Email: student@test.com</div>
              <div>Password: Test@123</div>
            </div>
          </div>

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm absolute right-1 top-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt"></span>
                <Link
                  href="/forgot-password"
                  className="label-text-alt link link-hover text-primary"
                >
                  Forgot password?
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in…
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
