"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";

      // Step 1: Login to get access token
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.access_token);
        }

        try {
          // Step 2: Get the appropriate dashboard route using the new endpoint
          console.log("🎯 Getting dashboard route for user...");
          const routeResponse = await fetch(
            `${API_BASE_URL}/api/auth/dashboard-route`,
            {
              headers: { Authorization: `Bearer ${data.access_token}` },
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            console.log("✅ Dashboard route determined:", routeData);

            // Redirect to the appropriate dashboard
            if (routeData.route) {
              console.log(`🚀 Redirecting to: ${routeData.route}`);
              router.push(routeData.route);
            } else {
              console.log(
                "📋 No specific route, redirecting to user selection"
              );
              router.push("/user-selection");
            }
          } else {
            console.warn(
              "⚠️ Dashboard route fetch failed, using fallback logic"
            );

            // Fallback: Use user data from login response
            const user = data.user;
            if (user.role === "admin") {
              console.log(
                "👑 Admin user (fallback), redirecting to admin dashboard"
              );
              router.push("/admin");
            } else if (user.user_type === "affiliate_marketer") {
              console.log(
                "💰 Affiliate marketer (fallback), redirecting to affiliate dashboard"
              );
              router.push("/dashboard/affiliate");
            } else if (user.user_type === "content_creator") {
              console.log(
                "🎬 Content creator (fallback), redirecting to creator dashboard"
              );
              router.push("/dashboard/creator");
            } else if (user.user_type === "business_owner") {
              console.log(
                "🏢 Business owner (fallback), redirecting to business dashboard"
              );
              router.push("/dashboard/business");
            } else {
              console.log(
                "❓ User without type (fallback), redirecting to user selection"
              );
              router.push("/user-selection");
            }
          }
        } catch (routeError) {
          console.error("❌ Dashboard route fetch error:", routeError);

          // Final fallback: Try to use user data from login response
          const user = data.user;
          if (user && user.role === "admin") {
            router.push("/admin");
          } else if (user && user.user_type) {
            const dashboardRoutes: { [key: string]: string } = {
              affiliate_marketer: "/dashboard/affiliate",
              content_creator: "/dashboard/creator",
              business_owner: "/dashboard/business",
            };
            router.push(dashboardRoutes[user.user_type] || "/user-selection");
          } else {
            // Ultimate fallback
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 focus:ring-2 focus:ring-black/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Do not have an account?{" "}
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
