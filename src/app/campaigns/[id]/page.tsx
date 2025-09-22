// src/app/campaigns/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

export default function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const router = useRouter();

  // Redirect to the new inputs workflow
  useEffect(() => {
    router.push(`/campaigns/${params.id}/inputs`);
  }, [router, params.id]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to campaign workflow...</p>
      </div>
    </div>
  );
}