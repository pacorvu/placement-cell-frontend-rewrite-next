"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { z } from "zod";

type AlertType = "success" | "error" | "info" | null;

// Zod validation schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Step indicator component
const StepIndicator = ({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
        currentStep >= step
          ? "bg-primary text-primary-content"
          : "bg-base-300 text-base-content/50"
      }`}
    >
      {step}
    </div>
    <span
      className={`text-xs mt-2 ${
        currentStep >= step ? "text-base-content" : "text-base-content/50"
      }`}
    >
      {label}
    </span>
  </div>
);

export default function ForgotPasswordComponent() {
  const router = useRouter();

  // State management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
  }>({ type: null, message: "" });
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setAlert({ type: "error", message: result.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    setAlert({ type: null, message: "" });

    try {
      await authService.forgotPassword(email);
      setAlert({
        type: "success",
        message: "OTP sent to your email! Please check your inbox.",
      });
      setCurrentStep(2);
      setResendCooldown(60);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send OTP";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (format validation only)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate OTP format
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      setAlert({ type: "error", message: result.error.errors[0].message });
      return;
    }

    setAlert({ type: null, message: "" });
    setCurrentStep(3);
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setIsLoading(true);
    setAlert({ type: null, message: "" });

    try {
      await authService.forgotPassword(email);
      setAlert({
        type: "success",
        message: "New OTP sent to your email!",
      });
      setResendCooldown(60);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to resend OTP";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password with OTP verification
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      setAlert({ type: "error", message: result.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    setAlert({ type: null, message: "" });

    try {
      await authService.resetPassword(email, otp, newPassword);
      setAlert({
        type: "success",
        message: "Password reset successfully! Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please check your OTP and try again.";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input (numeric only, max 6 digits)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Alert */}
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

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Forgot Password</h2>
            <p className="text-base-content/60 mt-2">
              Reset your password in 3 easy steps
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8">
            <StepIndicator
              step={1}
              currentStep={currentStep}
              label="Email"
            />
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep >= 2 ? "bg-primary" : "bg-base-300"
              }`}
            />
            <StepIndicator
              step={2}
              currentStep={currentStep}
              label="Verify OTP"
            />
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep >= 3 ? "bg-primary" : "bg-base-300"
              }`}
            />
            <StepIndicator
              step={3}
              currentStep={currentStep}
              label="New Password"
            />
          </div>

          {/* Step 1: Email Form */}
          {currentStep === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    We'll send you a one-time password
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="link link-hover text-primary text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification Form */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-base-content/70">
                  OTP sent to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Enter 6-digit OTP</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  className="input input-bordered w-full text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Check your email for the code
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="text-center mt-4 space-y-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
                <div>
                  <Link
                    href="/login"
                    className="link link-hover text-primary text-sm"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Password Reset Form */}
          {currentStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-12"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  <span className="label-text-alt text-base-content/60">
                    Minimum 8 characters
                  </span>
                </label>
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-12"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm absolute right-1 top-1"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
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
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="link link-hover text-primary text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
