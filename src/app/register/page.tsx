// src/app/register/page.tsx - COMPLETELY FIXED REGISTRATION FLOW (NO HARDCODED URLS)

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getApiUrl } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // Get user type from URL params or localStorage
    const userTypeFromUrl = searchParams.get('userType');
    const userTypeFromStorage = typeof window !== "undefined" 
      ? localStorage.getItem('selectedUserType') 
      : null;
    
    const userType = userTypeFromUrl || userTypeFromStorage;
    if (userType) {
      setSelectedUserType(userType);
      console.log("📋 Registration form loaded with user type:", userType);
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register user with selected user type
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        company_name: formData.company || `${formData.firstName}'s Company`,
        user_type: selectedUserType, // Include the selected user type
      };

      const response = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Registration failed");
        return;
      }

      const data = await response.json();

      // Step 2: Handle the response
      if (data.access_token) {
        // Store token if provided (some backends auto-login after registration)
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.access_token);
          localStorage.setItem("access_token", data.access_token);
        }
      }

      // Step 3: Clean up and route appropriately
      // Clear the temporary user type from storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedUserType");
      }

      // Route directly to appropriate dashboard if user type was selected
      if (selectedUserType) {
        console.log("🎯 Registration complete with user type, routing to dashboard");
        
        // Route based on user type
        const dashboardRoutes = {
          // Admin routing
          admin: "/admin",
          administrator: "/admin",
          
          // User type routing
          affiliate_marketer: "/dashboard/affiliate",
          affiliate: "/dashboard/affiliate",
          content_creator: "/dashboard/creator", 
          creator: "/dashboard/creator",
          business_owner: "/dashboard/business",
          business: "/dashboard/business",
        };

        const dashboardRoute = dashboardRoutes[selectedUserType as keyof typeof dashboardRoutes];

        if (dashboardRoute) {
          console.log(`✅ REGISTRATION: Directing user type "${selectedUserType}" to ${dashboardRoute}`);
          router.push(dashboardRoute);
        } else {
          console.warn(`❌ REGISTRATION: Unknown user type "${selectedUserType}", routing to user selection`);
          router.push("/user-selection");
        }
      } else {
        console.log("📋 Registration complete without user type, routing to user selection");
        router.push("/user-selection");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error - please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
            Start creating with
            <br />
            <span className="font-semibold">CampaignForge.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Join thousands of marketers transforming content into complete
            campaigns with AI.
          </p>

          <div className="space-y-4">
            {[
              "AI-powered campaign intelligence",
              "Multi-user type specialization",
              "Complete marketing workflows",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-medium">C</span>
            </div>
            <h2 className="text-2xl font-light text-black">Create Account</h2>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-light text-black mb-2">
              Create account
            </h2>
            <p className="text-gray-600">
              Get started with your specialized dashboard
            </p>
            {selectedUserType && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Selected type:</span> {
                    selectedUserType === 'affiliate_marketer' ? 'Affiliate Marketer' :
                    selectedUserType === 'content_creator' ? 'Content Creator' :
                    selectedUserType === 'business_owner' ? 'Business Owner' : 
                    selectedUserType
                  }
                </p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name (optional)"
              />
            </div>

            {/* Password */}
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
                  placeholder="8+ characters"
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

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
              />
              <Label
                htmlFor="agreeToTerms"
                className="text-sm text-gray-600 leading-relaxed"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  Privacy Policy
                </a>
              </Label>
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
                  <span>Create Account</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                Sign in
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
