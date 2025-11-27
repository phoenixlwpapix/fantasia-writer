-- Drop existing function first (required when changing return type)
DROP FUNCTION IF EXISTS get_admin_users();

-- Create a function for admins to get all users
CREATE FUNCTION get_admin_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  credits INTEGER,
  total_books BIGINT,
  total_words BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    au.email,
    p.full_name,
    p.avatar_url,
    p.bio,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(uc.credits, 0) as credits,
    COUNT(b.id) as total_books,
    COALESCE(SUM(c.word_count), 0) as total_words
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.user_id
  LEFT JOIN user_credits uc ON au.id = uc.user_id
  LEFT JOIN books b ON au.id = b.user_id
  LEFT JOIN chapters c ON b.id = c.book_id
  GROUP BY au.id, au.email, p.full_name, p.avatar_url, p.bio, au.created_at, au.last_sign_in_at, au.email_confirmed_at, uc.credits;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;