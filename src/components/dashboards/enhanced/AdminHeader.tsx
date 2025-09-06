"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, Search, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  aiDiscoveryData?: {
    total_active: number;
    pending_suggestions: number;
  };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  aiDiscoveryData,
}) => {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-black">
              CampaignForge Admin
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
              v3.3.0
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
            <span>Platform</span>
            <span>/</span>
            <span className="text-black">Administration</span>
            <span>/</span>
            <span className="text-purple-600">AI Discovery</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-red-800">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Access</span>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search users, companies..."
              className="pl-10 pr-4 py-2 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {aiDiscoveryData && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">
                {aiDiscoveryData.total_active} Active |{" "}
                {aiDiscoveryData.pending_suggestions} Pending
              </span>
            </div>
          )}

          <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
};
