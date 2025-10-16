// --- frontend/components/MockupGenerator.tsx ---

import React, { useState } from "react";
import Image from "next/image";

export default function MockupGenerator() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [template, setTemplate] = useState("blank_book");
  const [resultUrl, setResultUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setProductImage(e.target.files[0]);
  };

  const handleGenerate = async () => {
    if (!productImage) return;
    const formData = new FormData();
    formData.append("product_image", productImage);
    formData.append("template_name", template);
    formData.append("user_id", "00000000-0000-0000-0000-000000000000"); // replace with actual user UUID

    const res = await fetch("/api/mockups/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResultUrl(data.final_image_url);
  };

  return (
    <div className="p-4">
      <select
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="border p-2"
      >
        <option value="blank_book">Book</option>
        <option value="blank_bottle">Bottle</option>
        <option value="blank_box">Box</option>
      </select>
      <button
        onClick={handleGenerate}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate
      </button>
      {resultUrl && (
        <div className="mt-4 max-w-full relative w-full h-64">
          <Image
            src={resultUrl}
            alt="Mockup"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
