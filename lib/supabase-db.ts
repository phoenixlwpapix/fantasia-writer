import { createClient } from "./supabase-client";
import {
  StoryBible,
  StoryChapter,
  ProjectMetadata,
  UserCredits,
  NEW_USER_CREDITS,
} from "./types";

const supabase = createClient();

// Database types
export interface BookRecord {
  id: string;
  user_id: string;
  title: string;
  theme?: string;
  logline?: string;
  genre?: string;
  setting_time?: string;
  setting_place?: string;
  setting_world?: string;
  style_tone?: string;
  target_chapter_count?: number;
  target_chapter_word_count?: number;
  spine_color?: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterRecord {
  id: string;
  book_id: string;
  name: string;
  role: string;
  description?: string;
  background?: string;
  motivation?: string;
  arc_or_conflict?: string;
  created_at: string;
}

export interface OutlineRecord {
  id: string;
  book_id: string;
  title: string;
  summary?: string;
  is_generated: boolean;
  created_at: string;
}

export interface InstructionRecord {
  id: string;
  book_id: string;
  pov?: string;
  pacing?: string;
  dialogue_style?: string;
  sensory_details?: string;
  key_elements?: string;
  avoid?: string;
  created_at: string;
}

export interface ChapterRecord {
  id: string;
  book_id: string;
  outline_id?: string;
  title: string;
  content?: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterMemoryRecord {
  id: string;
  chapter_id: string;
  summary?: string;
  key_events: string[];
  items: string[];
  location?: string;
  characters: string[];
  created_at: string;
}

// Book operations
export const createBook = async (bible: StoryBible): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: user.id,
      title: bible.core.title,
      theme: bible.core.theme,
      logline: bible.core.logline,
      genre: bible.core.genre,
      setting_time: bible.core.settingTime,
      setting_place: bible.core.settingPlace,
      setting_world: bible.core.settingWorld,
      style_tone: bible.core.styleTone,
      target_chapter_count: bible.core.targetChapterCount,
      target_chapter_word_count: bible.core.targetChapterWordCount,
      spine_color: "from-gray-800 to-gray-700",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating book:", error);
    return null;
  }

  const bookId = data.id;

  // Create characters
  if (bible.characters.length > 0) {
    const charactersData = bible.characters.map((char) => ({
      book_id: bookId,
      name: char.name,
      role: char.role,
      description: char.description,
      background: char.background,
      motivation: char.motivation,
      arc_or_conflict: char.arcOrConflict,
    }));

    const { error: charError } = await supabase
      .from("characters")
      .insert(charactersData);

    if (charError) console.error("Error creating characters:", charError);
  }

  // Create outlines
  if (bible.outline.length > 0) {
    const outlinesData = bible.outline.map((outline) => ({
      book_id: bookId,
      title: outline.title,
      summary: outline.summary,
      is_generated: outline.isGenerated,
    }));

    const { error: outlineError } = await supabase
      .from("outlines")
      .insert(outlinesData);

    if (outlineError) console.error("Error creating outlines:", outlineError);
  }

  // Create instructions
  const { error: instrError } = await supabase.from("instructions").insert({
    book_id: bookId,
    pov: bible.instructions.pov,
    pacing: bible.instructions.pacing,
    dialogue_style: bible.instructions.dialogueStyle,
    sensory_details: bible.instructions.sensoryDetails,
    key_elements: bible.instructions.keyElements,
    avoid: bible.instructions.avoid,
  });

  if (instrError) console.error("Error creating instructions:", instrError);

  return bookId;
};

