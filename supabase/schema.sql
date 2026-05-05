-- ============================================================
-- Tunnel Blog - Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  excerpt TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post ↔ Categories (many-to-many)
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Post ↔ Tags (many-to-many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- ============================================================
-- Auto-update updated_at on posts
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Full-text search index on posts
-- ============================================================
CREATE INDEX IF NOT EXISTS posts_search_idx
  ON posts USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public read published posts" ON posts
  FOR SELECT USING (status = 'published');

-- Authenticated (admin) can do everything on posts
CREATE POLICY "Admin full access posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Public can read categories and tags
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Admin manage tags" ON tags FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read post_categories" ON post_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage post_categories" ON post_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read post_tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Admin manage post_tags" ON post_tags FOR ALL USING (auth.role() = 'authenticated');

-- Public can insert approved=false comments, read approved ones
CREATE POLICY "Public read approved comments" ON comments
  FOR SELECT USING (approved = true);
CREATE POLICY "Public insert comments" ON comments
  FOR INSERT WITH CHECK (approved = false);
CREATE POLICY "Admin manage comments" ON comments
  FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter: public insert only
CREATE POLICY "Public subscribe newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage newsletter" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Seed: default categories for ITS/ELV blog
-- ============================================================
INSERT INTO categories (name, slug, description) VALUES
  ('Tunnel ELV', 'tunnel-elv', 'Electrical low voltage systems in road tunnels'),
  ('Traffic Management', 'traffic-management', 'ITS and traffic control solutions'),
  ('Automation', 'automation', 'SCADA, PLC and control systems'),
  ('Road Safety', 'road-safety', 'Safety systems and incident detection'),
  ('Technology', 'technology', 'Emerging technologies in transportation')
ON CONFLICT (slug) DO NOTHING;
