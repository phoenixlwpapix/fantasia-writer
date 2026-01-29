import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Simplified Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex items-center bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm shadow-md">
            <span className="font-serif font-bold italic text-lg">F</span>
          </div>
          <span className="font-serif font-bold italic text-xl tracking-tight">
            Fantasia
          </span>
        </div>
      </nav>

      {/* Loading Content */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="relative">
          <div
            className="w-12 h-12 bg-black rounded-lg animate-spin"
            style={{ animationDuration: "3s" }}
          />
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
    </div>
  );
}
