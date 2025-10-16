// --- frontend/pages/mockups.tsx ---
import React from "react";
import MockupGenerator from "src/components/MockupGenerator";

export default function MockupsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Your Mockup</h1>
      <MockupGenerator />
    </div>
  );
}
