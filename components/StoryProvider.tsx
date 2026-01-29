"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { StoryBible, StoryChapter, ProjectMetadata } from "../lib/types";
import {
  updateBook,
  loadBook,
  deleteBook,
  saveChapter,
  loadChapters,
  updateBookSpineColor,
  initializeUserCredits,
  getUserCredits,
  checkIsAdmin,
} from "../lib/supabase-db";
import {
  useProjects,
  optimisticDeleteProject,
  optimisticUpdateProject,
} from "../lib/hooks/useProjects";
import { createClient } from "@/lib/supabase/client";

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
    stylePresetId: undefined,
    customPromptModifiers: undefined,
  },
};

interface StoryContextType {
  bible: StoryBible;
  setBible: React.Dispatch<React.SetStateAction<StoryBible>>;
  updateCore: (data: Partial<StoryBible["core"]>) => void;
  updateInstruction: (data: Partial<StoryBible["instructions"]>) => void;
  chapters: StoryChapter[];
  setChapters: React.Dispatch<React.SetStateAction<StoryChapter[]>>;

  // User Info
  user: User | null;

  // User Credits
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;

  // Admin Status
  isAdmin: boolean;

  // Project Management
  projects: ProjectMetadata[];
  loadingProjects: boolean;
  loadingProject: boolean;
  currentProjectId: string | null;
  createProject: () => void;
  openProject: (id: string) => void;
  loadProject: (id: string) => void;
  closeProject: () => void; // New method for cleanup
  deleteProject: (id: string) => void;
  updateProjectMetadata: (id: string, data: Partial<ProjectMetadata>) => void;

  // Manual save for setup wizard
  saveProject: () => Promise<boolean>;
  isDirty: boolean;
  markDirty: () => void;
  markClean: () => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Removed localStorage constants - now using Supabase

export const StoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  // Projects from SWR (cached, deduplicated)
  const { projects, isLoading: loadingProjects, mutate: mutateProjects } = useProjects();

  // App State
  const [loadingProject, setLoadingProject] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Workspace State
  const [bible, setBible] = useState<StoryBible>(DEFAULT_BIBLE);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);

  // Track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Wrapper for setBible that also marks dirty (used by external components)
  const setBibleAndMarkDirty = useCallback(
    (value: React.SetStateAction<StoryBible>) => {
      setBible(value);
      setIsDirty(true);
    },
    []
  );

  // User Info State
  const [user, setUser] = useState<User | null>(null);

  // User Credits State
  const [userCredits, setUserCredits] = useState<number>(0);

  // Admin Status State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Load user info, credits, and admin status on mount
  // Projects are handled by SWR via useProjects hook
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);

          // Initialize user credits if not exists
          await initializeUserCredits(supabase);

          // Load user credits
          const credits = await getUserCredits(supabase);
          if (credits) {
            setUserCredits(credits.credits);
          }

          // Load admin status
          const adminStatus = await checkIsAdmin(supabase);
          setIsAdmin(adminStatus);
        } else {
          setUser(null);
          setUserCredits(0);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Manual save function for setup wizard
  const saveProject = useCallback(async (): Promise<boolean> => {
    if (!currentProjectId) return false;

    try {
      const supabase = createClient();
      // Save book data
      await updateBook(supabase, currentProjectId, bible);

      // Save only completed chapters (those with metadata, indicating analysis is done)
      const completedChapters = chapters.filter((chapter) => chapter.metadata);
      for (const chapter of completedChapters) {
        const savedId = await saveChapter(supabase, chapter, currentProjectId);
        if (!savedId) {
          console.error("Failed to save chapter:", chapter.title);
        }
      }

      // Reset dirty flag after successful save
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error("Failed to save project:", error);
      return false;
    }
  }, [bible, chapters, currentProjectId]);

  const createProject = () => {
    router.push("/projects/new");
  };

  const openProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const loadProject = async (id: string) => {
    setLoadingProject(true);
    try {
      const supabase = createClient();
      const loadedBible = await loadBook(supabase, id);
      if (loadedBible) {
        setBible(loadedBible);
        const loadedChapters = await loadChapters(supabase, id);
        setChapters(loadedChapters);
        setCurrentProjectId(id);
        // Reset dirty state after loading (this is not a user modification)
        setIsDirty(false);
      } else {
        console.error("Failed to load project");
      }
    } finally {
      setLoadingProject(false);
    }
  };

  const closeProject = () => {
    setCurrentProjectId(null);
    setBible(DEFAULT_BIBLE);
    setChapters([]);
  };

  const deleteProject = async (id: string) => {
    // 乐观更新：先更新 UI
    optimisticDeleteProject(id);

    // 如果删除的是当前项目，清理状态并跳转
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      router.push("/projects");
    }

    // 后台执行实际删除
    const supabase = createClient();
    const success = await deleteBook(supabase, id);
    if (!success) {
      // 删除失败，重新获取数据恢复
      mutateProjects();
    }
  };

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  const updateCore = useCallback((data: Partial<StoryBible["core"]>) => {
    setBible((prev) => ({ ...prev, core: { ...prev.core, ...data } }));
    setIsDirty(true);
  }, []);

  const updateInstruction = useCallback(
    (data: Partial<StoryBible["instructions"]>) => {
      setBible((prev) => ({
        ...prev,
        instructions: { ...prev.instructions, ...data },
      }));
      setIsDirty(true);
    },
    []
  );

  const updateProjectMetadata = useCallback(
    async (id: string, data: Partial<ProjectMetadata>) => {
      // 乐观更新：先更新 UI
      optimisticUpdateProject(id, data);

      // Save spine color to database if provided
      if (data.spineColor) {
        const supabase = createClient();
        await updateBookSpineColor(supabase, id, data.spineColor);
      }
    },
    []
  );

  return (
    <StoryContext.Provider
      value={{
        bible,
        setBible: setBibleAndMarkDirty,
        updateCore,
        updateInstruction,
        chapters,
        setChapters,
        user,
        userCredits,
        setUserCredits,
        isAdmin,
        projects,
        loadingProjects,
        loadingProject,
        currentProjectId,
        createProject,
        openProject,
        loadProject,
        closeProject,
        deleteProject,
        updateProjectMetadata,
        saveProject,
        isDirty,
        markDirty,
        markClean,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) throw new Error("useStory must be used within a StoryProvider");
  return context;
};
