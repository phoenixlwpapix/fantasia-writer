import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useStory } from "./StoryProvider";
import {
  generateChapterStream,
  analyzeChapterContext,
} from "../services/gemini";
import { Button, Badge, TextArea } from "./ui'/UIComponents";
import {
  saveChapter,
  getUserCredits,
  deductUserCredits,
} from "../lib/supabase-db";
import { CreditConfirmationModal } from "./CreditConfirmationModal";
import {
  ArrowLeft,
  ArrowRight,
  Wand2,
  Book,
  Layers,
  Download,
  Loader2,
  BrainCog,
  MapPin,
  Package,
  History,
  Lock,
  Menu,
  X,
  RotateCcw,
} from "lucide-react";
import { StoryChapter, GenerationType, GENERATION_COSTS } from "../lib/types";
import { GenerateContentResponse } from "@google/genai";

interface WritingInterfaceProps {
  onEditSetup?: () => void;
}

export const WritingInterface: React.FC<WritingInterfaceProps> = ({
  onEditSetup,
}) => {
  const {
    bible,
    chapters,
    setChapters,
    userCredits,
    setUserCredits,
    currentProjectId,
  } = useStory();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rewrite Modal State
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [rewriteInstructions, setRewriteInstructions] = useState("");

  // Credits Modal State
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [pendingGenerationType, setPendingGenerationType] =
    useState<GenerationType | null>(null);
  const [pendingCustomInstructions, setPendingCustomInstructions] = useState<
    string | undefined
  >(undefined);

  // Ref to track the current selected chapter ID for async operations
  const selectedChapterIdRef = useRef<string | null>(null);

  // Initialize selection
  useEffect(() => {
    if (bible.outline.length > 0 && !selectedChapterId) {
      setSelectedChapterId(bible.outline[0].id);
    }
  }, [bible.outline, selectedChapterId]);

  // Sync Ref with State
  useEffect(() => {
    selectedChapterIdRef.current = selectedChapterId;
  }, [selectedChapterId]);

  const executeGeneration = async (customInstructions?: string) => {
    if (!selectedChapterId) return;

    if (!bible.id) {
      console.error(
        "Cannot generate chapter: bible.id is undefined. Project may not be loaded properly."
      );
      alert("项目加载失败，请刷新页面重试。");
      return;
    }

    const chapterOutline = bible.outline.find(
      (c) => c.id === selectedChapterId
    );
    if (!chapterOutline) return;

    const currentGeneratingId = selectedChapterId;
    setGeneratingId(currentGeneratingId);

    try {
      // Filter generated chapters that come BEFORE the current one in the outline order
      const outlineIds = bible.outline.map((o) => o.id);
      const currentIdx = outlineIds.indexOf(currentGeneratingId);
      const previousChapters = chapters
        .filter((c) => {
          const cIdx = outlineIds.indexOf(c.outlineId);
          return cIdx !== -1 && cIdx < currentIdx;
        })
        .sort((a, b) => {
          const idxA = outlineIds.indexOf(a.outlineId);
          const idxB = outlineIds.indexOf(b.outlineId);
          return idxA - idxB;
        });

      // Initialize placeholder chapter content in state
      // If rewriting, we might want to keep the old content until the new stream starts,
      // or clear it. Here we clear it to show fresh stream.
      const exists = chapters.find((c) => c.outlineId === currentGeneratingId);
      const initialChapter: StoryChapter = {
        id: exists ? exists.id : crypto.randomUUID(),
        title: chapterOutline.title,
        content: "", // Start empty for new stream
        wordCount: 0,
        outlineId: currentGeneratingId,
        metadata: undefined, // Clear old metadata as we will re-analyze
      };

      let currentChapter = initialChapter;

      setChapters((prev) => {
        if (exists) {
          return prev.map((c) =>
            c.outlineId === currentGeneratingId ? initialChapter : c
          );
        }
        return [...prev, initialChapter];
      });

      // 1. Generate Content Stream (Pass rewrite instructions if any)
      const streamResponse = await generateChapterStream(
        bible,
        currentGeneratingId,
        previousChapters,
        customInstructions
      );

      let fullContent = "";

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || "";
        fullContent += text;

        currentChapter = {
          ...currentChapter,
          content: fullContent,
          wordCount: fullContent.replace(/\s/g, "").length,
        };

        // Update state incrementally
        setChapters((prev) =>
          prev.map((ch) => {
            if (ch.outlineId === currentGeneratingId) {
              return currentChapter;
            }
            return ch;
          })
        );

        // Auto scroll to bottom of content area ONLY if we are still viewing the chapter being generated
        if (
          scrollRef.current &&
          selectedChapterIdRef.current === currentGeneratingId
        ) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }

      setGeneratingId(null);
      setAnalyzingId(currentGeneratingId);

      // 2. Analyze Context (Post-processing)
      // This ensures context is updated after rewrite
      const metadata = await analyzeChapterContext(
        fullContent,
        chapterOutline.title
      );

      currentChapter = {
        ...currentChapter,
        metadata,
      };

      // Update state with metadata
      setChapters((prev) =>
        prev.map((c) =>
          c.outlineId === currentGeneratingId ? currentChapter : c
        )
      );

      // Auto-save chapter and memory to database
      const finalChapter = currentChapter;

      if (bible.id) {
        const savedId = await saveChapter(finalChapter, bible.id);
        if (savedId) {
          currentChapter = { ...currentChapter, id: savedId };
          // Update the chapter id in state to match database
          setChapters((prev) =>
            prev.map((c) =>
              c.outlineId === currentGeneratingId ? currentChapter : c
            )
          );
        }
      }
    } catch (e) {
      console.error("Failed to generate", e);
      setGeneratingId(null);
    } finally {
      setAnalyzingId(null);
    }
  };

  const confirmRewrite = () => {
    setIsRewriteModalOpen(false);
    handleGenerate(GenerationType.CHAPTER_NORMAL, rewriteInstructions);
    setRewriteInstructions("");
  };

  const handleGenerate = (
    generationType: GenerationType,
    customInstructions?: string
  ) => {
    const cost = GENERATION_COSTS[generationType];
    if (userCredits < cost) {
      // Handle insufficient credits - could show an error message
      alert(`积分不足！需要 ${cost} 积分，当前余额 ${userCredits} 积分`);
      return;
    }

    setPendingGenerationType(generationType);
    setPendingCustomInstructions(customInstructions);
    setIsCreditModalOpen(true);
  };

  const confirmGeneration = async () => {
    if (!pendingGenerationType) return;

    const cost = GENERATION_COSTS[pendingGenerationType];
    const success = await deductUserCredits(cost);
    if (success) {
      setUserCredits((prev) => prev - cost);
      await executeGeneration(pendingCustomInstructions);
    } else {
      alert("扣除积分失败，请重试");
    }

    setPendingGenerationType(null);
    setPendingCustomInstructions(undefined);
  };

  const currentChapter = chapters.find(
    (c) => c.outlineId === selectedChapterId
  );
  const currentOutline = bible.outline.find((c) => c.id === selectedChapterId);

  // Navigation Logic
  const currentIndex = bible.outline.findIndex(
    (c) => c.id === selectedChapterId
  );
  const prevChapterOutline =
    currentIndex > 0 ? bible.outline[currentIndex - 1] : null;
  const nextChapterOutline =
    currentIndex > -1 && currentIndex < bible.outline.length - 1
      ? bible.outline[currentIndex + 1]
      : null;

  // Calculate total word count accurately from content
  const totalWordCount = chapters.reduce((acc, c) => {
    const count = c.content ? c.content.replace(/\s/g, "").length : c.wordCount;
    return acc + count;
  }, 0);

  // Logic to determine if generation should be allowed based on sequence
  const canGenerate = () => {
    if (!selectedChapterId) return false;

    // Find index of current selected chapter in outline
    const outlineIndex = bible.outline.findIndex(
      (o) => o.id === selectedChapterId
    );
    if (outlineIndex === -1) return false;

    // If it's the first chapter, always allow
    if (outlineIndex === 0) return true;

    // If previous chapter exists in 'chapters' array AND has metadata (analysis done), allow
    const prevChapterId = bible.outline[outlineIndex - 1].id;
    const prevChapter = chapters.find((c) => c.outlineId === prevChapterId);

    return !!(prevChapter && prevChapter.metadata);
  };

  // Strict logic: If previous chapter is missing or incomplete, generation is disabled
  const isGenerateDisabled = !canGenerate();

  // Check if any generation task is in progress (global lock)
  const isGlobalGenerating = generatingId !== null;

  const exportStory = () => {
    const fullText = chapters
      .sort((a, b) => {
        const idxA = bible.outline.findIndex((o) => o.id === a.outlineId);
        const idxB = bible.outline.findIndex((o) => o.id === b.outlineId);
        return idxA - idxB;
      })
      .map((c) => `# ${c.title}\n\n${c.content}`)
      .join("\n\n---\n\n");

    const blob = new Blob([fullText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      bible.core.title?.replace(/\s+/g, "_") ||
      bible.core.theme.replace(/\s+/g, "_") ||
      "story"
    }.md`;
    a.click();
  };

  const genres = (bible.core.genre || "小说")
    .split(/[,，/、]/)
    .map((g) => g.trim())
    .filter(Boolean);

  const handleChapterSelect = (id: string) => {
    setSelectedChapterId(id);
    setIsSidebarOpen(false);
    // Scroll to top when switching chapters
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border flex flex-col transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-5 border-b border-border relative">
          <button
            className="absolute top-4 right-4 md:hidden text-secondary hover:text-primary p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between mb-4 text-secondary">
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
              onClick={onEditSetup}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">
                设定集
              </span>
            </div>

            <Link href="/projects" title="返回项目列表">
              <Layers className="w-4 h-4 hover:text-primary cursor-pointer" />
            </Link>
          </div>

          {/* Story Card */}
          <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
            <h1 className="text-lg font-serif font-bold mb-3 text-primary leading-tight break-words">
              《{bible.core.title || "未命名故事"}》
            </h1>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {genres.length > 0 ? (
                genres.slice(0, 3).map((g, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 bg-gray-50 border-gray-200 text-gray-600"
                  >
                    {g}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  未分类
                </Badge>
              )}
            </div>
            <div className="text-xs text-secondary border-t border-dashed border-border pt-3 font-mono flex items-center justify-between">
              <span>当前字数</span>
              <span className="font-bold text-primary">
                {totalWordCount.toLocaleString()} 字
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 px-2">
              大纲
            </h3>
            <div className="space-y-1">
              {bible.outline.map((item, idx) => {
                const hasContent = chapters.some(
                  (c) => c.outlineId === item.id
                );
                const isGenerating = generatingId === item.id;
                const isAnalyzing = analyzingId === item.id;

                // Determine lock status
                let isLocked = false;
                if (idx > 0) {
                  const prevId = bible.outline[idx - 1].id;
                  const prevChapter = chapters.find(
                    (c) => c.outlineId === prevId
                  );
                  // Locked if previous chapter doesn't exist OR previous chapter analysis (metadata) is not done
                  if (!prevChapter || !prevChapter.metadata) isLocked = true;
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleChapterSelect(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-all flex items-center justify-between group ${
                      selectedChapterId === item.id
                        ? "bg-black text-white shadow-md"
                        : "text-secondary hover:bg-gray-100 hover:text-primary"
                    }`}
                  >
                    <div className="flex-1 pr-2 flex items-center min-w-0">
                      <span className="mr-2 opacity-50 font-mono text-xs shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="break-words whitespace-normal">
                        {item.title}
                      </span>
                    </div>

                    {isGenerating ? (
                      <Loader2
                        className={`w-3.5 h-3.5 animate-spin flex-shrink-0 ${
                          selectedChapterId === item.id
                            ? "text-white"
                            : "text-primary"
                        }`}
                      />
                    ) : isAnalyzing ? (
                      <BrainCog
                        className={`w-3.5 h-3.5 animate-pulse flex-shrink-0 ${
                          selectedChapterId === item.id
                            ? "text-white"
                            : "text-purple-500"
                        }`}
                      />
                    ) : hasContent ? (
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          selectedChapterId === item.id
                            ? "bg-white"
                            : "bg-green-500"
                        }`}
                      />
                    ) : isLocked && selectedChapterId !== item.id ? (
                      <Lock className="w-3 h-3 opacity-30" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 px-2">
              主要角色
            </h3>
            <div className="px-3 text-sm space-y-3 text-secondary">
              {bible.characters.slice(0, 5).map((c) => (
                <div key={c.id} className="flex justify-between items-center">
                  <span className="font-medium text-primary/80 truncate max-w-[140px]">
                    {c.name}
                  </span>
                  <span className="text-xs opacity-50 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                    {c.role === "Protagonist"
                      ? "主角"
                      : c.role === "Antagonist"
                      ? "反派"
                      : "配角"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-gray-50">
          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-white hover:bg-gray-50 border-border"
            onClick={exportStory}
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            导出 Markdown
          </Button>
        </div>
      </aside>

      {/* Main Writing Area */}
      <main className="flex-1 flex flex-col relative bg-[#FAFAFA] w-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 md:h-16 border-b border-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-1 -ml-1 text-secondary hover:text-primary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-primary text-base md:text-lg truncate">
              {currentOutline?.title || "请选择章节"}
            </h2>
          </div>
          <div className="flex gap-2 items-center shrink-0 ml-2">
            {analyzingId === selectedChapterId && (
              <div className="flex items-center text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 animate-pulse">
                <BrainCog className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs font-bold tracking-wide">
                  记忆存儲中...
                </span>
              </div>
            )}
            <div className="flex flex-col items-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (currentChapter) {
                    setIsRewriteModalOpen(true);
                  } else {
                    handleGenerate(GenerationType.CHAPTER_NORMAL);
                  }
                }}
                isLoading={generatingId === selectedChapterId}
                disabled={
                  analyzingId === selectedChapterId ||
                  isGenerateDisabled ||
                  isGlobalGenerating
                }
                icon={
                  isGenerateDisabled ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : currentChapter ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )
                }
                className={
                  isGenerateDisabled ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                {generatingId === selectedChapterId
                  ? "生成中..."
                  : currentChapter
                  ? "重写"
                  : "生成正文"}
              </Button>
            </div>
          </div>
        </header>

        {/* Editor Canvas */}
        <div
          className="flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-12"
          ref={scrollRef}
        >
          <div className="max-w-3xl mx-auto bg-white shadow-sm border border-border min-h-[60vh] md:min-h-[800px] p-6 md:p-16 relative">
            {currentOutline ? (
              <>
                <div className="mb-6 md:mb-10 pb-6 md:pb-8 border-b border-border">
                  <h1 className="text-2xl md:text-4xl font-serif font-bold mb-4 md:mb-6 text-primary leading-tight">
                    {currentOutline.title}
                  </h1>
                  <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-border/60">
                    <h4 className="text-xs font-bold uppercase text-secondary mb-2 tracking-wider">
                      本章大纲预设
                    </h4>
                    <p className="text-sm text-secondary leading-relaxed font-serif italic">
                      {currentOutline.summary}
                    </p>
                  </div>
                </div>

                {/* Content Area */}
                {currentChapter ? (
                  <article className="prose prose-neutral prose-base md:prose-lg max-w-none font-serif leading-loose text-gray-800">
                    {/* Use standard markdown display, or map over content for streaming visualization */}
                    <ReactMarkdown>{currentChapter.content}</ReactMarkdown>

                    {/* Blinking cursor effect during generation */}
                    {generatingId === selectedChapterId && (
                      <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse align-middle" />
                    )}
                  </article>
                ) : generatingId === selectedChapterId ? (
                  // Initial loading state before first chunk
                  <div className="space-y-6 animate-pulse max-w-2xl">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-secondary opacity-50">
                    {isGenerateDisabled ? (
                      <>
                        <Lock className="w-12 h-12 md:w-16 md:h-16 mb-4 stroke-1 text-gray-300" />
                        <p className="text-lg font-serif">章节已锁定</p>
                        <p className="text-sm mt-2">
                          请等待上一章生成及分析完成
                        </p>
                      </>
                    ) : (
                      <>
                        <Book className="w-12 h-12 md:w-16 md:h-16 mb-4 stroke-1" />
                        <p className="text-lg font-serif">本章暂无内容</p>
                        <p className="text-sm mt-2">
                          点击上方“生成正文”开始创作
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Chapter Navigation Footer */}
                {(prevChapterOutline || nextChapterOutline) && (
                  <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row justify-between gap-4 animate-in fade-in duration-700">
                    {prevChapterOutline ? (
                      <button
                        onClick={() =>
                          handleChapterSelect(prevChapterOutline.id)
                        }
                        className="group flex items-center text-left gap-4 p-2 -ml-2 rounded-lg hover:bg-gray-50/80 transition-all w-full sm:w-auto"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-black/20 text-secondary group-hover:text-primary transition-colors shadow-sm">
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-0.5">
                            上一章
                          </div>
                          <div className="text-sm font-serif font-medium text-primary group-hover:underline decoration-1 underline-offset-4 line-clamp-1">
                            {prevChapterOutline.title}
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div />
                    )}

                    {nextChapterOutline ? (
                      <button
                        onClick={() =>
                          handleChapterSelect(nextChapterOutline.id)
                        }
                        className="group flex items-center text-right gap-4 p-2 -mr-2 rounded-lg hover:bg-gray-50/80 transition-all w-full sm:w-auto flex-row-reverse sm:flex-row"
                      >
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-0.5">
                            下一章
                          </div>
                          <div className="text-sm font-serif font-medium text-primary group-hover:underline decoration-1 underline-offset-4 line-clamp-1">
                            {nextChapterOutline.title}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-gray-800 transition-colors shadow-md group-hover:shadow-lg">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-secondary opacity-60">
                <Layers className="w-16 h-16 mb-4 stroke-1" />
                <p>请选择一个章节</p>
              </div>
            )}
          </div>
          <div className="h-12 md:h-24"></div> {/* Spacer */}
        </div>
      </main>

      {/* Context Panel (Right) - Hidden on mobile/tablet, visible on XL screens */}
      <aside className="w-80 bg-white border-l border-border hidden xl:flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-6 border-b border-border bg-gray-50/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
            <BrainCog className="w-4 h-4" />
            AI 记忆库
          </h3>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {currentChapter?.metadata ? (
            <>
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <label className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  <History className="w-3.5 h-3.5" />
                  本章记忆摘要
                </label>
                <p className="text-sm text-secondary leading-relaxed bg-gray-50 p-4 rounded-lg border border-border shadow-sm">
                  {currentChapter.metadata.summary}
                </p>
              </div>

              <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                <label className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5" />
                  结束位置
                </label>
                <div className="text-sm text-primary font-medium px-3 py-2 rounded bg-blue-50 border border-blue-100 text-blue-800">
                  {currentChapter.metadata.location}
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                <label className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  <Package className="w-3.5 h-3.5" />
                  关键物品/状态变动
                </label>
                {currentChapter.metadata.items.length > 0 ? (
                  <ul className="space-y-2">
                    {currentChapter.metadata.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs px-3 py-2 bg-white border border-border rounded shadow-sm text-secondary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    本章无关键物品变动
                  </p>
                )}
              </div>

              <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                <label className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  关键事件点
                </label>
                <ul className="list-disc list-inside space-y-1 text-xs text-secondary">
                  {currentChapter.metadata.keyEvents.map((ev, i) => (
                    <li key={i} className="leading-relaxed">
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-10 opacity-50">
              <BrainCog className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-secondary">
                {analyzingId === selectedChapterId
                  ? "AI 正在分析本章内容..."
                  : "生成章节后，AI 将自动提取关键记忆点以保持故事连贯性。"}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-border border-dashed">
            <label className="text-xs font-bold text-primary block mb-2 uppercase tracking-wide">
              当前写作进度
            </label>
            <div className="p-4 bg-primary text-white rounded-lg text-xs shadow-md">
              <div className="flex justify-between mb-1">
                <span>Chapter</span>
                <span className="font-mono">
                  {bible.outline.findIndex((c) => c.id === selectedChapterId) +
                    1}{" "}
                  / {bible.outline.length}
                </span>
              </div>
              <div className="w-full bg-gray-700 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{
                    width: `${
                      ((bible.outline.findIndex(
                        (c) => c.id === selectedChapterId
                      ) +
                        1) /
                        bible.outline.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Rewrite Modal */}
      {isRewriteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                重写章节
              </h3>
              <button
                onClick={() => setIsRewriteModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-secondary text-sm mb-4">
              您可以输入具体的修改意见，AI
              将在保持剧情连贯性的同时尝试调整。留空则直接重新生成。
            </p>
            <TextArea
              placeholder="例如：增加更多关于雨夜的环境描写；让主角的语气更冷漠一些..."
              className="min-h-[120px] mb-6 text-sm"
              value={rewriteInstructions}
              onChange={(e) => setRewriteInstructions(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsRewriteModalOpen(false)}
              >
                取消
              </Button>
              <Button variant="primary" onClick={confirmRewrite}>
                开始重写
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Confirmation Modal */}
      {pendingGenerationType && (
        <CreditConfirmationModal
          isOpen={isCreditModalOpen}
          onClose={() => setIsCreditModalOpen(false)}
          onConfirm={confirmGeneration}
          cost={GENERATION_COSTS[pendingGenerationType]}
          balance={userCredits}
          title={
            pendingGenerationType === GenerationType.CHAPTER_NORMAL
              ? "生成章节正文"
              : "重写章节"
          }
          description={
            pendingGenerationType === GenerationType.CHAPTER_NORMAL
              ? "AI 将根据大纲生成章节内容，需要消耗积分。"
              : "AI 将根据您的修改意见重写章节内容，需要消耗积分。"
          }
        />
      )}
    </div>
  );
};
