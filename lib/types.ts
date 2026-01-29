export enum StoryGenre {
  MYSTERY = "悬疑推理",
  SCI_FI = "科幻",
  FANTASY = "奇幻",
  ROMANCE = "都市情感",
  THRILLER = "惊悚",
  HISTORICAL = "历史传奇",
  LITERARY = "文学剧情",
}

export interface CoreConcept {
  title: string;
  theme: string;
  logline: string;
  genre: StoryGenre | string;
  settingTime: string;
  settingPlace: string;
  settingWorld: string;
  styleTone: string;
  targetChapterCount?: number;
  targetChapterWordCount?: number;
}

export interface Character {
  id: string;
  name: string;
  role: "Protagonist" | "Antagonist" | "Supporting"; // Kept internal IDs in English for logic, mapped in UI
  description: string; // Physical & Personality
  background: string;
  motivation: string;
  arcOrConflict: string;
}

export interface ChapterOutline {
  id: string;
  title: string;
  // act field removed
  summary: string;
  isGenerated: boolean;
}

export interface WritingInstructions {
  pov: string;
  pacing: string;
  dialogueStyle: string;
  sensoryDetails: string;
  keyElements: string;
  avoid: string;
  stylePresetId?: string; // 预设ID，"custom"表示自定义
  customPromptModifiers?: string; // 自定义prompt修饰语
}

export interface ChapterMetadata {
  summary: string; // Short plot summary of this chapter
  keyEvents: string[]; // Bullet points of major events
  items: string[]; // Important items acquired, used, or lost
  location: string; // Where the chapter ended
  characters: string[]; // Who was active in this chapter
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  outlineId: string;
  metadata?: ChapterMetadata; // New field for continuity tracking
}

export interface StoryBible {
  id?: string; // Add optional id field for database
  core: CoreConcept;
  characters: Character[];
  outline: ChapterOutline[];
  instructions: WritingInstructions;
}

export enum AppView {
  LANDING = "LANDING",
  LOGIN = "LOGIN",
  DASHBOARD = "DASHBOARD",
  SETUP = "SETUP",
  WRITER = "WRITER",
}

export type SetupStep = "CORE" | "CHARACTERS" | "OUTLINE" | "INSTRUCTIONS";

export interface ProjectMetadata {
  id: string;
  title: string;
  summary: string; // This often stores the Genre
  theme?: string; // Added to store the Core Theme/Logline for the cover
  lastModified: number;
  wordCount: number;
  progress?: number;
  spineColor?: string; // Stores the tailwind gradient classes for the book spine
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export enum GenerationType {
  COMPLETE_SETUP = "complete_setup", // 完整设定生成 (10点)
  SINGLE_PAGE_SETUP = "single_page_setup", // 单页设定生成 (2点)
  CHAPTER_NORMAL = "chapter_normal", // 单章普通生成 (5点)
  CHAPTER_LONG = "chapter_long", // 单章长章生成 (8点)
}

export const GENERATION_COSTS = {
  [GenerationType.COMPLETE_SETUP]: 10,
  [GenerationType.SINGLE_PAGE_SETUP]: 2,
  [GenerationType.CHAPTER_NORMAL]: 5,
  [GenerationType.CHAPTER_LONG]: 8,
} as const;

export const NEW_USER_CREDITS = 100; // 新用户注册赠送积分
