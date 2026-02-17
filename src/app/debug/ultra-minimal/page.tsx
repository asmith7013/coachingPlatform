"use client";

import React from "react";
import { RenderLoopDetector } from "@/components/debug/RenderLoopDetector";

function UltraMinimalComponent() {
  console.log("UltraMinimalComponent render");
  return <div className="p-4 bg-white">Ultra minimal test</div>;
}

export default function UltraMinimalTest() {
  console.log("UltraMinimalTest render");
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ultra Minimal Test</h1>
      <RenderLoopDetector componentId="ultra-minimal" timeThreshold={50}>
        <UltraMinimalComponent />
      </RenderLoopDetector>
    </div>
  );
}
