// src/app/dashboard/content-library/page.tsx - AFFILIATE PRODUCT LIBRARY
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calendar,
  Star,
  Eye,
  Copy,
  Download,
  Plus,
  Grid,
  List,
  AlertCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  DollarSign,
  Heart,
  Zap,
  Award,
  Users,
  Target,
  BarChart3,
  Bookmark,
  Share2,
  Play,
} from "lucide-react";
import { useApi } from "@/lib/api";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company: {
    id: string;
    company_name: string;
    company_slug: string;
    subscription_tier: string;
    monthly_credits_used: number;
    monthly_credits_limit: number;
    company_size?: string;
  };
}

interface ProductData {
  id: string;
  product_name: string;
  sales_page_url: string;
  product_category: string;
  launch_date: string;
  commission_rate?: number;
  price?: number;
  vendor_name?: string;
  product_description?: string;
  conversion_rate?: number;
  earnings_per_click?: number;
  gravity_score?: number;
  status: 'active' | 'upcoming' | 'ended';
  created_at: string;
  updated_at?: string;
  affiliate_signup_url?: string;
}

interface ProductCategory {
  category: string;
  icon: string;
  label: string;
  color: string;
  bgGradient: string;
  products: ProductData[];
  count: number;
  totalEarnings?: number;
  avgConversion?: number;
}

interface LibraryStats {
  totalProducts: number;
  activeProducts: number;
  categories: number;
  totalEarnings: number;
  avgConversionRate: number;
  topCategory: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PRODUCT_CATEGORY_CONFIG = {
  make_money: {
    label: "Make Money Online",
    icon: "💰",
    color: "bg-green-100 text-green-800",
    bgGradient: "from-green-50 to-emerald-50",
  },
  health_fitness: {
    label: "Health & Fitness",
    icon: "💪",
    color: "bg-blue-100 text-blue-800",
    bgGradient: "from-blue-50 to-cyan-50",
  },
  relationships: {
    label: "Relationships & Dating",
    icon: "❤️",
    color: "bg-pink-100 text-pink-800",
    bgGradient: "from-pink-50 to-rose-50",
  },
  personal_development: {
    label: "Personal Development",
    icon: "🌟",
    color: "bg-purple-100 text-purple-800",
    bgGradient: "from-purple-50 to-indigo-50",
  },
  business_marketing: {
    label: "Business & Marketing",
    icon: "📈",
    color: "bg-orange-100 text-orange-800",
    bgGradient: "from-orange-50 to-amber-50",
  },
  technology: {
    label: "Technology & Software",
    icon: "💻",
    color: "bg-gray-100 text-gray-800",
    bgGradient: "from-gray-50 to-slate-50",
  },
  education: {
    label: "Education & Training",
    icon: "📚",
    color: "bg-yellow-100 text-yellow-800",
    bgGradient: "from-yellow-50 to-amber-50",
  },
  hobbies_crafts: {
    label: "Hobbies & Crafts",
    icon: "🎨",
    color: "bg-teal-100 text-teal-800",
    bgGradient: "from-teal-50 to-cyan-50",
  },
};

const PRODUCT_STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: TrendingUp,
  },
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  ended: {
    label: "Ended",
    color: "bg-gray-100 text-gray-600",
    icon: Award,
  },
};

