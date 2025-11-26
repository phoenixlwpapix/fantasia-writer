"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Feather,
  BookOpen,
  BrainCog,
  Zap,
  Users,
  PenTool,
  Coffee,
  Star,
  Check,
  Globe,
} from "lucide-react";

// --- Console Simulator Component ---
const ConsoleSimulator: React.FC = () => {
  const [displayedLines, setDisplayedLines] = useState<React.ReactNode[]>([]);
  const [isBlinking, setIsBlinking] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Script definition
  const script = [
    [{ text: "正在初始化引擎...", color: "text-green-400/80", delay: 30 }],
    [
      { text: "> 核心概念: ", color: "text-green-400/80", delay: 20 },
      { text: "赛博朋克 / 黑色电影", color: "text-white", delay: 40 },
    ],
    [
      { text: "> 主角: ", color: "text-green-400/80", delay: 20 },
      { text: "Kael (赏金猎人)", color: "text-white", delay: 40 },
    ],
    [{ text: "> 正在生成大纲...", color: "text-green-400/80", delay: 20 }],
    [{ text: "  [第一章] 霓虹雨夜", color: "text-gray-400", delay: 10 }],
    [{ text: "  [第二章] 协议入侵", color: "text-gray-400", delay: 10 }],
    [{ text: "  [第三章] 机械之魂", color: "text-gray-400", delay: 10 }],
    [{ text: "> 准备就绪。", color: "text-green-400", delay: 50 }],
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let isMounted = true;

    const runScript = async () => {
      setIsBlinking(false);
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      await wait(500);

      for (let lineIndex = 0; lineIndex < script.length; lineIndex++) {
        const lineSegments = script[lineIndex];
        setDisplayedLines((prev) => [
          ...prev,
          <div key={lineIndex} className="flex flex-wrap" />,
        ]);

        for (let segIndex = 0; segIndex < lineSegments.length; segIndex++) {
          const segment = lineSegments[segIndex];
          let currentText = "";

          for (
            let charIndex = 0;
            charIndex < segment.text.length;
            charIndex++
          ) {
            if (!isMounted) return;
            currentText += segment.text[charIndex];
            setDisplayedLines((prev) => {
              const newLines = [...prev];
              const currentElement = newLines[lineIndex] as any;
              const currentLineContent = React.Children.toArray(
                currentElement.props?.children
              );

              if (currentLineContent[segIndex]) {
                currentLineContent[segIndex] = (
                  <span key={segIndex} className={segment.color}>
                    {currentText}
                  </span>
                );
              } else {
                currentLineContent.push(
                  <span key={segIndex} className={segment.color}>
                    {currentText}
                  </span>
                );
              }
              newLines[lineIndex] = (
                <div key={lineIndex} className="flex flex-wrap">
                  {currentLineContent}
                </div>
              );
              return newLines;
            });
            await wait(segment.delay + Math.random() * 20);
          }
        }
        await wait(150);
      }
      if (isMounted) setIsBlinking(true);
    };

    runScript();
    return () => {
      isMounted = false;
    };
  }, [hasStarted]);

  return (
    <div
      ref={containerRef}
      className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-2xl transition-transform duration-500 hover:scale-[1.02] min-h-[320px] flex flex-col font-mono text-xs md:text-sm"
    >
      <div className="flex gap-2 mb-4 border-b border-gray-700 pb-4 shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
      </div>
      <div className="space-y-2 flex-1 overflow-hidden font-medium">
        {displayedLines}
        {hasStarted && (
          <div className="inline-block align-middle">
            <span
              className={`inline-block w-2 h-4 bg-green-400/80 ml-1 align-middle ${
                isBlinking ? "animate-pulse" : "opacity-100"
              }`}
            />
          </div>
        )}
        {!hasStarted && <span className="text-gray-500">Initialize...</span>}
      </div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-primary font-sans selection:bg-black selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm shadow-md">
            <span className="font-serif font-bold italic text-lg">F</span>
          </div>
          <span className="font-serif font-bold italic text-xl tracking-tight">
            Fantasia
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-secondary">
            <a
              href="#features"
              className="hover:text-primary transition-colors"
            >
              功能
            </a>
            <a
              href="#use-cases"
              className="hover:text-primary transition-colors"
            >
              适用人群
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors">
              定价
            </a>
          </div>
          <Link
            href="/login"
            className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 group shadow-lg hover:shadow-xl"
          >
            开始创作
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-gray-100 via-gray-50 to-transparent rounded-full blur-3xl -z-10 opacity-60 pointer-events-none" />

        <div className="flex justify-center mb-8 overflow-hidden">
          <div className="hero-reveal" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold uppercase tracking-widest text-secondary hover:bg-white hover:shadow-sm transition-all cursor-default">
              <span>下一代 AI 叙事引擎</span>
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.1] tracking-tight mb-8">
          <div className="overflow-hidden">
            <div
              className="hero-mask-reveal flex justify-center gap-4"
              style={{ animationDelay: "0.2s" }}
            >
              <span>当想象力</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <div
              className="hero-mask-reveal text-gray-400 italic flex justify-center gap-4"
              style={{ animationDelay: "0.4s" }}
            >
              <span>遇见智能。</span>
            </div>
          </div>
        </h1>

        <div className="overflow-hidden mb-12">
          <p
            className="hero-reveal text-lg md:text-xl text-secondary max-w-2xl mx-auto leading-relaxed"
            style={{ animationDelay: "0.6s" }}
          >
            首个专为结构化文学创作设计的原生 AI 环境。
            <br className="hidden md:block" />
            构建宏大世界，塑造复杂角色，书写直击人心的故事
            <br className="hidden md:block" />
            ——同时保留人类的灵魂。
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-reveal"
          style={{ animationDelay: "0.8s" }}
        >
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex items-center justify-center gap-2"
          >
            <Feather className="w-5 h-5" />
            进入工作室
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-primary border border-gray-200 rounded-lg text-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
            观看演示
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16 px-6 border-y border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
          <div>
            <div className="text-4xl md:text-5xl font-serif font-bold mb-2">
              2.5M+
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              生成字数
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif font-bold mb-2">
              12k+
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              诞生角色
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif font-bold mb-2">
              98%
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              上下文一致性
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif font-bold mb-2">
              24/7
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">
              灵感在线
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-primary">
              为艺术而生的架构
            </h2>
            <p className="text-secondary max-w-2xl mx-auto text-lg">
              Fantasia
              不仅仅是一个写作机器人。它是模拟专业小说家认知过程的结构化工作流，让创意井然有序。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                <BrainCog className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">
                深度世界构建
              </h3>
              <p className="text-secondary text-sm leading-relaxed mb-6">
                定义世界的物理法则、文化与历史。AI
                会像一位严谨的档案管理员，记住你设定的每一条规则，确保故事逻辑自洽。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs text-secondary">
                  <Check className="w-3 h-3 mr-2 text-green-500" /> 设定集管理
                </li>
                <li className="flex items-center text-xs text-secondary">
                  <Check className="w-3 h-3 mr-2 text-green-500" />{" "}
                  规则一致性检查
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">迭代式大纲</h3>
              <p className="text-secondary text-sm leading-relaxed mb-6">
                拒绝盲目写作。规划节奏、弧光与转折。在写下正文之前，先生成并微调完整的章节大纲，像导演一样掌控全局。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs text-secondary">
                  <Check className="w-3 h-3 mr-2 text-green-500" /> 剧情节点规划
                </li>
                <li className="flex items-center text-xs text-secondary">
                  <Check className="w-3 h-3 mr-2 text-green-500" /> 伏笔自动追踪
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">
                全境感知写作
              </h3>
              <p className="text-secondary text-sm leading-relaxed mb-6">
                AI
                会阅读你之前的内容。它追踪物品栏、角色位置与情感状态，生成流畅连贯的散文，告别“AI
                健忘症”。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs text-secondary">
                  <Check className="w-3 h-3 mr-2 text-green-500" />{" "}
                  智能上下文记忆
                </li>
                <li className="flex items-center text-xs text-secondary">
                  <Check className="w-3 h-3 mr-2 text-green-500" /> 风格模仿引擎
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-black text-white rounded-3xl p-8 md:p-16 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase block mb-6">
                工作流
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-medium mb-6 leading-tight">
                从“如果”
                <br />
                到“终章”。
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                无论是克服写作瓶颈，还是构建庞大的奇幻史诗，Fantasia
                的三步走工作流都能让你的创作过程如丝般顺滑。
              </p>
              <ul className="space-y-8">
                <li className="flex gap-4 items-start group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-mono group-hover:bg-white group-hover:text-black transition-colors">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-white mb-1">构想 (Ideate)</h4>
                    <p className="text-sm text-gray-400">
                      输入零碎的灵感，AI 帮你扩展成完整的世界观和设定集。
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 items-start group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-mono group-hover:bg-white group-hover:text-black transition-colors">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-white mb-1">
                      规划 (Outline)
                    </h4>
                    <p className="text-sm text-gray-400">
                      生成分章大纲，调整节奏，确保故事线索清晰。
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 items-start group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-mono group-hover:bg-white group-hover:text-black transition-colors">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-white mb-1">撰写 (Draft)</h4>
                    <p className="text-sm text-gray-400">
                      逐章生成正文，利用 AI 记忆库保持细节连贯，随时重写。
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20"></div>
              <ConsoleSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              不仅是小说
            </h2>
            <p className="text-secondary">
              Fantasia 的结构化引擎适用于多种叙事场景。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-surface rounded-xl border border-border hover:border-black transition-colors group">
              <PenTool className="w-8 h-8 mb-4 text-secondary group-hover:text-black transition-colors" />
              <h4 className="font-bold mb-2">网络小说作者</h4>
              <p className="text-xs text-secondary leading-relaxed">
                保持日更的秘密武器。快速生成章节草稿，告别卡文。
              </p>
            </div>
            <div className="p-6 bg-surface rounded-xl border border-border hover:border-black transition-colors group">
              <Globe className="w-8 h-8 mb-4 text-secondary group-hover:text-black transition-colors" />
              <h4 className="font-bold mb-2">TRPG 跑团主持</h4>
              <p className="text-xs text-secondary leading-relaxed">
                瞬间生成复杂的 NPC 背景、城镇历史和任务线索。
              </p>
            </div>
            <div className="p-6 bg-surface rounded-xl border border-border hover:border-black transition-colors group">
              <Users className="w-8 h-8 mb-4 text-secondary group-hover:text-black transition-colors" />
              <h4 className="font-bold mb-2">游戏编剧</h4>
              <p className="text-xs text-secondary leading-relaxed">
                为游戏世界填充海量的 lore、物品描述和支线剧情。
              </p>
            </div>
            <div className="p-6 bg-surface rounded-xl border border-border hover:border-black transition-colors group">
              <Coffee className="w-8 h-8 mb-4 text-secondary group-hover:text-black transition-colors" />
              <h4 className="font-bold mb-2">业余爱好者</h4>
              <p className="text-xs text-secondary leading-relaxed">
                即使没有专业背景，也能将脑海中的梦境转化为文字。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">
            创作者的声音
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-border/50">
              <div className="flex text-yellow-400 mb-4 gap-1">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="font-serif italic text-lg mb-6 text-primary">
                "Fantasia
                解决了困扰我多年的'中间段落塌陷'问题。它的设定集功能让我的角色即使在第50章依然性格鲜明。"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  L
                </div>
                <div>
                  <div className="font-bold text-sm">Lin Chang</div>
                  <div className="text-xs text-secondary">悬疑小说作家</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-border/50">
              <div className="flex text-yellow-400 mb-4 gap-1">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="font-serif italic text-lg mb-6 text-primary">
                "作为一个独立游戏开发者，我用它在一个周末内完成了整个游戏的背景故事和物品描述。效率提升了十倍。"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  S
                </div>
                <div>
                  <div className="font-bold text-sm">Sarah Chen</div>
                  <div className="text-xs text-secondary">Indie Game Dev</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-border/50">
              <div className="flex text-yellow-400 mb-4 gap-1">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="font-serif italic text-lg mb-6 text-primary">
                "它不是在替你写，而是在陪你写。那种能够随时查看世界观并获得连贯建议的感觉太棒了。"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  M
                </div>
                <div>
                  <div className="font-bold text-sm">Mike Wang</div>
                  <div className="text-xs text-secondary">科幻专栏作者</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            准备好开始了吗？
          </h2>
          <p className="text-xl text-secondary mb-10 leading-relaxed">
            你的世界正在等待被发现。无需付费，无需复杂的设置，
            <br className="hidden md:block" />
            只要一个想法，我们帮你把它变成故事。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="px-10 py-4 bg-black text-white rounded-full text-lg font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center"
            >
              免费开始创作
            </Link>
            <button className="px-10 py-4 bg-white text-primary border border-gray-200 rounded-full text-lg font-bold hover:bg-gray-50 transition-all">
              查看定价方案
            </button>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="bg-gray-50 py-16 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-sm">
                <span className="font-serif font-bold italic text-xs">F</span>
              </div>
              <span className="font-serif font-bold italic text-lg">
                Fantasia
              </span>
            </div>
            <p className="text-xs text-secondary">
              Powered by Google Gemini 3.0
            </p>
          </div>

          <div className="flex gap-8 text-sm text-secondary font-medium">
            <a href="#" className="hover:text-primary transition-colors">
              关于我们
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              博客
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              隐私政策
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              服务条款
            </a>
          </div>

          <div className="text-xs text-gray-400">© 2025 Fantasia Inc.</div>
        </div>
      </footer>

      <style>{`
        @keyframes mask-reveal-up {
          0% { transform: translateY(110%) skewY(5deg); opacity: 0; filter: blur(8px); }
          100% { transform: translateY(0) skewY(0); opacity: 1; filter: blur(0); }
        }
        
        @keyframes soft-blur-in {
          0% { opacity: 0; filter: blur(12px); transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }

        .hero-mask-reveal {
          animation: mask-reveal-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform-origin: bottom left;
        }

        .hero-reveal {
          animation: soft-blur-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
