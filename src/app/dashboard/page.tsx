// src/app/dashboard/page.tsx
/**
 * Main Dashboard Page with Smart Routing
 * 🎯 Routes users to their appropriate dashboard
 */

import UserTypeRouter from "@/components/dashboards/UserTypeRouter";

export default function DashboardPage() {
  return <UserTypeRouter />;
}
