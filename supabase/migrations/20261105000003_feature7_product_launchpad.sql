-- ====================================================================
-- Feature 7: Product Launchpad Migration
-- Option A: Instant Publishing with Automated Moderation
-- ====================================================================

-- 1. Create or extend products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  features TEXT[] DEFAULT '{}',
  logo_url TEXT NOT NULL,
  cover_url TEXT,
  media_urls TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  website_url TEXT NOT NULL,
  demo_url TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  pricing_model TEXT NOT NULL DEFAULT 'free',
  technologies TEXT[] DEFAULT '{}',
  target_audience TEXT,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  website_clicks INTEGER NOT NULL DEFAULT 0,
  launch_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_launch_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  moderation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for discovery, rankings and categories
CREATE INDEX IF NOT EXISTS idx_products_maker_id ON products(maker_id);
CREATE INDEX IF NOT EXISTS idx_products_startup_id ON products(startup_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_moderation_status ON products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_products_launch_date ON products(launch_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_upvotes ON products(upvotes_count DESC);

-- Add foreign key constraint from startup_updates to products (deferred from Feature 6)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_startup_updates_product'
  ) THEN
    ALTER TABLE public.startup_updates
      ADD CONSTRAINT fk_startup_updates_product
      FOREIGN KEY (associated_product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Upvotes (Abuse-resistant: 1 upvote per founder profile)
CREATE TABLE IF NOT EXISTS product_upvotes (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_product_upvotes_profile ON product_upvotes(profile_id);

-- 3. Comments and Q&A
CREATE TABLE IF NOT EXISTS product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_maker_reply BOOLEAN NOT NULL DEFAULT FALSE,
  is_question BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_comments_product ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_parent ON product_comments(parent_id);

-- 4. Comment Likes
CREATE TABLE IF NOT EXISTS product_comment_likes (
  comment_id UUID NOT NULL REFERENCES product_comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, profile_id)
);

-- 5. Verified User Reviews & Ratings
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_verified_user BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);

-- 6. Product Updates
CREATE TABLE IF NOT EXISTS product_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  media_urls TEXT[] DEFAULT '{}',
  broadcast_to_feed BOOLEAN NOT NULL DEFAULT TRUE,
  feed_post_id UUID REFERENCES founder_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_updates_product ON product_updates(product_id);

-- 7. Product Follows
CREATE TABLE IF NOT EXISTS product_follows (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, profile_id)
);

-- 8. Product Collections & Saves
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_collection_items (
  collection_id UUID NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE IF NOT EXISTS product_saves (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES product_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, profile_id)
);

-- 9. Moderation Audit Trail & Appeals (Option A)
CREATE TABLE IF NOT EXISTS product_moderation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  triggered_by TEXT NOT NULL, -- automated_system, admin, appeal_review
  admin_id UUID REFERENCES founder_profiles(id),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_mod_records_product ON product_moderation_records(product_id);

CREATE TABLE IF NOT EXISTS product_moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  appeal_reason TEXT NOT NULL,
  supporting_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES founder_profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_product_appeals_product ON product_moderation_appeals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_appeals_status ON product_moderation_appeals(status);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_moderation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_moderation_appeals ENABLE ROW LEVEL SECURITY;

-- Product policies
CREATE POLICY "Public products viewable in Founders world"
  ON products FOR SELECT
  USING (
    moderation_status IN ('approved', 'monitoring')
    OR maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.startup_members sm
      JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
      WHERE sm.startup_id = products.startup_id
        AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
    )
  );

CREATE POLICY "Makers and authorized startup members can insert products"
  ON products FOR INSERT
  WITH CHECK (
    maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR (
      startup_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.startup_members sm
        JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
        WHERE sm.startup_id = products.startup_id
          AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
          AND (sm.role IN ('owner', 'admin') OR sm.can_manage_products = TRUE)
      )
    )
  );

CREATE POLICY "Makers and authorized startup members can update products"
  ON products FOR UPDATE
  USING (
    maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR (
      startup_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.startup_members sm
        JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
        WHERE sm.startup_id = products.startup_id
          AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
          AND (sm.role IN ('owner', 'admin') OR sm.can_manage_products = TRUE)
      )
    )
  );

-- Upvote policies
CREATE POLICY "Founders can view upvotes"
  ON product_upvotes FOR SELECT
  USING (TRUE);

CREATE POLICY "Founders can manage own upvotes"
  ON product_upvotes FOR ALL
  USING (profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Comment policies
CREATE POLICY "Founders can view comments on accessible products"
  ON product_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Founders can create comments"
  ON product_comments FOR INSERT
  WITH CHECK (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Authors can update own comments"
  ON product_comments FOR UPDATE
  USING (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Reviews policies
CREATE POLICY "Founders can view product reviews"
  ON product_reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Founders can add one review per product"
  ON product_reviews FOR INSERT
  WITH CHECK (reviewer_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Updates policies
CREATE POLICY "Founders can view product updates"
  ON product_updates FOR SELECT
  USING (TRUE);

CREATE POLICY "Makers can create product updates"
  ON product_updates FOR INSERT
  WITH CHECK (
    maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_updates.product_id
        AND (
          p.maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.startup_members sm
            JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
            WHERE sm.startup_id = p.startup_id
              AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
              AND (sm.role IN ('owner', 'admin') OR sm.can_manage_products = TRUE)
          )
        )
    )
  );

-- Collection policies
CREATE POLICY "View collections"
  ON product_collections FOR SELECT
  USING (is_public = TRUE OR owner_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Manage own collections"
  ON product_collections FOR ALL
  USING (owner_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));
