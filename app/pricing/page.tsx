"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  BookOpen,
  FileText,
  Sparkles,
  Coins,
  Star,
  ShieldCheck,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans selection:bg-yellow-100 selection:text-yellow-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center rounded-lg shadow-sm">
              <span className="font-serif font-bold italic text-xl">F</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">
              Fantasia
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
              <Link
                href="/#features"
                className="hover:text-black transition-colors"
              >
                功能
              </Link>
              <Link
                href="/#use-cases"
                className="hover:text-black transition-colors"
              >
                适用人群
              </Link>
            </div>
            <Link
              href="/"
              className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              返回首页
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-xs font-bold uppercase tracking-wider text-yellow-700 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>新用户限时福利</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-medium leading-[1.1] mb-6 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          不仅仅是付费，
          <br />
          <span className="text-gray-400">更是对灵感的投资。</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          注册即送{" "}
          <span className="font-bold text-gray-900 bg-yellow-100/50 px-1 rounded">
            50 点数
          </span>
          。
          <br className="hidden md:block" />
          足够您完成 2 次完整的世界构建，或撰写 7 个精彩章节。
        </p>
      </section>

      {/* Consumption Rules */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif font-bold mb-3">点数消耗规则</h2>
            <p className="text-gray-500 text-sm">
              透明、灵活。每一分投入都转化为高质量的文本。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConsumptionCard
              icon={<BookOpen className="w-5 h-5" />}
              title="完整设定生成"
              desc="构建剧情设定、世界观、角色表及分章大纲（约5页内容）。"
              items={[
                { label: "标准版", cost: 20 },
                { label: "进阶版", cost: 30 },
                { label: "专业长篇", cost: 40 },
              ]}
            />
            <ConsumptionCard
              icon={<FileText className="w-5 h-5" />}
              title="单页设定生成"
              desc="仅生成单个角色小传、地点描述或特定的世界观规则。"
              items={[
                { label: "标准页", cost: 6 },
                { label: "精细页", cost: 10 },
              ]}
              footer={
                <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg mt-4">
                  <Zap className="w-3 h-3" />
                  <span>支持针对现有内容的局部重写</span>
                </div>
              }
            />
            <ConsumptionCard
              icon={<PenTool className="w-5 h-5" />}
              title="正文撰写"
              desc="AI 根据大纲和上下文记忆，撰写连贯的小说正文。"
              items={[
                { label: "标准章 (1.5k字)", cost: 5 },
                { label: "长章节 (2k+字)", cost: 8 },
              ]}
              footer={
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mt-4">
                  <ShieldCheck className="w-3 h-3" />
                  <span>不满意可免费重试 (每天3次)</span>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4">
            灵活的充值方案
          </h2>
          <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              永久有效，无过期时间
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} {...tier} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-4">
            如遇生成失败，系统将自动退还点数。
          </p>
          <div className="text-xs text-gray-300 font-mono">
            © 2025 FANTASIA INC.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Components

function ConsumptionCard({
  icon,
  title,
  desc,
  items,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  items: { label: string; cost: number }[];
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/60 hover:border-gray-300 transition-colors flex flex-col h-full">
      <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center mb-4 text-gray-700">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed flex-grow">
        {desc}
      </p>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-gray-600">{item.label}</span>
            <div className="font-mono font-bold text-gray-900">
              {item.cost} <span className="text-[10px] text-gray-400">PTS</span>
            </div>
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}

const pricingTiers = [
  {
    price: 30,
    credits: 150,
    costPerPoint: 0.2,
    name: "轻量体验包",
    tagline: "适合初次尝鲜",
    features: ["约 7 次完整设定生成", "适合短篇故事尝试"],
  },
  {
    price: 50,
    credits: 300,
    costPerPoint: 0.16,
    name: "标准体验包",
    tagline: "入门首选",
    features: ["足够完成一部中篇小说", "约 30-40 个章节"],
    highlight: false,
  },
  {
    price: 98,
    credits: 700,
    costPerPoint: 0.14,
    name: "标准创作包",
    tagline: "店长推荐",
    features: [
      "省 ¥42",
      "可生成 100+ 标准章节",
      "支持高频次大纲迭代",
      "优先生成队列",
    ],
    highlight: true,
  },
  {
    price: 198,
    credits: 1600,
    costPerPoint: 0.12,
    name: "高阶作者包",
    tagline: "长篇连载",
    features: ["更长上下文记忆窗口", "约 300+ 章节", "专属客服支持"],
  },
];

function PricingCard({
  price,
  credits,
  costPerPoint,
  name,
  tagline,
  features,
  highlight,
  dark,
}: {
  price: number;
  credits: number;
  costPerPoint: number;
  name: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col p-6 rounded-2xl w-full md:w-[calc(50%-12px)] xl:w-[calc(25%-18px)] transition-all duration-300",
        highlight
          ? "bg-white ring-2 ring-yellow-400 shadow-xl scale-[1.02] z-10"
          : dark
            ? "bg-gray-900 text-white shadow-lg lg:scale-[1.01]"
            : "bg-white border border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {/* Badge/Tagline logic */}
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-black" />
          {tagline}
        </div>
      )}
      {!highlight && tagline && (
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider mb-2",
            dark ? "text-yellow-500" : "text-gray-400"
          )}
        >
          {tagline}
        </div>
      )}

      {/* Content */}
      <div className="mb-6">
        <h3
          className={cn(
            "text-lg font-bold mb-4",
            dark ? "text-white" : "text-gray-900"
          )}
        >
          {name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium opacity-60">¥</span>
          <span className="text-4xl font-serif font-bold tracking-tight">
            {price}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-xl mb-6",
          dark ? "bg-gray-800" : "bg-gray-50"
        )}
      >
        <span className="font-bold text-lg flex items-center gap-2">
          <Coins
            className={cn(
              "w-5 h-5",
              highlight
                ? "text-yellow-600"
                : dark
                  ? "text-yellow-400"
                  : "text-gray-400"
            )}
          />
          {credits}
        </span>
        <span className={cn("text-xs", dark ? "text-gray-400" : "text-gray-400")}>
          ¥{costPerPoint.toFixed(2)}/点
        </span>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li
            key={i}
            className={cn(
              "text-sm flex gap-2.5 items-start",
              dark ? "text-gray-300" : "text-gray-600"
            )}
          >
            <Check
              className={cn(
                "w-4 h-4 shrink-0 mt-0.5",
                dark ? "text-gray-500" : "text-black"
              )}
            />
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
          highlight
            ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10"
            : dark
              ? "bg-white text-black hover:bg-gray-200"
              : "border border-gray-200 hover:bg-gray-50 text-gray-900"
        )}
      >
        立即购买
      </button>
    </div>
  );
}
