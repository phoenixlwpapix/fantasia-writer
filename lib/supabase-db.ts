import { createClient } from "./supabase-client";
import { StoryBible, StoryChapter, ProjectMetadata } from "./types";

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

  // Update characters - delete existing and insert new
  await supabase.from("characters").delete().eq("book_id", bookId);
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

    if (charError) console.error("Error updating characters:", charError);
  }

  // Update outlines - delete existing and insert new
  await supabase.from("outlines").delete().eq("book_id", bookId);
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

    if (outlineError) console.error("Error updating outlines:", outlineError);
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
): Promise<boolean> => {
  const chapterData = {
    book_id: bookId,
    outline_id: chapter.outlineId,
    title: chapter.title,
    content: chapter.content,
    word_count: chapter.wordCount,
  };

  const { error } = await supabase
    .from("chapters")
    .upsert(chapterData, { onConflict: "id" });

  if (error) {
    console.error("Error saving chapter:", error);
    return false;
  }

  // Save chapter memory if exists
  if (chapter.metadata) {
    const memoryData = {
      chapter_id: chapter.id,
      summary: chapter.metadata.summary,
      key_events: chapter.metadata.keyEvents,
      items: chapter.metadata.items,
      location: chapter.metadata.location,
      characters: chapter.metadata.characters,
    };

    const { error: memoryError } = await supabase
      .from("chapter_memories")
      .upsert(memoryData, { onConflict: "chapter_id" });

    if (memoryError) console.error("Error saving chapter memory:", memoryError);
  }

  return true;
};

export const loadChapters = async (bookId: string): Promise<StoryChapter[]> => {
  const { data: chapters, error } = await supabase
    .from("chapters")
    .select(
      `
      *,
      chapter_memories (*)
    `
    )
    .eq("book_id", bookId)
    .order("created_at");

  if (error) {
    console.error("Error loading chapters:", error);
    return [];
  }

  return chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    content: ch.content || "",
    wordCount: ch.word_count,
    outlineId: ch.outline_id,
    metadata: ch.chapter_memories?.[0]
      ? {
          summary: ch.chapter_memories[0].summary || "",
          keyEvents: ch.chapter_memories[0].key_events || [],
          items: ch.chapter_memories[0].items || [],
          location: ch.chapter_memories[0].location || "",
          characters: ch.chapter_memories[0].characters || [],
        }
      : undefined,
  }));
};
