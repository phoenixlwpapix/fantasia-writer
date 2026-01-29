import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
      <div className="relative">
        <div
          className="w-12 h-12 bg-black rounded-lg animate-spin"
          style={{ animationDuration: "3s" }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-white font-serif font-bold italic">
          F
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 animate-pulse">
        <h2 className="text-lg font-serif font-bold text-primary">Fantasia</h2>
        <p className="text-xs text-secondary uppercase tracking-widest">
          正在初始化引擎...
        </p>
      </div>
    </div>
  );
}
