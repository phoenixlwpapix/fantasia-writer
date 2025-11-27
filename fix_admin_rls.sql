-- Fix infinite recursion in admin_users RLS policies

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;

-- Recreate the essential policies (drop and recreate to ensure clean state)
DROP POLICY IF EXISTS "Authenticated users can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;

-- Allow authenticated users to view admin_users (for checking permissions)
CREATE POLICY "Authenticated users can view admin_users" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage admin_users (for admin operations)
CREATE POLICY "Service role can manage admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');