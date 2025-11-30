import React, { useState } from "react";
import Link from "next/link";
import { useStory } from "./StoryProvider";
import {
  SetupStep,
  Character,
  ChapterOutline,
  GenerationType,
  GENERATION_COSTS,
} from "../lib/types";
import { Button, Input, TextArea, Card } from "./ui/UIComponents";
import { createClient } from "../lib/supabase/client";
import { CreditConfirmationModal } from "./CreditConfirmationModal";
import { deductUserCredits, updateBook } from "../lib/supabase-db";
import {
  generateStoryCore,
  generateCharacterList,
  generateFullOutline,
  generateWritingInstructions,
} from "../services/gemini";
import {
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  Users,
  Map,
  FileText,
  Wand2,
  Sparkles,
  Home,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

const STEPS: { id: SetupStep; label: string; icon: any }[] = [
  { id: "CORE", label: "核心设定", icon: Map },
  { id: "CHARACTERS", label: "角色设定", icon: Users },
  { id: "OUTLINE", label: "故事大纲", icon: BookOpen },
  { id: "INSTRUCTIONS", label: "写作指令", icon: FileText },
];

interface SetupWizardProps {
  onFinish?: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onFinish }) => {
  const {
    bible,
    setBible,
    updateCore,
    updateInstruction,
    userCredits,
    setUserCredits,
    currentProjectId,
  } = useStory();

  const [currentStep, setCurrentStep] = useState<SetupStep>("CORE");
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Credits Modal State
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [pendingStep, setPendingStep] = useState<SetupStep | null>(null);

  // Check if core requirements are met (Title, Theme, Genre)
  const isCoreReady = !!(
    bible.core.title?.trim() &&
    bible.core.theme?.trim() &&
    bible.core.genre?.trim()
  );

  const handleAutoGenerate = () => {
    const cost = GENERATION_COSTS[GenerationType.SINGLE_PAGE_SETUP];
    if (userCredits < cost) {
      alert(`积分不足！需要 ${cost} 积分，当前余额 ${userCredits} 积分`);
      return;
    }

    setPendingStep(currentStep);
    setIsCreditModalOpen(true);
  };

  const confirmGeneration = async () => {
    if (!pendingStep) return;

    const cost = GENERATION_COSTS[GenerationType.SINGLE_PAGE_SETUP];
    const supabase = createClient();
    const success = await deductUserCredits(supabase, cost);
    if (success) {
      setUserCredits((prev) => prev - cost);
      await executeGeneration(pendingStep);
    } else {
      alert("扣除积分失败，请重试");
    }

    setPendingStep(null);
  };

  const executeGeneration = async (step: SetupStep) => {
    setIsGenerating(true);
    try {
      if (step === "CORE") {
        const newCore = await generateStoryCore(bible.core);
        updateCore(newCore);
      } else if (step === "CHARACTERS") {
        const newChars = await generateCharacterList(
          bible.core,
          bible.characters
        );
        setBible((prev) => ({ ...prev, characters: newChars }));
      } else if (step === "OUTLINE") {
        const rawOutline = await generateFullOutline(bible);
        const formattedOutline: ChapterOutline[] = rawOutline.map(
          (c: any, i: number) => ({
            id: crypto.randomUUID(),
            title: c.title,
            summary: c.summary,
            isGenerated: false,
          })
        );
        setBible((prev) => ({ ...prev, outline: formattedOutline }));

        // 立即保存大纲到数据库
        if (currentProjectId) {
          const supabase = createClient();
          await updateBook(supabase, currentProjectId, {
            ...bible,
            outline: formattedOutline,
          });
        }
      } else if (step === "INSTRUCTIONS") {
        const newInstructions = await generateWritingInstructions(bible);
        updateInstruction(newInstructions);
      }
    } catch (e) {
      console.error("Auto-generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const performClear = async () => {
    setIsClearing(true);
    try {
      let clearedBible = { ...bible };

      switch (currentStep) {
        case "CORE":
          const clearedCore = {
            title: "",
            theme: "",
            logline: "",
            genre: "",
            settingTime: "",
            settingPlace: "",
            settingWorld: "",
            styleTone: "",
            targetChapterCount: bible.core.targetChapterCount,
            targetChapterWordCount: bible.core.targetChapterWordCount,
          };
          updateCore(clearedCore);
          clearedBible.core = clearedCore;
          break;
        case "CHARACTERS":
          clearedBible = { ...bible, characters: [] };
          setBible(clearedBible);
          break;
        case "OUTLINE":
          clearedBible = { ...bible, outline: [] };
          setBible(clearedBible);
          break;
        case "INSTRUCTIONS":
          const clearedInstructions = {
            pov: "",
            pacing: "",
            dialogueStyle: "",
            sensoryDetails: "",
            keyElements: "",
            avoid: "",
          };
          updateInstruction(clearedInstructions);
          clearedBible.instructions = clearedInstructions;
          break;
      }

      // Update database if project exists
      if (currentProjectId) {
        const supabase = createClient();
        await updateBook(supabase, currentProjectId, clearedBible);
      }
    } finally {
      setIsClearing(false);
      setShowClearModal(false);
    }
  };

  const addCharacter = () => {
    const newChar: Character = {
      id: crypto.randomUUID(),
      name: "",
      role: "Supporting",
      description: "",
      background: "",
      motivation: "",
      arcOrConflict: "",
    };
    setBible((prev) => ({
      ...prev,
      characters: [...prev.characters, newChar],
    }));
  };

  const removeCharacter = (id: string) => {
    setBible((prev) => ({
      ...prev,
      characters: prev.characters.filter((c) => c.id !== id),
    }));
  };

  const handleEnterWriter = () => {
    const hasProtagonist = bible.characters.some(
      (c) => c.role === "Protagonist"
    );
    const hasOutline = bible.outline.length > 0;
    const errors: string[] = [];

    if (!hasProtagonist) {
      errors.push("• 您的故事缺少“主角”，请在角色设定中添加。");
    }

    if (!hasOutline) {
      errors.push("• 您的故事大纲为空，请生成或添加至少一个章节。");
    }

    if (errors.length > 0) {
      setValidationError(errors.join("\n\n"));
      return;
    }

    // Call the parent callback to switch view
    if (onFinish) {
      onFinish();
    }
  };

  const ClearStepButton = () => (
    <div className="flex justify-end mb-2">
      <button
        onClick={() => setShowClearModal(true)}
        className="flex items-center text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        <RotateCcw className="w-3 h-3 mr-1.5" />
        清空本页
      </button>
    </div>
  );

  const AutoGenButton = ({
    label,
    disabled,
  }: {
    label: string;
    disabled?: boolean;
  }) => {
    const isDisabled = isGenerating || disabled;
    return (
      <button
        onClick={handleAutoGenerate}
        disabled={isDisabled}
        title={disabled ? "请先在核心设定中完成标题、主题和类型" : ""}
        className={`w-full mb-8 relative overflow-hidden group p-4 rounded-lg transition-all active:scale-[0.99] ${
          isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            : "bg-white text-primary border border-primary hover:bg-gray-50"
        }`}
      >
        <div className="relative flex items-center justify-center gap-3">
          {isGenerating ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <Wand2
              className={`w-5 h-5 ${
                isDisabled ? "text-gray-400" : "text-primary"
              }`}
            />
          )}
          <span className="font-serif font-bold tracking-wide">
            {isGenerating ? "AI 正在构思中..." : label}
          </span>
        </div>
      </button>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "CORE":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClearStepButton />

            <AutoGenButton label="一键智能补全核心设定" />

            <div className="space-y-6">
              <Input
                label="故事标题 (必填)"
                value={bible.core.title}
                onChange={(e) => updateCore({ title: e.target.value })}
                className="text-lg font-bold"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="主题"
                  placeholder="例如：记忆与身份、科技与人性"
                  value={bible.core.theme}
                  onChange={(e) => updateCore({ theme: e.target.value })}
                />
                <Input
                  label="类型"
                  placeholder="例如：悬疑推理、赛博朋克"
                  value={bible.core.genre}
                  onChange={(e) => updateCore({ genre: e.target.value })}
                />
              </div>
              <TextArea
                label="一句话梗概"
                placeholder="包含主角、冲突和核心悬念..."
                value={bible.core.logline}
                onChange={(e) => updateCore({ logline: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="时间背景"
                  value={bible.core.settingTime}
                  onChange={(e) => updateCore({ settingTime: e.target.value })}
                />
                <Input
                  label="地点/环境"
                  value={bible.core.settingPlace}
                  onChange={(e) => updateCore({ settingPlace: e.target.value })}
                />
                <Input
                  label="风格基调"
                  value={bible.core.styleTone}
                  onChange={(e) => updateCore({ styleTone: e.target.value })}
                />
              </div>
              <TextArea
                label="世界观 / 关键技术"
                placeholder="描述这个世界的规则、特殊设定或技术..."
                value={bible.core.settingWorld}
                onChange={(e) => updateCore({ settingWorld: e.target.value })}
              />
            </div>
          </div>
        );

      case "CHARACTERS":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClearStepButton />
            <AutoGenButton label="一键智能生成角色表" disabled={!isCoreReady} />
            <div className="space-y-8">
              {bible.characters.map((char, index) => (
                <Card
                  key={char.id}
                  className="relative group"
                  title={`角色 ${index + 1}`}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCharacter(char.id)}
                      icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="姓名"
                      value={char.name}
                      onChange={(e) =>
                        setBible((prev) => ({
                          ...prev,
                          characters: prev.characters.map((c) =>
                            c.id === char.id
                              ? { ...c, name: e.target.value }
                              : c
                          ),
                        }))
                      }
                    />
                    <div className="space-y-1.5 w-full">
                      <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        身份/角色
                      </label>
                      <select
                        className="w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:border-primary"
                        value={char.role}
                        onChange={(e) =>
                          setBible((prev) => ({
                            ...prev,
                            characters: prev.characters.map((c) =>
                              c.id === char.id
                                ? { ...c, role: e.target.value as any }
                                : c
                            ),
                          }))
                        }
                      >
                        <option value="Protagonist">主角</option>
                        <option value="Antagonist">反派</option>
                        <option value="Supporting">配角</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <TextArea
                      label="外貌特征与性格"
                      value={char.description}
                      onChange={(e) =>
                        setBible((prev) => ({
                          ...prev,
                          characters: prev.characters.map((c) =>
                            c.id === char.id
                              ? { ...c, description: e.target.value }
                              : c
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextArea
                      label="背景故事"
                      value={char.background}
                      onChange={(e) =>
                        setBible((prev) => ({
                          ...prev,
                          characters: prev.characters.map((c) =>
                            c.id === char.id
                              ? { ...c, background: e.target.value }
                              : c
                          ),
                        }))
                      }
                    />
                    <TextArea
                      label="核心动机与人物弧光"
                      value={char.arcOrConflict}
                      onChange={(e) =>
                        setBible((prev) => ({
                          ...prev,
                          characters: prev.characters.map((c) =>
                            c.id === char.id
                              ? { ...c, arcOrConflict: e.target.value }
                              : c
                          ),
                        }))
                      }
                    />
                  </div>
                </Card>
              ))}
              <Button
                onClick={addCharacter}
                variant="outline"
                className="w-full py-4 border-dashed"
                icon={<Plus className="w-4 h-4" />}
              >
                手动添加角色
              </Button>
            </div>
          </div>
        );

      case "OUTLINE":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClearStepButton />
            <AutoGenButton label="一键智能生成大纲" disabled={!isCoreReady} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                type="number"
                label="预计章节总数"
                value={bible.core.targetChapterCount || ""}
                onChange={(e) =>
                  updateCore({
                    targetChapterCount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="例如：8"
              />
              <Input
                type="number"
                label="单章目标字数"
                value={bible.core.targetChapterWordCount || ""}
                onChange={(e) =>
                  updateCore({
                    targetChapterWordCount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="例如：1500"
              />
            </div>

            {bible.outline.length === 0 ? (
              <div className="text-center py-12 text-secondary border border-dashed border-border rounded-lg">
                暂无章节。请调整上方设置并点击魔法按钮生成。
              </div>
            ) : (
              <div className="space-y-4">
                {bible.outline.map((chapter, idx) => (
                  <div
                    key={chapter.id}
                    className="flex gap-4 items-start p-4 bg-white border border-border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 shrink-0 select-none">
                          #{idx + 1}
                        </span>
                        <input
                          className="font-medium text-primary w-full bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 text-base"
                          value={chapter.title}
                          placeholder="章节标题"
                          onChange={(e) =>
                            setBible((prev) => ({
                              ...prev,
                              outline: prev.outline.map((c) =>
                                c.id === chapter.id
                                  ? { ...c, title: e.target.value }
                                  : c
                              ),
                            }))
                          }
                        />
                      </div>
                      <textarea
                        className="w-full text-sm text-secondary bg-transparent border-none p-0 resize-none focus:ring-0 min-h-[48px] placeholder-gray-300"
                        value={chapter.summary}
                        placeholder="剧情概要..."
                        onChange={(e) =>
                          setBible((prev) => ({
                            ...prev,
                            outline: prev.outline.map((c) =>
                              c.id === chapter.id
                                ? { ...c, summary: e.target.value }
                                : c
                            ),
                          }))
                        }
                      />
                    </div>
                    <button
                      onClick={() =>
                        setBible((prev) => ({
                          ...prev,
                          outline: prev.outline.filter(
                            (c) => c.id !== chapter.id
                          ),
                        }))
                      }
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-1"
                      title="删除章节"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setBible((prev) => ({
                      ...prev,
                      outline: [
                        ...prev.outline,
                        {
                          id: crypto.randomUUID(),
                          title: "新章节",
                          summary: "",
                          isGenerated: false,
                        },
                      ],
                    }))
                  }
                >
                  手动添加章节
                </Button>
              </div>
            )}
          </div>
        );

      case "INSTRUCTIONS":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClearStepButton />
            <AutoGenButton
              label="一键智能定义写作风格"
              disabled={!isCoreReady}
            />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="叙事视角 (POV)"
                  value={bible.instructions.pov}
                  onChange={(e) => updateInstruction({ pov: e.target.value })}
                />
                <Input
                  label="节奏控制 (Pacing)"
                  value={bible.instructions.pacing}
                  onChange={(e) =>
                    updateInstruction({ pacing: e.target.value })
                  }
                />
              </div>
              <TextArea
                label="对话风格"
                value={bible.instructions.dialogueStyle}
                onChange={(e) =>
                  updateInstruction({ dialogueStyle: e.target.value })
                }
              />
              <TextArea
                label="感官细节侧重"
                value={bible.instructions.sensoryDetails}
                onChange={(e) =>
                  updateInstruction({ sensoryDetails: e.target.value })
                }
              />
              <TextArea
                label="禁止事项 (避免的雷区)"
                value={bible.instructions.avoid}
                onChange={(e) => updateInstruction({ avoid: e.target.value })}
                className="border-red-100 focus:border-red-300"
              />
            </div>
          </div>
        );
    }
  };

  // --- RENDER WIZARD MODE ---
  return (
    <div className="max-w-4xl mx-auto py-10 px-6 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" size="sm" icon={<Home className="w-4 h-4" />}>
            返回项目列表
          </Button>
        </Link>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif italic font-bold mb-2">
          {bible.core.title ? `《${bible.core.title}》` : "新故事项目"}
        </h1>
        <p className="text-secondary text-sm uppercase tracking-widest">
          故事设定集
        </p>
      </div>

      {/* Segmented Control Tab Navigation */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1.5 rounded-full flex w-full max-w-3xl">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-white text-black shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900 hover:text-primary"
                }`}
              >
                <step.icon
                  className={`w-4 h-4 ${isActive ? "" : "opacity-70"}`}
                />
                <span className="tracking-wide hidden sm:inline">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="min-h-[400px] shadow-sm border-gray-100">
        {renderStepContent()}
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          disabled={currentStep === "CORE"}
          onClick={() => {
            const idx = STEPS.findIndex((s) => s.id === currentStep);
            if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
          }}
        >
          上一步
        </Button>

        <div className="flex gap-3">
          {currentStep === "INSTRUCTIONS" ? (
            <Button size="lg" variant="accent" onClick={handleEnterWriter}>
              进入创意工作室
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                const idx = STEPS.findIndex((s) => s.id === currentStep);
                if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              下一步
            </Button>
          )}
        </div>
      </div>

      {/* Validation Modal */}
      {validationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border border-gray-100 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">
                注意
              </h3>
            </div>
            <div className="text-secondary text-sm leading-relaxed whitespace-pre-wrap mb-8 bg-gray-50 p-4 rounded-lg border border-border text-left">
              {validationError}
            </div>
            <Button
              className="w-full py-3"
              onClick={() => setValidationError(null)}
            >
              我明白了
            </Button>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 border border-gray-100 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">
                确认清空本页？
              </h3>
            </div>
            <p className="text-secondary text-sm text-center mb-8 leading-relaxed">
              所有当前步骤填写的数据将被重置。此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white"
                onClick={performClear}
                disabled={isClearing}
              >
                {isClearing ? "正在删除..." : "确认清空"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onConfirm={confirmGeneration}
        cost={GENERATION_COSTS[GenerationType.SINGLE_PAGE_SETUP]}
        balance={userCredits}
        title="AI 智能生成"
        description="AI 将根据当前信息智能生成设定内容，需要消耗积分。"
      />
    </div>
  );
};
