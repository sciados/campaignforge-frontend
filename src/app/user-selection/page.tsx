// src/app/user-selection/page.tsx
/**
 * User Type Selection Page
 * 🎭 Where users choose their user type during onboarding
 */

import UserTypeSelector from "@/components/user-types/UserTypeSelector";

export default function UserSelectionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserTypeSelector />
    </div>
  );
}
