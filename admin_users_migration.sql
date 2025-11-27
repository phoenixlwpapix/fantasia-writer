-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Allow authenticated users to view admin_users (for checking permissions)
CREATE POLICY "Authenticated users can view admin_users" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert/update/delete (for initial setup)
CREATE POLICY "Service role can manage admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Allow admins to manage other admins
CREATE POLICY "Admins can manage admin_users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.user_id = auth.uid()
        )
    );

-- Insert the initial admin user
-- Note: Replace 'user-uuid-here' with the actual UUID of phoenixlwp@gmail.com from auth.users
-- This needs to be done manually in Supabase dashboard after finding the user ID
-- INSERT INTO admin_users (user_id, email) VALUES ('user-uuid-here', 'phoenixlwp@gmail.com');