// src/app/login/page.tsx - COMPLETELY FIXED LOGIN FLOW (NO HARDCODED URLS)
"use client";

import React, { useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          
          // DEBUG: Log the entire profile to see what we're getting
          console.log("🔍 LOGIN DEBUG - Full profile received:", JSON.stringify(profile, null, 2));
          console.log("🔍 LOGIN DEBUG - User type value:", profile.user_type);
          console.log("🔍 LOGIN DEBUG - User type type:", typeof profile.user_type);

          // Route based on user profile
          if (profile.role === "admin") {
            router.replace("/admin");
            return;
          }

          // Check if user is admin first (role takes precedence)
          if (profile.role === "ADMIN" || profile.role === "admin") {
            console.log(`✅ LOGIN: Admin user detected (role: ${profile.role}), routing to admin dashboard`);
            router.replace("/admin");
            return;
          }

          // Check if user has completed user type selection
          if (!profile.user_type) {
            console.warn(`❌ LOGIN DEBUG - No user_type found, routing to user selection. Profile.user_type:`, profile.user_type);
            router.replace("/user-selection");
            return;
          }

          // Route to appropriate dashboard based on user type
          const dashboardRoutes = {
            // Admin routing
            admin: "/admin",
            administrator: "/admin",

            // User type routing
            affiliate_marketer: "/dashboard/affiliate",
            affiliate: "/dashboard/affiliate", // Support both formats
            content_creator: "/dashboard/creator",
            creator: "/dashboard/creator", // Support both formats
            product_creator: "/dashboard/product-creator",
            business_owner: "/dashboard/business",
            business: "/dashboard/business", // Support both formats

            // Also support backend format in case deployment hasn't updated yet
            AFFILIATE_MARKETER: "/dashboard/affiliate",
            CONTENT_CREATOR: "/dashboard/creator",
            PRODUCT_CREATOR: "/dashboard/product-creator",
            BUSINESS_OWNER: "/dashboard/business",
          };

          const dashboardRoute =
            dashboardRoutes[profile.user_type as keyof typeof dashboardRoutes];

          if (dashboardRoute) {
            console.log(`✅ LOGIN: Directing user type "${profile.user_type}" to ${dashboardRoute}`);
            router.replace(dashboardRoute);
          } else {
            console.warn(`❌ LOGIN: Unknown user type "${profile.user_type}", routing to user selection`);
            console.warn(`Available routes:`, Object.keys(dashboardRoutes));
            router.replace("/user-selection");
          }
        } else {
          // Profile fetch failed, check if it's a server error vs auth error
          const statusCode = profileResponse.status;
          console.warn(`Profile fetch failed with status ${statusCode}`);
          
          if (statusCode === 500) {
            // Log the 500 error for debugging
            console.error("🔧 Profile API returned 500 error - this should be fixed now");
            try {
              const errorBody = await profileResponse.text();
              console.log("🔍 500 Error response body:", errorBody);
            } catch (parseError) {
              console.log("🔍 Could not parse 500 error response");
            }
            
            // Route to user selection as fallback for 500 errors
            console.warn("Profile API error - routing to user selection for user to set up profile");
            router.replace("/user-selection");
            return;
          } else if (statusCode === 401) {
            // Auth error - token invalid
            if (typeof window !== "undefined") {
              localStorage.removeItem("authToken");
              localStorage.removeItem("access_token");
            }
            setError("Session expired. Please log in again.");
            setIsLoading(false);
            return;
          } else {
            // Other error - route to user selection as fallback
            console.warn("Could not fetch user profile, routing to user selection");
            router.replace("/user-selection");
          }
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

  if (!isMounted) {
    return null;
  }

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
