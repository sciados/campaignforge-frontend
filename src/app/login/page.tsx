// File: src/app/login/page.tsx
// Login page with type-safe dashboard routing and user authentication
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campaign-backend-production-e2db.up.railway.app";

interface LoginFormData {
  email: string;
  password: string;
}

interface User {
  role: string;
  user_type?: string;
  [key: string]: any;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RouteResponse {
  route?: string;
}

type UserType = "affiliate_marketer" | "content_creator" | "business_owner";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.access_token);
        }

        try {
          const routeResponse = await fetch(
            `${API_BASE_URL}/api/auth/dashboard-route`,
            {
              headers: { Authorization: `Bearer ${data.access_token}` },
            }
          );

          if (routeResponse.ok) {
            const routeData: RouteResponse = await routeResponse.json();
            if (routeData.route) {
              router.push(routeData.route);
            } else {
              router.push("/user-selection");
            }
          } else {
            // Fallback routing logic with type safety
            const user = data.user;
            if (user.role === "admin") {
              router.push("/admin");
            } else if (user.user_type) {
              const dashboardRoutes: Record<UserType, string> = {
                affiliate_marketer: "/dashboard/affiliate",
                content_creator: "/dashboard/creator",
                business_owner: "/dashboard/business",
              };

              // Type-safe access to dashboard routes
              const userType = user.user_type as UserType;
              if (userType in dashboardRoutes) {
                router.push(dashboardRoutes[userType]);
              } else {
                router.push("/user-selection");
              }
            } else {
              router.push("/user-selection");
            }
          }
        } catch (routeError) {
          console.error("Dashboard route fetch error:", routeError);

          // Final fallback with type safety
          const user = data.user;
          if (user && user.role === "admin") {
            router.push("/admin");
          } else if (user && user.user_type) {
            const dashboardRoutes: Record<UserType, string> = {
              affiliate_marketer: "/dashboard/affiliate",
              content_creator: "/dashboard/creator",
              business_owner: "/dashboard/business",
            };

            const userType = user.user_type as UserType;
            if (userType in dashboardRoutes) {
              router.push(dashboardRoutes[userType]);
            } else {
              router.push("/user-selection");
            }
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error - please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center px-12">
        <div className="max-w-lg">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-8">
            <span className="text-white text-xl font-medium">C</span>
          </div>
          <h1 className="text-4xl font-light text-black mb-6 leading-tight">
            Welcome back to
            <br />
            <span className="font-semibold">CampaignForge.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Transform any content into complete marketing campaigns with
            AI-powered intelligence.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-medium">C</span>
            </div>
            <h2 className="text-2xl font-light text-black">Welcome back</h2>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-light text-black mb-2">Sign in</h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-black hover:text-gray-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don not have an account?{" "}
              <Link
                href="/register"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-black transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="#" className="hover:text-black transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
