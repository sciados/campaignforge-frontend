"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function MockupGenerator() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [template, setTemplate] = useState("blank_book");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setProductImage(e.target.files[0]);
  };

  const handleGenerate = async () => {
    setError("");

    if (!productImage) {
      setError("Please upload a product image.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to generate mockups.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("product_image", productImage);
      formData.append("template_name", template);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mockups/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Mockup generation failed");
      }

      const data = await res.json();
      setResultUrl(data.final_image_url);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the mockup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-lg mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Create a Product Mockup</h2>

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600"
        />

        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="blank_book">Book Cover</option>
          <option value="blank_bottle">Supplement Bottle</option>
          <option value="blank_box">Product Box</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full transition"
        >
          {loading ? "Generating..." : "Generate Mockup"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {resultUrl && (
        <div className="mt-6 relative w-full h-64 border rounded overflow-hidden">
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
  );
}
