-- Add admin RLS policies for all tables that admins need to access
-- This allows admins to view all user data across all tables

-- Admin policy for books table
CREATE POLICY "Admins can view all books" ON books
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for chapters table
CREATE POLICY "Admins can view all chapters" ON chapters
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for characters table
CREATE POLICY "Admins can view all characters" ON characters
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for outlines table
CREATE POLICY "Admins can view all outlines" ON outlines
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for instructions table
CREATE POLICY "Admins can view all instructions" ON instructions
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for chapter_memories table
CREATE POLICY "Admins can view all chapter_memories" ON chapter_memories
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for user_credits table
CREATE POLICY "Admins can view all user_credits" ON user_credits
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policy for profiles table
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));