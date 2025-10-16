"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import to prevent SSR errors
const MockupGenerator = dynamic(() => import("@/components/MockupGenerator"), {
  ssr: false,
});

export default function MockupsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Product Mockup Generator
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Upload your product image and choose a template to create a realistic
        mockup.
      </p>
      <MockupGenerator />
    </div>
  );
}
