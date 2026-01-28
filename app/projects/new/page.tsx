"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProjectCreationSelector } from "../../../components/ProjectCreationSelector";
import { Navbar } from "../../../components/Navbar";
import { refreshProjects } from "../../../lib/hooks/useProjects";
import { createBook } from "../../../lib/supabase-db";
import { createClient } from "../../../lib/supabase/client";
import { StoryBible } from "../../../lib/types";

const DEFAULT_BIBLE: StoryBible = {
  core: {
    title: "",
    theme: "",
    logline: "",
    genre: "",
    settingTime: "",
    settingPlace: "",
    settingWorld: "",
    styleTone: "",
    targetChapterCount: 8,
    targetChapterWordCount: 1500,
  },
  characters: [
    {
      id: "1",
      name: "",
      role: "Protagonist",
      description: "",
      background: "",
      motivation: "",
      arcOrConflict: "",
    },
  ],
  outline: [],
  instructions: {
    pov: "第三人称有限视角",
    pacing: "",
    dialogueStyle: "",
    sensoryDetails: "",
    keyElements: "",
    avoid: "",
  },
};

export default function NewProjectPage() {
  const router = useRouter();

  const handleManualStart = async () => {
    const supabase = createClient();
    const bookId = await createBook(supabase, DEFAULT_BIBLE);
    if (bookId) {
      // 刷新 SWR 缓存，返回时会显示新创建的书
      refreshProjects();
      router.push(`/projects/${bookId}`);
    }
  };

  const handleAIGenerate = async (bible: StoryBible) => {
    const supabase = createClient();
    const bookId = await createBook(supabase, bible);
    if (bookId) {
      // 刷新 SWR 缓存，返回时会显示新创建的书
      refreshProjects();
      router.push(`/projects/${bookId}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar showSearch={false} />
      <ProjectCreationSelector
        onManualStart={handleManualStart}
        onAIGenerate={handleAIGenerate}
      />
    </div>
  );
}
