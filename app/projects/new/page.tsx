"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProjectCreationSelector } from "../../../components/ProjectCreationSelector";
import { createBook } from "../../../lib/supabase-db";
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
    const bookId = await createBook(DEFAULT_BIBLE);
    if (bookId) {
      router.push(`/projects/${bookId}`);
    }
  };

  const handleAIGenerate = async (bible: StoryBible) => {
    const bookId = await createBook(bible);
    if (bookId) {
      router.push(`/projects/${bookId}`);
    }
  };

  return (
    <ProjectCreationSelector
      onManualStart={handleManualStart}
      onAIGenerate={handleAIGenerate}
    />
  );
}
