"use client";

/**
 * Login Page - Jaothui ID-Trace System
 * 
 * Dual authentication methods for Thai buffalo farmers:
 * 1. LINE OAuth - Primary method for farm owners
 * 2. Username/Password - For farm staff members
 * 
 * Design Principles:
 * - Mobile-first (320px minimum width)
 * - Elderly-friendly (44px touch targets, high contrast)
 * - Thai language native
 * - Accessible (WCAG 2.1 AA compliant)
 * 
 * @route /login
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  /**
   * Handle LINE OAuth Login
   * Initiates LINE login flow via better-auth
   */
  const handleLineLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Initiate LINE OAuth flow
      await authClient.signIn.social({
        provider: "line",
        callbackURL: "/",
      });
    } catch (err) {
      console.error("LINE login error:", err);
      setError("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  /**
   * Handle Staff Login with Email/Password
   * For farm staff members
   */
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError("");

      // Validate inputs
      if (!formData.email || !formData.password) {
        setError("กรุณากรอกอีเมลและรหัสผ่าน");
        setIsLoading(false);
        return;
      }

      // Sign in with email and password
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      });

      if (result.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
        return;
      }

      // Redirect to home on success
      router.push("/");
    } catch (err) {
      console.error("Staff login error:", err);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            ระบบ ID-Trace
          </h1>
          <p className="text-sm text-muted-foreground">
            ยินดีต้อนรับเข้าสู่ระบบข้อมูลควาย
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xs">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              เข้าสู่ระบบ
            </CardTitle>
            <CardDescription className="text-center">
              เลือกวิธีการเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {/* LINE OAuth Login Button */}
            <Button
              onClick={handleLineLogin}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-[#06C755] hover:bg-[#05b84f] text-white"
              aria-label="เข้าสู่ระบบด้วย LINE"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {/* LINE Logo */}
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  เข้าสู่ระบบด้วย LINE
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  หรือเข้าสู่ระบบสำหรับพนักงาน
                </span>
              </div>
            </div>

            {/* Staff Login Form */}
            <form onSubmit={handleStaffLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  อีเมล
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-label="อีเมล"
                  className="h-12 text-base"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  รหัสผ่าน
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-label="รหัสผ่าน"
                  className="h-12 text-base"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium"
                aria-label="เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                disabled={isLoading}
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          powered by JAOTHUI
        </p>
      </div>
    </div>
  );
}
