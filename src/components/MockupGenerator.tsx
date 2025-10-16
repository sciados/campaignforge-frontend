// --- frontend/components/MockupGenerator.tsx ---
"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function MockupGenerator() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [template, setTemplate] = useState("blank_book");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!productImage) {
      setError("Please upload a product image first.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to generate mockups.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("product_image", productImage);
      formData.append("template_name", template);

      const res = await fetch("/api/mockups/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Mockup generation failed");
      }

      const data = await res.json();
      setResultUrl(data.final_image_url);
    } catch (err: any) {
      console.error("Mockup generation error:", err);
      setError(err.message || "Something went wrong while generating mockup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">🎨 Generate Product Mockup</h2>

      <div className="space-y-3">
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="blank_book">📘 Book</option>
          <option value="blank_bottle">🥤 Bottle</option>
          <option value="blank_box">📦 Box</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 w-full rounded"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Mockup"}
        </button>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        {resultUrl && (
          <div className="mt-6 w-full h-64 relative border rounded-lg overflow-hidden">
            <Image
              src={resultUrl}
              alt="Generated Mockup"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );
}