export const updateBook = async (
  bookId: string,
  bible: StoryBible
): Promise<boolean> => {
  const { error } = await supabase
    .from("books")
    .update({
      title: bible.core.title,
      theme: bible.core.theme,
      logline: bible.core.logline,
      genre: bible.core.genre,
      setting_time: bible.core.settingTime,
      setting_place: bible.core.settingPlace,
      setting_world: bible.core.settingWorld,
      style_tone: bible.core.styleTone,
      target_chapter_count: bible.core.targetChapterCount,
      target_chapter_word_count: bible.core.targetChapterWordCount,
    })
    .eq("id", bookId);

  if (error) {
    console.error("Error updating book:", error);
    return false;
  }

  // Update characters - delete removed ones first
  const { data: currentChars } = await supabase
    .from("characters")
    .select("id")
    .eq("book_id", bookId);
  const currentCharIds = new Set(currentChars?.map((c) => c.id) || []);
  const newCharIds = new Set(bible.characters.map((c) => c.id));
  const charsToDelete = [...currentCharIds].filter((id) => !newCharIds.has(id));

  if (charsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("characters")
      .delete()
      .in("id", charsToDelete);
    if (deleteError) console.error("Error deleting characters:", deleteError);
  }

  // Upsert new/updated characters
  for (const char of bible.characters) {
    const { error: charError } = await supabase.from("characters").upsert(
      {
        id: char.id,
        book_id: bookId,
        name: char.name,
        role: char.role,
        description: char.description,
        background: char.background,
        motivation: char.motivation,
        arc_or_conflict: char.arcOrConflict,
      },
      { onConflict: "id" }
    );

    if (charError) console.error("Error updating character:", charError);
  }

  // Update outlines - delete removed ones first
  const { data: currentOutlines } = await supabase
    .from("outlines")
    .select("id")
    .eq("book_id", bookId);
  const currentOutlineIds = new Set(currentOutlines?.map((o) => o.id) || []);
  const newOutlineIds = new Set(bible.outline.map((o) => o.id));
  const outlinesToDelete = [...currentOutlineIds].filter(
    (id) => !newOutlineIds.has(id)
  );

  if (outlinesToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("outlines")
      .delete()
      .in("id", outlinesToDelete);
    if (deleteError) console.error("Error deleting outlines:", deleteError);
  }

  // Upsert new/updated outlines
  for (const outline of bible.outline) {
    const { error: outlineError } = await supabase.from("outlines").upsert(
      {
        id: outline.id,
        book_id: bookId,
        title: outline.title,
        summary: outline.summary,
        is_generated: outline.isGenerated,
      },
      { onConflict: "id" }
    );

    if (outlineError) console.error("Error updating outline:", outlineError);
  }

  // Update instructions
  const { error: instrError } = await supabase.from("instructions").upsert(
    {
      book_id: bookId,
      pov: bible.instructions.pov,
      pacing: bible.instructions.pacing,
      dialogue_style: bible.instructions.dialogueStyle,
      sensory_details: bible.instructions.sensoryDetails,
      key_elements: bible.instructions.keyElements,
      avoid: bible.instructions.avoid,
    },
    { onConflict: "book_id" }
  );

  if (instrError) console.error("Error updating instructions:", instrError);

  return true;
};

export const loadBook = async (bookId: string): Promise<StoryBible | null> => {
  // Load book
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .single();

  if (bookError || !book) {
    console.error("Error loading book:", bookError);
    return null;
  }

  // Load characters
  const { data: characters, error: charError } = await supabase
    .from("characters")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at");

  if (charError) console.error("Error loading characters:", charError);

  // Load outlines
  const { data: outlines, error: outlineError } = await supabase
    .from("outlines")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at");

  if (outlines) {
    // Sort outlines by chapter number extracted from title
    outlines.sort((a, b) => {
      const matchA = a.title.match(/第(\d+)章/);
      const matchB = b.title.match(/第(\d+)章/);
      const numA = matchA ? parseInt(matchA[1]) : 0;
      const numB = matchB ? parseInt(matchB[1]) : 0;
      return numA - numB;
    });
  }

  if (outlineError) console.error("Error loading outlines:", outlineError);

  // Load instructions
  const { data: instructions, error: instrError } = await supabase
    .from("instructions")
    .select("*")
    .eq("book_id", bookId)
    .single();

  if (instrError) console.error("Error loading instructions:", instrError);

  // Build StoryBible
  const bible: StoryBible = {
    id: book.id,
    core: {
      title: book.title,
      theme: book.theme || "",
      logline: book.logline || "",
      genre: book.genre || "",
      settingTime: book.setting_time || "",
      settingPlace: book.setting_place || "",
      settingWorld: book.setting_world || "",
      styleTone: book.style_tone || "",
      targetChapterCount: book.target_chapter_count || 8,
      targetChapterWordCount: book.target_chapter_word_count || 1500,
    },
    characters:
      characters?.map((char) => ({
        id: char.id,
        name: char.name,
        role: char.role as "Protagonist" | "Antagonist" | "Supporting",
        description: char.description || "",
        background: char.background || "",
        motivation: char.motivation || "",
        arcOrConflict: char.arc_or_conflict || "",
      })) || [],
    outline:
      outlines?.map((outline) => ({
        id: outline.id,
        title: outline.title,
        summary: outline.summary || "",
        isGenerated: outline.is_generated,
      })) || [],
    instructions: {
      pov: instructions?.pov || "第三人称有限视角",
      pacing: instructions?.pacing || "",
      dialogueStyle: instructions?.dialogue_style || "",
      sensoryDetails: instructions?.sensory_details || "",
      keyElements: instructions?.key_elements || "",
      avoid: instructions?.avoid || "",
    },
  };

  return bible;
};

