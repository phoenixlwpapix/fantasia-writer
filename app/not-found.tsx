import React from "react";
import Link from "next/link";
import { Ghost, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <Ghost className="w-12 h-12 text-secondary/50" />
      </div>

      <h1 className="text-6xl font-serif font-bold mb-4 text-primary">404</h1>
      <h2 className="text-xl font-medium mb-2">这一页不存在于当前的时间线。</h2>
      <p className="text-secondary max-w-md mb-8 leading-relaxed">
        您似乎踏入了一个尚未被书写的章节，或者该故事线已被删除。
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all active:scale-95 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        返回主页
      </Link>
    </div>
  );
}
