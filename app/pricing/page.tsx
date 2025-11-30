"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Zap,
  BookOpen,
  FileText,
  Sparkles,
  Coins,
  Crown,
  Star,
  ShieldCheck,
  PenTool,
} from "lucide-react";
import { Badge } from "../../components/ui'/UIComponents";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-primary font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm shadow-md">
            <span className="font-serif font-bold italic text-lg">F</span>
          </div>
          <span className="font-serif font-bold italic text-xl tracking-tight">
            Fantasia
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-secondary">
            <Link
              href="/#features"
              className="hover:text-primary transition-colors"
            >
              功能
            </Link>
            <Link
              href="/#use-cases"
              className="hover:text-primary transition-colors"
            >
              适用人群
            </Link>
          </div>
          <Link
            href="/"
            className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
          >
            返回首页
          </Link>
        </div>
      </nav>

      {/* Hero Section: Free Credits */}
      <section className="pt-40 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 text-xs font-bold uppercase tracking-widest text-yellow-700 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>新用户限时福利</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          不仅是付费，
          <br />
          更是对灵感的投资。
        </h1>

        <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          注册即送{" "}
          <span className="font-bold text-black border-b-2 border-yellow-400">
            50 点数
          </span>
          。
          <br className="hidden md:block" />
          足够您完成 2 次完整的世界构建，或撰写 7 个精彩章节。
        </p>
      </section>

      {/* Consumption Rules */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">点数消耗规则</h2>
            <p className="text-secondary">
              透明、灵活。每一分投入都转化为高质量的文本。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rule 1: Full Bible */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">完整设定生成</h3>
              <p className="text-sm text-secondary mb-6 h-10">
                一次性构建剧情设定、世界观、角色表及分章大纲（约5页内容）。
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-700">标准版</span>
                  <div className="flex items-center font-mono font-bold">
                    20{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-700">进阶版</span>
                  <div className="flex items-center font-mono font-bold">
                    30{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">专业长篇</span>
                  <div className="flex items-center font-mono font-bold">
                    40{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rule 2: Single Asset */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border border-gray-200 text-black rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">单页设定生成</h3>
              <p className="text-sm text-secondary mb-6 h-10">
                仅生成单个角色小传、地点描述或特定的世界观规则。
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-700">标准页</span>
                  <div className="flex items-center font-mono font-bold">
                    6{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">精细页</span>
                  <div className="flex items-center font-mono font-bold">
                    10{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>支持针对现有内容的局部重写</span>
                </div>
              </div>
            </div>

            {/* Rule 3: Chapter Writing */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center mb-6">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">正文撰写</h3>
              <p className="text-sm text-secondary mb-6 h-10">
                AI 根据大纲和上下文记忆，撰写连贯的小说正文。
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-700">
                    标准章{" "}
                    <span className="text-[10px] font-normal text-gray-400 ml-1">
                      (1.5k字)
                    </span>
                  </span>
                  <div className="flex items-center font-mono font-bold">
                    5{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">
                    长章节{" "}
                    <span className="text-[10px] font-normal text-gray-400 ml-1">
                      (2k+字)
                    </span>
                  </span>
                  <div className="flex items-center font-mono font-bold">
                    8{" "}
                    <span className="text-[10px] ml-1 text-gray-400">PTS</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  <span>不满意可免费重试 (每天3次)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold mb-6">
            选择您的创作方案
          </h2>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <span className="px-4 py-1 bg-black text-white rounded-full">
              按需充值
            </span>
            <span
              className="px-4 py-1 text-gray-400 cursor-not-allowed"
              title="即将推出"
            >
              月度订阅 (Coming Soon)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Column 1: Experience Packs */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-500 mb-2">
                轻量体验包
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-serif font-bold">¥30</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-6">
                <span className="font-bold text-lg flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" /> 150{" "}
                  <span className="text-xs font-normal text-gray-500">点</span>
                </span>
                <span className="text-xs text-gray-400">¥0.20 / 点</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-secondary flex gap-2">
                  <Check className="w-4 h-4 text-black shrink-0" />{" "}
                  适合撰写短篇故事
                </li>
                <li className="text-sm text-secondary flex gap-2">
                  <Check className="w-4 h-4 text-black shrink-0" /> 约 7
                  次完整设定生成
                </li>
              </ul>
              <button className="w-full py-3 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                购买
              </button>
            </div>

            <div className="bg-white border-2 border-gray-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                入门首选
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                标准体验包
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-serif font-bold">¥50</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-6 border border-gray-100">
                <span className="font-bold text-xl flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500 fill-yellow-500" />{" "}
                  300{" "}
                  <span className="text-xs font-normal text-gray-500">点</span>
                </span>
                <span className="text-xs text-gray-400">¥0.16 / 点</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-secondary flex gap-2">
                  <Check className="w-4 h-4 text-black shrink-0" />{" "}
                  足够完成一部中篇小说
                </li>
                <li className="text-sm text-secondary flex gap-2">
                  <Check className="w-4 h-4 text-black shrink-0" /> 约 30-40
                  个章节
                </li>
              </ul>
              <button className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-md">
                立即购买
              </button>
            </div>
          </div>

          {/* Column 2: Standard (Recommended) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl relative transform lg:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" /> 店长推荐
            </div>

            <div className="text-center mt-4 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                标准创作包
              </h3>
              <p className="text-sm text-secondary">最适合稳定连载的作者</p>
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl font-serif font-bold mb-2">¥98</div>
              <div className="text-sm text-green-600 font-bold bg-green-50 inline-block px-3 py-1 rounded-full">
                省 ¥42
              </div>
            </div>

            <div className="flex items-center justify-between bg-yellow-50 rounded-xl p-4 mb-8 border border-yellow-100">
              <div className="text-left">
                <span className="block text-xs text-yellow-800 font-bold uppercase tracking-wide">
                  包含点数
                </span>
                <span className="font-bold text-2xl flex items-center gap-2 text-yellow-900">
                  <Coins className="w-6 h-6 fill-yellow-600 text-yellow-700" />{" "}
                  700
                </span>
              </div>
              <span className="text-sm font-bold text-yellow-800 bg-white/50 px-2 py-1 rounded">
                ¥0.14 / 点
              </span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="text-sm text-gray-700 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span>
                  可生成约 <span className="font-bold">100+</span> 个标准章节
                </span>
              </li>
              <li className="text-sm text-gray-700 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span>支持高频次的大纲迭代与重写</span>
              </li>
              <li className="text-sm text-gray-700 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span>优先队列：高峰期生成速度更快</span>
              </li>
            </ul>

            <button className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 fill-white" /> 获取创作包
            </button>
          </div>

          {/* Column 3: Pro (Black) */}
          <div className="space-y-6">
            <div className="bg-black text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-200">
                    高阶作者包
                  </h3>
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-serif font-bold">¥198</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl font-bold text-yellow-400">
                    1600 <span className="text-sm text-gray-400">点</span>
                  </span>
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                    ¥0.12 / 点
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  专为长篇连载设计。包含更高级别的上下文记忆窗口权限。
                </p>

                <button className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors">
                  购买
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 shadow-xl border border-gray-800 relative overflow-hidden group hover:scale-[1.01] transition-transform">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">
                    专业版 Pro Max
                  </h3>
                  <div className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                    最佳性价比
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-serif font-bold">¥328</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl font-bold text-yellow-400">
                    3000 <span className="text-sm text-gray-400">点</span>
                  </span>
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                    ¥0.10 / 点
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  极致的创作自由。适合工作室或多部作品同时连载。
                </p>

                <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-900/20">
                  购买
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-secondary text-sm mb-4">
            所有的充值点数永久有效，无过期时间。如遇生成失败，系统将自动退还点数。
          </p>
          <div className="text-xs text-gray-400">© 2025 Fantasia Inc.</div>
        </div>
      </footer>
    </div>
  );
}
