-- ============================================
-- POS System Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop all tables (old Prisma names + new names) for clean re-run
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing triggers/functions to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS place_order(JSONB);

-- 2. Create new tables

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  total NUMERIC(10,2) NOT NULL,
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

-- 3. Auto-update updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $func$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cashier')
  );
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Row Level Security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: all authenticated can read
CREATE POLICY "Authenticated can read profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Categories: all authenticated can read, admin can write
CREATE POLICY "Authenticated can read categories"
  ON categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert categories"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update categories"
  ON categories FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete categories"
  ON categories FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: all authenticated can read, admin can write
CREATE POLICY "Authenticated can read products"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update products"
  ON products FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete products"
  ON products FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: all authenticated can read and create
CREATE POLICY "Authenticated can read orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (cashier_id = auth.uid());

-- Order items: all authenticated can read
CREATE POLICY "Authenticated can read order items"
  ON order_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert order items"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND cashier_id = auth.uid())
  );

-- 6. Place order RPC function (atomic checkout)
CREATE OR REPLACE FUNCTION place_order(
  p_items JSONB -- [{ "product_id": 1, "qty": 2 }, ...]
)
RETURNS INTEGER AS $func$
DECLARE
  v_order_id INTEGER;
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_price NUMERIC(10,2);
  v_stock INTEGER;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price, stock INTO v_price, v_stock
    FROM products WHERE id = (v_item->>'product_id')::int;

    IF v_price IS NULL THEN
      RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
    END IF;

    IF v_stock < (v_item->>'qty')::int THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_id';
    END IF;

    v_total := v_total + v_price * (v_item->>'qty')::int;
  END LOOP;

  INSERT INTO orders (total, cashier_id)
  VALUES (v_total, auth.uid())
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_price FROM products WHERE id = (v_item->>'product_id')::int;

    INSERT INTO order_items (order_id, product_id, qty, unit_price)
    VALUES (v_order_id, (v_item->>'product_id')::int, (v_item->>'qty')::int, v_price);

    UPDATE products
    SET stock = stock - (v_item->>'qty')::int
    WHERE id = (v_item->>'product_id')::int;
  END LOOP;

  RETURN v_order_id;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Seed data (optional: some sample categories)
INSERT INTO categories (name) VALUES ('Beverages'), ('Food'), ('Snacks')
ON CONFLICT (name) DO NOTHING;
