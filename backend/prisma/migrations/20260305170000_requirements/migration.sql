CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
    CREATE TYPE "AdminRole" AS ENUM ('admin', 'super_admin');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role "AdminRole" NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  display_order SMALLINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(8,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'menu_items_category_id_fkey'
  ) THEN
    ALTER TABLE menu_items
      ADD CONSTRAINT menu_items_category_id_fkey
      FOREIGN KEY (category_id)
      REFERENCES menu_categories(id)
      ON DELETE RESTRICT;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS menu_categories_name_lower_unique
ON menu_categories (LOWER(name));

CREATE UNIQUE INDEX IF NOT EXISTS menu_categories_slug_unique
ON menu_categories (slug);

CREATE UNIQUE INDEX IF NOT EXISTS menu_items_slug_unique
ON menu_items (slug);

CREATE INDEX IF NOT EXISTS menu_items_name_idx
ON menu_items (name);

CREATE INDEX IF NOT EXISTS menu_items_category_deleted_available_idx
ON menu_items (category_id, is_deleted, is_available);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menu_categories_display_order_positive'
  ) THEN
    ALTER TABLE menu_categories
      ADD CONSTRAINT menu_categories_display_order_positive
      CHECK (display_order > 0);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_price_positive'
  ) THEN
    ALTER TABLE menu_items
      ADD CONSTRAINT menu_items_price_positive
      CHECK (price > 0);
  END IF;
END
$$;
