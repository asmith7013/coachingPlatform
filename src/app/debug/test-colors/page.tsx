"use client";

import React from "react";

export default function TailwindSanityCheck() {
  return (
    <div className="min-h-screen bg-white text-black p-8 space-y-8">
      <h1 className="text-2xl font-bold">Tailwind v4 + Token Debug</h1>

      {/* 🔥 Tailwind Native Check */}
      <div className="bg-red-500 text-blue-500 p-4 rounded">
        If this is red with blue text → Tailwind base classes are working
      </div>

      {/* 🎨 Theme Token Check (Semantic Colors) */}
      <div className="bg-secondary text-white p-4 rounded">
        If this is soft gray bg and dark gunmetal text → Theme tokens are working
      </div>

      {/* 🧪 Arbitrary Utility Check */}
      <div className="bg-success text-white p-4 rounded">
        If this is green background → arbitrary class names are supported
      </div>
            {/* 🧪 Arbitrary Utility Check */}
      <div className="bg-primary text-white p-4 rounded">
        If this is green background → arbitrary class names are supported
      </div>

      {/* 🧩 CSS Variables Check */}
      <div
        className="p-4 rounded"
        style={{
          backgroundColor: "var(--colors-background)",
          color: "var(--colors-text)",
        }}
      >
        If this uses theme.css variables (seasalt bg + gunmetal text), your custom CSS vars are injected
      </div>

      {/* 🧠 Font Family Debug */}
      <div className="text-base font-[family-name:var(--font-geist)]">
        Using Geist font family via variable
      </div>
    </div>
  );
} 