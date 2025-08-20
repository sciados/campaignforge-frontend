// src/components/ui/toggle-switch.tsx
/**
 * 🎛️ Toggle Switch Component
 * Reusable on/off switch for AI provider enable/disable
 */

import React from "react";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onToggle,
  disabled = false,
  loading = false,
  size = "md",
  label,
  description,
}) => {
  const sizes = {
    sm: {
      switch: "w-8 h-4",
      thumb: "w-3 h-3",
      translate: "translate-x-4",
    },
    md: {
      switch: "w-11 h-6",
      thumb: "w-5 h-5",
      translate: "translate-x-5",
    },
    lg: {
      switch: "w-14 h-7",
      thumb: "w-6 h-6",
      translate: "translate-x-7",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={`
          relative inline-flex ${
            sizeConfig.switch
          } shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? "bg-green-600" : "bg-gray-200"}
          ${
            disabled || loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-opacity-80"
          }
        `}
        disabled={disabled || loading}
        onClick={() => onToggle(!enabled)}
        aria-checked={enabled}
        role="switch"
      >
        <span
          className={`
            ${
              sizeConfig.thumb
            } inline-block transform rounded-full bg-white shadow-lg ring-0 
            transition duration-200 ease-in-out
            ${enabled ? sizeConfig.translate : "translate-x-0"}
          `}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label className="text-sm font-medium text-gray-900">{label}</label>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};