export default function AffiliateProductLibrary() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const api = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [organizedProducts, setOrganizedProducts] = useState<ProductCategory[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const router = useRouter();
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatCategory = useCallback((category: string): string => {
    const config = PRODUCT_CATEGORY_CONFIG[category as keyof typeof PRODUCT_CATEGORY_CONFIG];
    if (config) return config.label;
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  }, []);

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    return "Recently";
  }, []);

  const groupProductsByCategory = useCallback((products: ProductData[]): ProductCategory[] => {
    const groups: Record<string, ProductData[]> = {};

    products.forEach((product) => {
      const category = product.product_category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    return Object.entries(groups)
      .map(([category, products]) => {
        const config = PRODUCT_CATEGORY_CONFIG[category as keyof typeof PRODUCT_CATEGORY_CONFIG] || {
          label: formatCategory(category),
          icon: "📦",
          color: "bg-gray-100 text-gray-800",
          bgGradient: "from-gray-50 to-slate-50",
        };

        const sortedProducts = products.sort(
          (a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()
        );

        const totalEarnings = products.reduce((sum, product) => sum + (product.earnings_per_click || 0), 0);
        const avgConversion = products.length > 0
          ? products.reduce((sum, product) => sum + (product.conversion_rate || 0), 0) / products.length
          : 0;

        return {
          category,
          icon: config.icon,
          label: config.label,
          color: config.color,
          bgGradient: config.bgGradient,
          products: sortedProducts,
          count: products.length,
          totalEarnings,
          avgConversion,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [formatCategory]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadProductLibraryData = useCallback(async () => {
    if (isLoadingRef.current || hasLoadedRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      // Load user profile
      const userProfile = await api.getUserProfile();
      const transformedUser: User = {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        company: {
          id: userProfile.company?.id || '',
          company_name: userProfile.company?.company_name || '',
          company_slug: userProfile.company?.company_slug || '',
          subscription_tier: userProfile.company?.subscription_tier || 'free',
          monthly_credits_used: userProfile.company?.monthly_credits_used || 0,
          monthly_credits_limit: userProfile.company?.monthly_credits_limit || 0,
          company_size: userProfile.company?.company_size || 'solo',
        },
      };
      setUser(transformedUser);

      // Load approved product submissions from admin review system
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
          "https://campaign-backend-production-e2db.up.railway.app";

        const response = await fetch(
          `${API_BASE_URL}/api/admin/intelligence/creator-submissions?status=approved&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );

        let approvedProducts: ProductData[] = [];

        if (response.ok) {
          const data = await response.json();
          const submissions = data.data || [];

          // Transform approved submissions to ProductData format
          approvedProducts = submissions.map((submission: any) => {
            // Calculate earnings per click based on commission and conversion rates
            const commissionRate = submission.commission_rate || 50;
            const price = submission.product_price || 0;
            const conversionRate = submission.estimated_conversion_rate || 0;
            const earningsPerClick = price && conversionRate ?
              (price * (commissionRate / 100) * (conversionRate / 100)) : null;

            return {
              id: submission.id,
              product_name: submission.product_name,
              sales_page_url: submission.sales_page_url,
              product_category: submission.category,
              launch_date: submission.launch_date,
              commission_rate: submission.commission_rate || 50,
              price: submission.product_price || null,
              vendor_name: submission.submitter_name || submission.company_name || "Product Creator",
              product_description: submission.notes || `${submission.product_name} - Submitted via Product Creator program`,
              conversion_rate: submission.estimated_conversion_rate ? submission.estimated_conversion_rate / 100 : null,
              earnings_per_click: earningsPerClick,
              gravity_score: submission.gravity_score || null,
              status: "active" as const,
              created_at: submission.submitted_at,
              updated_at: submission.processed_at,
              affiliate_signup_url: submission.affiliate_signup_url
            };
          });
        }

        // If no approved products yet, show a few mock examples
        if (approvedProducts.length === 0) {
          approvedProducts = [
            {
              id: "example_001",
              product_name: "AI Profit Builder Pro",
              sales_page_url: "https://example.com/ai-profit-builder",
              product_category: "make_money",
              launch_date: "2024-01-15T00:00:00Z",
              commission_rate: 50,
              price: 97,
              vendor_name: "Demo Product Creator",
              product_description: "Example product - Real products will appear here once approved by admin.",
              conversion_rate: 0.08,
              earnings_per_click: 2.35,
              gravity_score: 89,
              status: "active",
              created_at: "2024-01-15T00:00:00Z",
            },
            {
              id: "example_002",
              product_name: "Demo Product - Health & Fitness",
              sales_page_url: "https://example.com/demo-health",
              product_category: "health_fitness",
              launch_date: "2024-01-10T00:00:00Z",
              commission_rate: 65,
              price: 87,
              vendor_name: "Demo Creator",
              product_description: "Example product - Real products will appear here once approved by admin.",
              conversion_rate: 0.11,
              earnings_per_click: 2.80,
              gravity_score: 127,
              status: "active",
              created_at: "2024-01-10T00:00:00Z",
            },
          ];
        }

        setAllProducts(approvedProducts);

        const productCategories = groupProductsByCategory(approvedProducts);
        setOrganizedProducts(productCategories);

        const libraryStats: LibraryStats = {
          totalProducts: approvedProducts.length,
          activeProducts: approvedProducts.filter(p => p.status === 'active').length,
          categories: productCategories.length,
          totalEarnings: approvedProducts.reduce((sum, product) => sum + (product.earnings_per_click || 0), 0),
          avgConversionRate: approvedProducts.length > 0
            ? approvedProducts.reduce((sum, product) => sum + (product.conversion_rate || 0), 0) / approvedProducts.length
            : 0,
          topCategory: productCategories.length > 0 ? productCategories[0].label : "None",
        };

        setStats(libraryStats);
        setExpandedCategories(new Set(productCategories.slice(0, 3).map(cat => cat.category)));

      } catch (apiError) {
        console.error("❌ Failed to load approved submissions:", apiError);
        // Fall back to empty state if API fails
        setAllProducts([]);
        setOrganizedProducts([]);
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          categories: 0,
          totalEarnings: 0,
          avgConversionRate: 0,
          topCategory: "None",
        });
      }

      hasLoadedRef.current = true;
    } catch (error) {
      console.error("❌ Failed to load Product Library data:", error);
      setError(error instanceof Error ? error.message : "Failed to load product library");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [router, api, groupProductsByCategory]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadProductLibraryData();
    }
  }, [loadProductLibraryData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleProductClick = (product: ProductData) => {
    window.open(product.sales_page_url, '_blank');
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // ============================================================================
  // FILTERING
  // ============================================================================

  const getFilteredProducts = (): ProductCategory[] => {
    return organizedProducts
      .map((category) => {
        let filteredProducts = category.products;

        // Apply search filter
        if (searchQuery) {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.product_description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply status filter
        if (statusFilter !== "all") {
          filteredProducts = filteredProducts.filter(
            (product) => product.status === statusFilter
          );
        }

        return {
          ...category,
          products: filteredProducts,
          count: filteredProducts.length,
        };
      })
      .filter((category) => {
        // Apply category filter
        if (categoryFilter !== "all" && category.category !== categoryFilter) {
          return false;
        }
        return category.count > 0;
      });
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-semibold text-black">{stats.totalProducts}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <Target className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="text-sm text-gray-500">{stats.activeProducts} currently active</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total EPC</p>
              <p className="text-3xl font-semibold text-black">{formatCurrency(stats.totalEarnings)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">Earnings per click</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-3xl font-semibold text-black">{formatPercentage(stats.avgConversionRate)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">Across all products</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="text-lg font-semibold text-black">{stats.topCategory}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500">{stats.categories} categories total</div>
        </div>
      </div>
    );
  };

  const renderProductCard = (product: ProductData) => {
    const statusConfig = PRODUCT_STATUS_CONFIG[product.status];
    const StatusIcon = statusConfig?.icon || Clock;

    return (
      <div
        key={product.id}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:border-gray-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">{product.product_name}</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig?.label || product.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{product.vendor_name}</p>
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.product_description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Commission</p>
            <p className="text-sm font-semibold text-green-600">{product.commission_rate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">EPC</p>
            <p className="text-sm font-semibold text-blue-600">{formatCurrency(product.earnings_per_click || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Conversion</p>
            <p className="text-sm font-semibold text-purple-600">{formatPercentage(product.conversion_rate || 0)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Launch: {new Date(product.launch_date).toLocaleDateString()}</span>
          <span>Gravity: {product.gravity_score}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleProductClick(product)}
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Sales Page
          </button>
          <button
            onClick={() => handleCopyUrl(product.sales_page_url)}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderCategorySection = (category: ProductCategory) => {
    const isExpanded = expandedCategories.has(category.category);

    return (
      <div key={category.category} className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
        <button
          onClick={() => toggleCategoryExpansion(category.category)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-2xl">{category.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
              {category.count} products
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Avg EPC: {formatCurrency(category.totalEarnings || 0)}</span>
            <span>Avg Conv: {formatPercentage(category.avgConversion || 0)}</span>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 p-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map(renderProductCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {category.products.map(renderProductCard)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your product library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              hasLoadedRef.current = false;
              loadProductLibraryData();
            }}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-black w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-black">Product Library</h1>
                <p className="text-sm text-gray-600 hidden md:block">Affiliate Marketing Hub</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {user && (
                <div className="bg-gray-100 text-gray-800 flex items-center space-x-2 px-3 py-1 rounded-md">
                  <span className="text-sm font-medium">{user.company.subscription_tier}</span>
                </div>
              )}
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-black">Affiliate Products</h2>
          <p className="text-gray-600 mt-2">
            Discover high-converting products organized by category and launch date
          </p>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="all">All Categories</option>
                {Object.entries(PRODUCT_CATEGORY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-black"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 ${
                    viewMode === "list"
                      ? "bg-gray-100 text-black"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  hasLoadedRef.current = false;
                  loadProductLibraryData();
                }}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Found {filteredProducts.reduce((sum, cat) => sum + cat.count, 0)} products across {filteredProducts.length} categories
          </div>
        </div>

        {/* Product Categories */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-black mb-3">No products found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "No products match your current filters. Try adjusting your search terms or filters."
                : "No products available yet. Check back later for new affiliate opportunities!"}
            </p>
            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
                className="bg-gray-100 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProducts.map(renderCategorySection)}
          </div>
        )}
      </div>
    </div>
  );
}