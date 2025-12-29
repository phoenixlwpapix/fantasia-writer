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
import { StoryBible, StoryChapter, ProjectMetadata } from "../lib/types";
import {
  createBook,
  updateBook,
  loadBook,
  loadUserBooks,
  deleteBook,
  saveChapter,
  loadChapters,
  updateBookSpineColor,
  initializeUserCredits,
  getUserCredits,
  checkIsAdmin,
} from "../lib/supabase-db";
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
  user: any;

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

  // Dirty state for auto-save
  markDirty: () => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Removed localStorage constants - now using Supabase

export const StoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  // App State
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Workspace State
  const [bible, setBible] = useState<StoryBible>(DEFAULT_BIBLE);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);

  // Track if there are unsaved changes (prevents auto-save on initial load)
  const [isDirty, setIsDirty] = useState(false);

  // User Info State
  const [user, setUser] = useState<any>(null);

  // User Credits State
  const [userCredits, setUserCredits] = useState<number>(0);

  // Admin Status State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Load user projects from Supabase on mount and auth changes
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          const userProjects = await loadUserBooks(supabase);
          setProjects(userProjects);

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
          setProjects([]);
          setUserCredits(0);
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();

    // ❌ Removed onAuthStateChange listener to prevent unnecessary reloads
    // when switching browser tabs (Supabase triggers SIGNED_IN on focus)
    // Auth state changes are handled by component re-mounting on route changes
  }, []);

  // Auto-save current project to Supabase (only when there are actual changes)
  useEffect(() => {
    if (!currentProjectId || !isDirty) return;

    const autoSave = async () => {
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

      // Refresh projects list to update metadata
      const updatedProjects = await loadUserBooks(supabase);
      setProjects(updatedProjects);
    };

    // Debounce auto-save
    const timeoutId = setTimeout(autoSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [bible, chapters, currentProjectId, isDirty]);

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
    const supabase = createClient();
    const success = await deleteBook(supabase, id);
    if (success) {
      const newProjects = projects.filter((p) => p.id !== id);
      setProjects(newProjects);

      if (currentProjectId === id) {
        setCurrentProjectId(null);
        router.push("/projects");
      }
    }
  };

  const markDirty = useCallback(() => {
    setIsDirty(true);
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
      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

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
        setBible,
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
        markDirty,
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