export const loadUserBooks = async (): Promise<ProjectMetadata[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: books, error } = await supabase
    .from("books")
    .select(
      `
      id,
      title,
      theme,
      genre,
      spine_color,
      updated_at,
      chapters (
        word_count
      )
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading user books:", error);
    return [];
  }

  return books.map((book) => {
    const totalWords =
      book.chapters?.reduce(
        (sum: number, ch: { word_count?: number }) =>
          sum + (ch.word_count || 0),
        0
      ) || 0;
    const chapterCount = book.chapters?.length || 0;
    const progress = Math.min(
      100,
      Math.floor((chapterCount / Math.max(8, 1)) * 100)
    );

    return {
      id: book.id,
      title: book.title,
      summary: book.genre || "未分类",
      theme: book.theme || "",
      lastModified: new Date(book.updated_at).getTime(),
      wordCount: totalWords,
      progress: progress,
      spineColor: book.spine_color || "from-gray-800 to-gray-700",
    };
  });
};

export const updateBookSpineColor = async (
  bookId: string,
  spineColor: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("books")
    .update({ spine_color: spineColor })
    .eq("id", bookId);

  if (error) {
    console.error("Error updating book spine color:", error);
    return false;
  }

  return true;
};

export const deleteBook = async (bookId: string): Promise<boolean> => {
  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) {
    console.error("Error deleting book:", error);
    return false;
  }

  return true;
};

// Chapter operations
export const saveChapter = async (
  chapter: StoryChapter,
  bookId: string
): Promise<string | null> => {
  console.log("saveChapter called with:", {
    chapterId: chapter.id,
    outlineId: chapter.outlineId,
    bookId,
    title: chapter.title,
    hasMetadata: !!chapter.metadata,
  });

  // First, find existing chapter by outline_id to ensure correct id
  const { data: existingChapter, error: findError } = await supabase
    .from("chapters")
    .select("id")
    .eq("book_id", bookId)
    .eq("outline_id", chapter.outlineId)
    .single();

  if (findError && findError.code !== "PGRST116") {
    // PGRST116 is "not found"
    console.error("Error finding existing chapter:", findError);
  }

  const chapterId = existingChapter?.id || chapter.id;
  console.log(
    "Using chapterId:",
    chapterId,
    "existingChapter:",
    existingChapter
  );

  const chapterData = {
    id: chapterId,
    book_id: bookId,
    outline_id: chapter.outlineId,
    title: chapter.title,
    content: chapter.content,
    word_count: chapter.wordCount,
  };

  console.log("Upserting chapter data:", chapterData);

  const { data, error } = await supabase
    .from("chapters")
    .upsert(chapterData, { onConflict: "id" })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving chapter:", error);
    return null;
  }

  const savedChapterId = data.id;
  console.log("Chapter saved with id:", savedChapterId);

  // Save chapter memory if exists
  if (chapter.metadata) {
    const memoryData = {
      chapter_id: savedChapterId,
      summary: chapter.metadata.summary,
      key_events: chapter.metadata.keyEvents,
      items: chapter.metadata.items,
      location: chapter.metadata.location,
      characters: chapter.metadata.characters,
    };

    console.log("Saving chapter memory:", memoryData);

    const { error: memoryError } = await supabase
      .from("chapter_memories")
      .upsert(memoryData, { onConflict: "chapter_id" });

    if (memoryError) {
      console.error("Error saving chapter memory:", memoryError);
    } else {
      console.log("Chapter memory saved successfully");
    }
  } else {
    console.log("No metadata to save for chapter:", chapter.title);
  }

  return savedChapterId;
};

export const loadChapters = async (bookId: string): Promise<StoryChapter[]> => {
  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at");

  if (error) {
    console.error("Error loading chapters:", error);
    return [];
  }

  // Load memories separately to avoid join issues
  const chapterIds = chapters.map((ch) => ch.id);
  const { data: memories, error: memoryError } = await supabase
    .from("chapter_memories")
    .select("*")
    .in("chapter_id", chapterIds);

  if (memoryError) {
    console.error("Error loading chapter memories:", memoryError);
  }

  const memoryMap = new Map(memories?.map((m) => [m.chapter_id, m]) || []);

  const mappedChapters = chapters.map((ch) => {
    const memory = memoryMap.get(ch.id);

    console.log(`Chapter ${ch.title} (id: ${ch.id}): memory found`, memory);

    const metadata = memory
      ? {
          summary: memory.summary || "",
          keyEvents: memory.key_events || [],
          items: memory.items || [],
          location: memory.location || "",
          characters: memory.characters || [],
        }
      : undefined;

    console.log(
      `Chapter ${ch.title} (id: ${ch.id}): metadata loaded`,
      metadata
    );

    return {
      id: ch.id,
      title: ch.title,
      content: ch.content || "",
      wordCount: ch.word_count,
      outlineId: ch.outline_id,
      metadata,
    };
  });

  return mappedChapters;
};

// User credits operations
export const getUserCredits = async (): Promise<UserCredits | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error getting user credits:", error);
    return null;
  }

  return data;
};

export const initializeUserCredits = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if user already has credits
  const existingCredits = await getUserCredits();
  if (existingCredits) return true;

  // Initialize with new user credits
  const { error } = await supabase.from("user_credits").insert({
    user_id: user.id,
    credits: NEW_USER_CREDITS,
  });

  if (error) {
    console.error("Error initializing user credits:", error);
    return false;
  }

  return true;
};

export const deductUserCredits = async (amount: number): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const currentCredits = await getUserCredits();
  if (!currentCredits || currentCredits.credits < amount) {
    return false; // Insufficient credits
  }

  const { error } = await supabase
    .from("user_credits")
    .update({ credits: currentCredits.credits - amount })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deducting user credits:", error);
    return false;
  }

  return true;
};

export const addUserCredits = async (amount: number): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const currentCredits = await getUserCredits();
  if (!currentCredits) return false;

  const { error } = await supabase
    .from("user_credits")
    .update({ credits: currentCredits.credits + amount })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error adding user credits:", error);
    return false;
  }

  return true;
};

// Admin operations
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return false;
    }

    if (!user) {
      console.log("No authenticated user");
      return false;
    }

    console.log("Checking admin status for user:", user.email);

    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no record found, it's not an error - just not admin
      if (error.code === "PGRST116") {
        console.log("User is not an admin");
        return false;
      }
      console.error("Database error checking admin status:", error);
      return false;
    }

    console.log("User is admin:", !!data);
    return !!data;
  } catch (err) {
    console.error("Unexpected error in checkIsAdmin:", err);
    return false;
  }
};

export const getAdminUsers = async (): Promise<
  { id: string; user_id: string; email: string; created_at: string }[]
> => {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("Error getting admin users:", error);
    return [];
  }

  return data || [];
};

export const addAdminUser = async (email: string): Promise<boolean> => {
  // First get user by email from auth.users
  const { data: authUser, error: authError } = await supabase
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .single();

  if (authError || !authUser) {
    console.error("User not found:", authError);
    return false;
  }

  const { error } = await supabase.from("admin_users").insert({
    user_id: authUser.id,
    email: email,
  });

  if (error) {
    console.error("Error adding admin user:", error);
    return false;
  }

  return true;
};

export const removeAdminUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing admin user:", error);
    return false;
  }

  return true;
};
