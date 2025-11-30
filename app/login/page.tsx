"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Mail,
  Lock,
  Loader2,
  Feather,
  Apple,
  Github,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "无效的登录凭据"
          : error.message
      );
    } else {
      // ✅ 强制浏览器硬跳转
      // 这会清空所有 React Context，重新向服务器请求最新数据
      window.location.href = "/projects";
    }

    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError("请输入电子邮箱和密码");
      return;
    }
    setIsRegisterLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // ✅ 注册成功后强制硬跳转到projects页面
      window.location.href = "/projects";
    }

    setIsRegisterLoading(false);
  };

  // Inspirational fragments that float on the right side
  const storyFragments = [
    "霓虹雨夜的低语...",
    "失落文明的最后一声叹息...",
    "星际穿越者的孤独日记...",
    "一把生锈的左轮手枪...",
    "维多利亚时代的迷雾...",
    "那封未寄出的信...",
    "时间尽头的图书馆...",
    "机械之心的跳动...",
    "被遗忘的神庙...",
    "赛博空间的幽灵...",
    "午夜列车的汽笛声...",
    "破碎的镜中世界...",
    "龙的鳞片与骑士的剑...",
    "人工智能觉醒的瞬间...",
    "侦探点燃了最后一支烟...",
  ];

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* LEFT SIDE - Functional & Minimalist */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 md:p-16 lg:p-24 xl:p-32 justify-center relative z-10 bg-white">
        {/* Logo */}
        <Link
          href="/"
          className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-sm">
            <span className="font-serif font-bold italic text-sm">F</span>
          </div>
          <span className="font-serif font-bold tracking-tight">Fantasia</span>
        </Link>

        <div className="max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-serif font-medium mb-3 text-primary leading-tight">
            欢迎回来。
          </h1>
          <p className="text-secondary text-sm md:text-base mb-10">
            继续编织您的世界。每一个伟大的故事都始于登录。
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5 group">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary group-focus-within:text-black transition-colors">
                电子邮箱
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-300"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5 transition-colors group-focus-within:text-black" />
              </div>
            </div>

            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary group-focus-within:text-black transition-colors">
                  密码
                </label>
                <a
                  href="#"
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  忘记密码?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-300"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-3.5 transition-colors group-focus-within:text-black" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white h-12 rounded-lg font-medium text-sm hover:bg-gray-900 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  进入工作室 <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 tracking-widest">
                或通过以下方式
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-secondary">
              <Github className="w-4 h-4" /> Github
            </button>
            <button className="flex items-center justify-center gap-2 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-secondary">
              <Apple className="w-4 h-4" /> Apple
            </button>
          </div>

          <p className="text-center text-xs text-secondary mt-8">
            还没有账号?{" "}
            <button
              onClick={handleRegister}
              disabled={isRegisterLoading}
              className="text-black font-bold hover:underline underline-offset-4 disabled:opacity-50"
            >
              {isRegisterLoading ? "注册中..." : "立即注册"}
            </button>
          </p>
        </div>

        <div className="absolute bottom-8 left-0 w-full text-center lg:text-left lg:pl-12 xl:pl-32">
          <p className="text-[10px] text-gray-300 font-mono">
            v2.5.0 / 2025 BUILD
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Artistic & Conceptual */}
      <div className="hidden lg:flex w-[55%] bg-[#050505] relative overflow-hidden flex-col justify-center items-center">
        {/* Abstract Ambient Background */}
        <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-gradient-to-b from-blue-900/20 to-purple-900/10 rounded-full blur-[120px] animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-t from-gray-800/10 to-transparent rounded-full blur-[100px]" />

        {/* Kinetic Text Stream "Waterfall" */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-40 select-none pointer-events-none">
          <div className="w-full h-[200%] animate-scroll-vertical flex flex-col items-center gap-16">
            {[...storyFragments, ...storyFragments].map((fragment, i) => (
              <div
                key={i}
                className="text-2xl md:text-3xl xl:text-4xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400 text-center whitespace-nowrap transform transition-all hover:scale-110 hover:text-white/80 duration-500"
                style={{
                  // Use deterministic values to avoid hydration mismatch
                  opacity: Math.max(
                    0.2,
                    Math.abs(Math.sin((i + 1) * 7919)) * 0.8
                  ),
                  transform: `translateX(${Math.sin(i) * 40}px)`,
                }}
              >
                {fragment}
              </div>
            ))}
          </div>
        </div>

        {/* Central Glass Card/Message */}
        <div className="relative z-10 max-w-md text-center px-8 backdrop-blur-sm py-12 rounded-2xl border border-white/5 bg-white/5 shadow-2xl">
          <Feather className="w-10 h-10 text-white/80 mx-auto mb-6" />
          <blockquote className="font-serif text-2xl text-white/90 leading-relaxed italic mb-6">
            &ldquo;写作不仅仅是记录。它是用文字在虚空中构建大厦。&rdquo;
          </blockquote>
          <cite className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase not-italic block">
            AI 辅助创作核心
          </cite>
        </div>
      </div>

      <style>{`
        @keyframes scroll-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll-vertical {
          animation: scroll-vertical 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
