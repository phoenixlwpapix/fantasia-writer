"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "../../lib/supabase-db";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIsAdmin().then((admin) => {
      if (!admin) {
        router.push("/");
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 animate-spin text-gray-400" />
          <span className="text-gray-500">
            {loading ? "验证管理员权限..." : "权限不足，正在跳转..."}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-primary">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-sm">
            <span className="font-serif font-bold italic text-lg">F</span>
          </div>
          <div>
            <span className="font-serif font-bold tracking-tight text-lg block leading-none">
              Fantasia
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link
            href="/admin?tab=overview"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg font-medium transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            数据概览
          </Link>
          <Link
            href="/admin?tab=users"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors"
          >
            <Users className="w-5 h-5" />
            用户管理
          </Link>
          <div className="px-4 py-3 text-gray-500 cursor-not-allowed flex items-center gap-3 hover:text-gray-300 transition-colors">
            <BookOpen className="w-5 h-5" />
            内容审核
          </div>
          <div className="px-4 py-3 text-gray-500 cursor-not-allowed flex items-center gap-3 hover:text-gray-300 transition-colors">
            <Settings className="w-5 h-5" />
            系统设置
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出管理
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
