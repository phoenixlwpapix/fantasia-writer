-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT,
  logline TEXT,
  genre TEXT,
  setting_time TEXT,
  setting_place TEXT,
  setting_world TEXT,
  style_tone TEXT,
  target_chapter_count INTEGER DEFAULT 8,
  target_chapter_word_count INTEGER DEFAULT 1500,
  spine_color TEXT DEFAULT 'from-gray-800 to-gray-700',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Protagonist', 'Antagonist', 'Supporting')),
  description TEXT,
  background TEXT,
  motivation TEXT,
  arc_or_conflict TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outlines table
CREATE TABLE outlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  is_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructions table
CREATE TABLE instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  pov TEXT,
  pacing TEXT,
  dialogue_style TEXT,
  sensory_details TEXT,
  key_elements TEXT,
  avoid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id) -- One instruction set per book
);

-- Chapters table
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapter memories table
CREATE TABLE chapter_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  summary TEXT,
  key_events JSONB DEFAULT '[]'::jsonb,
  items JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  characters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id) -- One memory per chapter
);

-- User credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One credit record per user
);

-- Create indexes for better performance
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_updated_at ON books(updated_at DESC);
CREATE INDEX idx_characters_book_id ON characters(book_id);
CREATE INDEX idx_outlines_book_id ON outlines(book_id);
CREATE INDEX idx_instructions_book_id ON instructions(book_id);
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_chapters_outline_id ON chapters(outline_id);
CREATE INDEX idx_chapter_memories_chapter_id ON chapter_memories(chapter_id);
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Users can view their own books" ON books
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books" ON books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON books
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON books
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for characters
CREATE POLICY "Users can view characters of their books" ON characters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = characters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert characters for their books" ON characters
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = characters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update characters of their books" ON characters
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = characters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete characters of their books" ON characters
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = characters.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Similar RLS policies for other tables (outlines, instructions, chapters, chapter_memories)
-- For brevity, I'll create a pattern for the remaining tables

-- Outlines policies
CREATE POLICY "Users can view outlines of their books" ON outlines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = outlines.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outlines for their books" ON outlines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = outlines.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update outlines of their books" ON outlines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = outlines.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outlines of their books" ON outlines
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = outlines.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Instructions policies
CREATE POLICY "Users can view instructions of their books" ON instructions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = instructions.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert instructions for their books" ON instructions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = instructions.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update instructions of their books" ON instructions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = instructions.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete instructions of their books" ON instructions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = instructions.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Chapters policies
CREATE POLICY "Users can view chapters of their books" ON chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = chapters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chapters for their books" ON chapters
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = chapters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update chapters of their books" ON chapters
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = chapters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete chapters of their books" ON chapters
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = chapters.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Chapter memories policies
CREATE POLICY "Users can view chapter memories of their books" ON chapter_memories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chapters c
            JOIN books b ON c.book_id = b.id
            WHERE c.id = chapter_memories.chapter_id
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chapter memories for their books" ON chapter_memories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chapters c
            JOIN books b ON c.book_id = b.id
            WHERE c.id = chapter_memories.chapter_id
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update chapter memories of their books" ON chapter_memories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chapters c
            JOIN books b ON c.book_id = b.id
            WHERE c.id = chapter_memories.chapter_id
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete chapter memories of their books" ON chapter_memories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chapters c
            JOIN books b ON c.book_id = b.id
            WHERE c.id = chapter_memories.chapter_id
            AND b.user_id = auth.uid()
        )
    );

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credits" ON user_credits
    FOR DELETE USING (auth.uid() = user_id);