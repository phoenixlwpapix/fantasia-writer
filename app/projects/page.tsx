"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStory } from "../../components/StoryProvider";
import { Button, Badge } from "../../components/ui/UIComponents";
import { createClient } from "@/lib/supabase/client";
import Loading from "../loading";
import {
  Plus,
  Trash2,
  AlertCircle,
  Search,
  X,
  User,
  LogOut,
  Coins,
  Settings,
  Filter,
  Shield,
} from "lucide-react";

// Updated with more distinct, high-end colors
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

const ProgressRing = ({
  progress = 0,
  size = 18,
  stroke = 2.5,
}: {
  progress?: number;
  size?: number;
  stroke?: number;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset =
    circumference -
    (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`完成度: ${progress}%`}
    >
      {/* Background Circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          stroke="#E5E5E5"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
};

export default function ProjectDashboard() {
  const router = useRouter();
  const {
    projects,
    loadingProjects,
    createProject,
    deleteProject,
    updateProjectMetadata,
    closeProject,
    userCredits,
    isAdmin,
    user,
  } = useStory();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // Clear current project state when entering dashboard to prevent overwrites
  useEffect(() => {
    closeProject();
  }, []);

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredProjects = projects.filter((project) => {
    // Text Search Logic
    const query = searchQuery.toLowerCase();
    const textMatch =
      !searchQuery ||
      project.title?.toLowerCase().includes(query) ||
      project.theme?.toLowerCase().includes(query) ||
      project.summary?.toLowerCase().includes(query);

    // Color Filter Logic
    const colorMatch = !filterColor || project.spineColor === filterColor;

    return textMatch && colorMatch;
  });

  return (
    <div
      className="min-h-screen bg-surface"
      onClick={() => {
        setIsUserMenuOpen(false);
        setOpenSettingsId(null);
      }}
    >
      {/* Navbar */}
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

        {/* Center: Search & Filter */}
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
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
                  setFilterColor(filterColor === c.value ? null : c.value)
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

        {/* Right: User Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setOpenSettingsId(null);
            }}
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
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{userCredits}</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-6 md:px-8">
        {/* Mobile Filter Bar (Visible only on small screens) */}
        <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider mr-1">
            筛选:
          </span>
          {SPINE_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() =>
                setFilterColor(filterColor === c.value ? null : c.value)
              }
              className={`w-6 h-6 shrink-0 rounded-full bg-gradient-to-br ${
                c.value
              } transition-all ${
                filterColor === c.value ? `ring-2 ring-offset-1 ${c.ring}` : ""
              }`}
            />
          ))}
          {filterColor && (
            <button
              onClick={() => setFilterColor(null)}
              className="px-2 py-1 bg-gray-100 text-xs rounded-full text-secondary"
            >
              清除
            </button>
          )}
        </div>

        {/* Loading State */}
        {loadingProjects && <Loading />}

        {!loadingProjects && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-10">
            {/* Create New Project - Book Cover Style (Only visible when not searching/filtering) */}
            {!searchQuery && !filterColor && (
              <button
                onClick={createProject}
                className="group relative aspect-[2/3] bg-white border-2 border-dashed border-gray-300 rounded-r-lg rounded-l-[2px] flex flex-col items-center justify-center hover:border-primary hover:bg-gray-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-serif text-xl font-bold text-primary">
                  新建书籍
                </span>
                <span className="text-[10px] text-secondary mt-2 uppercase tracking-widest">
                  Start a new story
                </span>
              </button>
            )}

            {/* Project List - Book Covers */}
            {filteredProjects.map((project) => {
              // Genre is often stored in summary, split if multiple tags
              const genres = (project.summary || "未分类")
                .split(/[,，/、]/)
                .map((g) => g.trim())
                .filter(Boolean);
              const mainGenre = genres[0] || "NOVEL";
              const spineClass =
                project.spineColor || "from-gray-800 to-gray-700";

              return (
                <div
                  key={project.id}
                  className="group relative aspect-[2/3] bg-[#fdfbf7] rounded-r-lg rounded-l-[2px] shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col select-none animate-in fade-in duration-500"
                >
                  {/* The entire card is a Link for best performance/SEO */}
                  <Link
                    href={`/projects/${project.id}`}
                    className="absolute inset-0 z-20"
                  />

                  {/* Spine Effect (Left Border) */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r ${spineClass} z-10 rounded-l-[2px]`}
                  ></div>
                  <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-black/10 z-10"></div>

                  {/* Subtle Paper Texture Gradient */}
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.02)_12px,rgba(0,0,0,0)_15px,rgba(0,0,0,0)_100%)] pointer-events-none" />

                  {/* Actions (Delete & Settings) */}
                  <div
                    className={`absolute top-3 right-3 z-30 flex items-center gap-1.5 transition-opacity duration-200 ${
                      openSettingsId === project.id
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {/* Settings Button */}
                    <div
                      className={`p-2 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors ${
                        openSettingsId === project.id
                          ? "bg-gray-100 text-black ring-1 ring-black"
                          : "bg-white/90 text-gray-400 hover:bg-gray-100 hover:text-black"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSettingsId(
                          openSettingsId === project.id ? null : project.id
                        );
                        setIsUserMenuOpen(false);
                      }}
                      title="设置封面"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </div>

                    {/* Delete Button */}
                    <div
                      className="p-2 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full shadow-sm backdrop-blur-sm cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project.id);
                        setOpenSettingsId(null);
                      }}
                      title="删除项目"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Color Picker Popover */}
                  {openSettingsId === project.id && (
                    <div
                      className="absolute top-12 right-2 z-50 bg-white/95 backdrop-blur-md shadow-xl p-2.5 rounded-xl border border-gray-100 flex gap-2 animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {SPINE_COLORS.map((c) => (
                        <button
                          key={c.name}
                          title={c.name}
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                            c.value
                          } shadow-sm transition-all hover:scale-110 focus:outline-none ring-2 ring-offset-1 ${
                            project.spineColor === c.value
                              ? "ring-black scale-110"
                              : "ring-transparent hover:ring-gray-200"
                          }`}
                          onClick={() => {
                            updateProjectMetadata(project.id, {
                              spineColor: c.value,
                            });
                            // Optional: Close on selection or keep open
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full p-5 pl-7 items-center text-center pointer-events-none">
                    {/* Top Label: Genre */}
                    <div className="mt-6 mb-6">
                      <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-secondary border-b border-secondary/30 pb-1">
                        {mainGenre}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`font-serif font-bold text-primary leading-[1.15] mb-4 px-1 ${
                        project.title.length > 8 ? "text-xl" : "text-2xl"
                      }`}
                    >
                      {project.title || "未命名故事"}
                    </h3>

                    {/* Divider */}
                    <div className="w-6 h-0.5 bg-primary mb-5"></div>

                    {/* Theme / Blurb */}
                    <div className="flex-1 w-full flex items-start justify-center overflow-hidden">
                      <p className="text-[10px] text-secondary/80 font-serif italic leading-relaxed line-clamp-5 px-2">
                        {project.theme || "暂无主题描述..."}
                      </p>
                    </div>

                    {/* Footer Stats */}
                    <div className="w-full pt-4 mt-2 border-t border-gray-200/60 flex items-end justify-between text-[9px] text-gray-400 font-sans uppercase tracking-wider">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-primary/80">
                          {project.wordCount > 10000
                            ? `${(project.wordCount / 1000).toFixed(1)}千`
                            : project.wordCount.toLocaleString()}{" "}
                          字
                        </span>
                        <span className="scale-90 origin-left">
                          {new Date(project.lastModified).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="w-5 h-5 text-primary/80">
                          <ProgressRing
                            progress={project.progress || 0}
                            size={20}
                            stroke={2.5}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-primary/60">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              );
            })}

            {/* Empty State */}
            {(searchQuery || filterColor) && filteredProjects.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-secondary opacity-60">
                <Search className="w-12 h-12 mb-4 stroke-1" />
                <p className="font-serif text-lg">未找到相关故事</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterColor(null);
                  }}
                  className="text-sm mt-2 hover:underline hover:text-primary"
                >
                  清除所有筛选条件
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {projectToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 border border-gray-100 transform transition-all scale-100">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary">
                  确认销毁此手稿？
                </h3>
              </div>
              <p className="text-secondary text-sm text-center mb-8 leading-relaxed">
                此操作无法撤销，关于这个故事的所有数据都将永久丢失。
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setProjectToDelete(null)}
                >
                  保留
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white"
                  onClick={handleConfirmDelete}
                >
                  确认销毁
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
