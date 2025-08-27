// Example: Update any back button component
// src/components/ui/BackToDashboard.tsx
"use client";

import Link from "next/link";
import { useUserNavigation } from "@/lib/hooks/useUserNavigation";

const BackToDashboard: React.FC = () => {
  const { dashboardRoute } = useUserNavigation();

  return (
    <Link
      href={dashboardRoute}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      ← Back to Dashboard
    </Link>
  );
};

export default BackToDashboard;
