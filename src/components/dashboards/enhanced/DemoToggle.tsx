"use client";

import React from "react";

interface DemoToggleProps {
  showDemo: boolean;
  onToggle: () => void;
}

export const DemoToggle: React.FC<DemoToggleProps> = ({
  showDemo,
  onToggle,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Show Demo Campaigns</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          showDemo ? "bg-black" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            showDemo ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
