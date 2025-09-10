// src/app/login/page.tsx - COMPLETELY FIXED LOGIN FLOW (NO HARDCODED URLS)
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApiUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

interface LoginFormData {
  email: string;
  password: string;
}

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
      // Step 1: Login with credentials
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Login failed");
        return;
      }

      const data = await response.json();

      // Step 2: Store token
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", data.access_token);
        localStorage.setItem("access_token", data.access_token); // Backup for compatibility
      }

      // Step 3: Get user profile to determine routing
      try {
        const profileResponse = await fetch(getApiUrl("/api/auth/profile"), {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profile = await profileResponse.json();

          // Route based on user profile
          if (profile.role === "admin") {
            router.replace("/admin");
            return;
          }

          // Check if user has completed user type selection
          if (!profile.user_type) {
            router.replace("/user-selection");
            return;
          }

          // Route to appropriate dashboard based on user type
          const dashboardRoutes = {
            affiliate_marketer: "/dashboard/affiliate",
            affiliate: "/dashboard/affiliate", // Support both formats
            content_creator: "/dashboard/creator", 
            creator: "/dashboard/creator", // Support both formats
            business_owner: "/dashboard/business",
            business: "/dashboard/business", // Support both formats
          };

          const dashboardRoute =
            dashboardRoutes[profile.user_type as keyof typeof dashboardRoutes];

          if (dashboardRoute) {
            console.log(`Login: Directing user type ${profile.user_type} to ${dashboardRoute}`);
            router.replace(dashboardRoute);
          } else {
            console.warn(`Login: Unknown user type ${profile.user_type}, routing to user selection`);
            router.replace("/user-selection");
          }
        } else {
          // Profile fetch failed, route to user selection
          console.warn(
            "Could not fetch user profile, routing to user selection"
          );
          router.replace("/user-selection");
        }
      } catch (profileError) {
        console.error("Profile fetch error:", profileError);
        // Fallback to user selection on any profile error
        router.replace("/user-selection");
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
