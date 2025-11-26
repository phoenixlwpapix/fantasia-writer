import {
  StoryBible,
  StoryChapter,
  CoreConcept,
  Character,
  WritingInstructions,
  ChapterMetadata,
} from "../lib/types";

// --- CLIENT SIDE API CALLS ---

async function callApi(action: string, payload: any) {
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

// Simple non-streaming generation
export const generateChapter = async (
  bible: StoryBible,
  chapterId: string,
  previousChapters: StoryChapter[]
): Promise<string> => {
  // We didn't explicitly implement a separate non-streaming API route for this since the UI uses streaming,
  // but we can map it to a hypothetical action if needed.
  // However, the current UI mostly uses streaming. If legacy support is needed, we'd add it to route.ts.
  // For now, let's assuming we don't strictly need this OR map it to a single-shot request.
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
): Promise<any[]> => {
  return callApi("generateFullOutline", { bible });
};
