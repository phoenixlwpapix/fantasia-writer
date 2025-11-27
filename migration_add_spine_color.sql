-- Migration to add spine_color field to books table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE books
ADD COLUMN spine_color TEXT DEFAULT 'from-gray-800 to-gray-700';

-- Update existing records to have the default color
UPDATE books
SET spine_color = 'from-gray-800 to-gray-700'
WHERE spine_color IS NULL;