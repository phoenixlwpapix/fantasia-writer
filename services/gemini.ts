import {
  StoryBible,
  StoryChapter,
  CoreConcept,
  Character,
  WritingInstructions,
  ChapterMetadata,
  ChapterOutline,
} from "../lib/types";

// --- CLIENT SIDE API CALLS ---

async function callApi(action: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}

export const generateFullStoryBible = async (
  idea: string,
  targetChapterCount: number = 8,
  targetChapterWordCount: number = 1500
): Promise<StoryBible> => {
  return callApi("generateFullStoryBible", {
    idea,
    targetChapterCount,
    targetChapterWordCount,
  });
};

export const generateStoryCore = async (
  current: Partial<CoreConcept>
): Promise<CoreConcept> => {
  return callApi("generateStoryCore", { current });
};

export const generateCharacterList = async (
  core: CoreConcept,
  currentChars: Character[]
): Promise<Character[]> => {
  return callApi("generateCharacterList", { core, currentChars });
};

export const generateWritingInstructions = async (
  bible: StoryBible
): Promise<WritingInstructions> => {
  return callApi("generateWritingInstructions", { bible });
};

export const analyzeChapterContext = async (
  content: string,
  title: string
): Promise<ChapterMetadata> => {
  return callApi("analyzeChapterContext", { content, title });
};

// Simple non-streaming generation (unused - kept for legacy compatibility)
export const generateChapter = async (): Promise<string> => {
  // We didn't explicitly implement a separate non-streaming API route for this since the UI uses streaming.
  // The current UI uses streaming. If legacy support is needed, we'd add it to route.ts.
  throw new Error("Please use generateChapterStream");
};

// Streaming generation
export async function* generateChapterStream(
  bible: StoryBible,
  chapterId: string,
  previousChapters: StoryChapter[],
  rewriteInstructions?: string
): AsyncGenerator<{ text: string }, void, unknown> {
  const response = await fetch("/api/gemini/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bible,
      chapterId,
      previousChapters,
      rewriteInstructions,
    }),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkText = decoder.decode(value, { stream: true });
      // Mimic the SDK structure for the frontend: an object with a text property
      yield { text: chunkText };
    }
  } finally {
    reader.releaseLock();
  }
}

export const generateFullOutline = async (
  bible: Partial<StoryBible>
): Promise<Pick<ChapterOutline, "title" | "summary">[]> => {
  return callApi("generateFullOutline", { bible });
};
