"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useStory } from "./StoryProvider";
import {
  Search,
  X,
  User,
  LogOut,
  Coins,
  Shield,
} from "lucide-react";

const SPINE_COLORS = [
  {
    name: "Obsidian (Default)",
    value: "from-gray-800 to-gray-700",
    ring: "ring-gray-600",
  },
  { name: "Crimson", value: "from-red-700 to-red-900", ring: "ring-red-600" },
  {
    name: "Royal Azure",
    value: "from-blue-700 to-blue-900",
    ring: "ring-blue-600",
  },
  {
    name: "Verdant",
    value: "from-emerald-700 to-emerald-900",
    ring: "ring-emerald-600",
  },
  {
    name: "Amethyst",
    value: "from-purple-700 to-purple-900",
    ring: "ring-purple-600",
  },
  {
    name: "Amber Leather",
    value: "from-amber-700 to-yellow-900",
    ring: "ring-amber-600",
  },
];

interface NavbarProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterColor?: string | null;
  onFilterColorChange?: (color: string | null) => void;
}

export function Navbar({
  showSearch = true,
  searchQuery = "",
  onSearchChange,
  filterColor = null,
  onFilterColorChange,
}: NavbarProps) {
  const { userCredits, isAdmin, user } = useStory();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border px-6 py-6 flex items-center justify-between transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left: Branding */}
      <Link
        href="/"
        className="flex items-center gap-2 cursor-pointer select-none shrink-0 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm">
          <span className="font-serif font-bold italic text-lg">F</span>
        </div>
        <span className="font-serif font-bold italic text-xl tracking-tight hidden sm:block">
          Fantasia
        </span>
      </Link>

      {/* Center: Search & Filter (conditionally rendered) */}
      {showSearch && onSearchChange && onFilterColorChange && (
        <div className="flex-1 max-w-2xl mx-4 md:mx-12 flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black text-sm transition-all"
              placeholder="搜索您的故事..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Color Filter (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-gray-200">
            {SPINE_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() =>
                  onFilterColorChange(filterColor === c.value ? null : c.value)
                }
                className={`w-4 h-4 rounded-full bg-gradient-to-br ${
                  c.value
                } transition-all hover:scale-110 focus:outline-none ${
                  filterColor === c.value
                    ? `ring-2 ring-offset-2 ${c.ring} scale-110`
                    : "opacity-70 hover:opacity-100"
                }`}
                title={`筛选: ${c.name}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Spacer when search is hidden */}
      {!showSearch && <div className="flex-1" />}

      {/* Right: User Menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
            isUserMenuOpen
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <User className="w-5 h-5" />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border z-50 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1 font-bold">
                注册邮箱
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1 font-bold">
                可用点数
              </p>
              <div className="flex items-center justify-between text-primary font-bold">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{userCredits}</span>
                </div>
                <Link
                  href="/pricing"
                  className="px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  充值
                </Link>
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Shield className="w-4 h-4" />
                管理面板
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:bg-gray-50 hover:text-red-600 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export { SPINE_COLORS };
