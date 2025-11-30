import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/UIComponents";
import { generateFullStoryBible } from "../services/gemini";
import { CreditConfirmationModal } from "./CreditConfirmationModal";
import { deductUserCredits } from "../lib/supabase-db";
import { createClient } from "../lib/supabase/client";
import { GenerationType, GENERATION_COSTS } from "../lib/types";
import { useStory } from "./StoryProvider";
import {
  Loader2,
  Sparkles,
  Zap,
  PenTool,
  ArrowRight,
  Home,
} from "lucide-react";

interface ProjectCreationSelectorProps {
  onManualStart: () => void;
  onAIGenerate: (bible: any) => void;
}

export const ProjectCreationSelector: React.FC<
  ProjectCreationSelectorProps
> = ({ onManualStart, onAIGenerate }) => {
  const { userCredits, setUserCredits } = useStory();
  const [quickIdea, setQuickIdea] = useState("");
  const [quickChapterCount, setQuickChapterCount] = useState<number>(8);
  const [quickWordCount, setQuickWordCount] = useState<number>(1500);
  const [isFullGenerating, setIsFullGenerating] = useState(false);

  // Credits Modal State
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [pendingGenerationData, setPendingGenerationData] = useState<{
    idea: string;
    chapterCount: number;
    wordCount: number;
  } | null>(null);

  const handleFullGenerate = () => {
    if (!quickIdea.trim()) return;

    const cost = GENERATION_COSTS[GenerationType.COMPLETE_SETUP];
    if (userCredits < cost) {
      alert(`积分不足！需要 ${cost} 积分，当前余额 ${userCredits} 积分`);
      return;
    }

    setPendingGenerationData({
      idea: quickIdea,
      chapterCount: quickChapterCount,
      wordCount: quickWordCount,
    });
    setIsCreditModalOpen(true);
  };

  const confirmGeneration = async () => {
    if (!pendingGenerationData) return;

    const cost = GENERATION_COSTS[GenerationType.COMPLETE_SETUP];
    const supabase = createClient();
    const success = await deductUserCredits(supabase, cost);
    if (success) {
      setUserCredits((prev) => prev - cost);
      await executeGeneration(pendingGenerationData);
    } else {
      alert("扣除积分失败，请重试");
    }

    setPendingGenerationData(null);
  };

  const executeGeneration = async (data: {
    idea: string;
    chapterCount: number;
    wordCount: number;
  }) => {
    setIsFullGenerating(true);
    try {
      const newBible = await generateFullStoryBible(
        data.idea,
        data.chapterCount,
        data.wordCount
      );
      onAIGenerate(newBible);
    } catch (e) {
      console.error(e);
      // Handle error, perhaps show alert
    } finally {
      setIsFullGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href="/projects">
          <Button variant="ghost" size="sm" icon={<Home className="w-4 h-4" />}>
            返回项目列表
          </Button>
        </Link>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-medium mb-4">
          开始您的创作之旅
        </h1>
        <p className="text-secondary">选择一种方式来构建您的世界基础。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Option 1: AI Generation */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-8 text-white shadow-xl flex flex-col relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex flex-row items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold whitespace-nowrap">
                一键灵感生成
              </h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              只需提供一个简单的想法、主题或梗概，Fantasia
              将为您构建完整的世界观、角色和章节大纲。
            </p>

            <div className="mt-auto space-y-4">
              <textarea
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition-all resize-none min-h-[100px]"
                placeholder="例如：一个无法入睡的侦探，在2080年的上海寻找被窃取的梦境..."
                value={quickIdea}
                onChange={(e) => setQuickIdea(e.target.value)}
                disabled={isFullGenerating}
              />

              {/* Chapter and Word Count Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    章节数量
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 transition-all font-mono text-center"
                    value={quickChapterCount}
                    onChange={(e) =>
                      setQuickChapterCount(parseInt(e.target.value) || 8)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    单章字数
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 transition-all font-mono text-center"
                    value={quickWordCount}
                    onChange={(e) =>
                      setQuickWordCount(parseInt(e.target.value) || 1500)
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleFullGenerate}
                disabled={!quickIdea.trim() || isFullGenerating}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-[0.98]"
              >
                {isFullGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2 fill-black" />
                )}
                {isFullGenerating ? "正在构建世界..." : "立即生成"}
              </button>
            </div>
          </div>
        </div>

        {/* Option 2: Manual Setup */}
        <div
          onClick={() => !isFullGenerating && onManualStart()}
          className={`bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-all duration-300 flex flex-col relative overflow-hidden ${
            isFullGenerating
              ? "opacity-40 cursor-not-allowed grayscale pointer-events-none"
              : "hover:shadow-xl hover:border-black/20 cursor-pointer group"
          }`}
        >
          <div className="flex flex-row items-center gap-4 mb-6">
            <div
              className={`w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center transition-colors duration-300 shrink-0 text-primary ${
                !isFullGenerating &&
                "group-hover:bg-black group-hover:text-white"
              }`}
            >
              <PenTool className="w-6 h-6 transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-primary whitespace-nowrap">
              手动构建设定
            </h3>
          </div>
          <p className="text-secondary text-sm mb-8 leading-relaxed">
            作为架构师，亲自掌控每一个细节。从空白画布开始，逐步定义核心概念、塑造角色并规划大纲。
          </p>

          <div className="mt-auto">
            <div
              className={`w-full py-3 rounded-lg border border-gray-200 text-center font-medium text-primary transition-all duration-300 flex items-center justify-center gap-2 ${
                isFullGenerating
                  ? "bg-gray-100 text-gray-400 border-gray-100"
                  : "group-hover:bg-black group-hover:text-white group-hover:border-black"
              }`}
            >
              开始手动设定 <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onConfirm={confirmGeneration}
        cost={GENERATION_COSTS[GenerationType.COMPLETE_SETUP]}
        balance={userCredits}
        title="完整设定生成"
        description="AI 将根据您的想法生成完整的故事设定，包括核心设定、角色和大纲，需要消耗积分。"
      />
    </div>
  );
};
