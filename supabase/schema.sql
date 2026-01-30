-- Create ENUMs
CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE public.order_status AS ENUM ('PENDING_PAYMENT', 'WAITING_APPROVAL', 'COMPLETED', 'REJECTED', 'CANCELLED');
CREATE TYPE public.account_status AS ENUM ('AVAILABLE', 'RESERVED', 'DELIVERED', 'INVALID', 'REPLACED');
CREATE TYPE public.ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED');

-- Create Tables
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    min_purchase INTEGER DEFAULT 1 NOT NULL,
    max_purchase INTEGER,
    warranty_info TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL, -- Format: username|password|2fa|...
    content_hash TEXT NOT NULL, -- sha256 of content to prevent duplicates
    status account_status DEFAULT 'AVAILABLE' NOT NULL,
    order_id UUID, -- Links to orders table when delivered
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, content_hash)
);

CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    order_code TEXT UNIQUE NOT NULL, -- e.g. MMO-123456
    status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
    payment_proof_url TEXT,
    admin_note TEXT,
    download_token UUID DEFAULT gen_random_uuid(),
    download_expires_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal = unit_price * quantity),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

CREATE TABLE public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status ticket_status DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Automated Updated At Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = NOW();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at_inventory BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Helper Functions for Role Checking (to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT public.get_user_role(auth.uid()) = 'admin';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT public.get_user_role(auth.uid()) IN ('admin', 'staff');
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories & Products Policies
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Everyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories/products" ON public.products FOR ALL USING (public.is_admin());

-- Inventory Policies
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL USING (public.is_staff());

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update payment proof" ON public.orders FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'PENDING_PAYMENT')
    WITH CHECK (auth.uid() = user_id AND (status = 'PENDING_PAYMENT' OR status = 'WAITING_APPROVAL'));

CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.is_staff());

-- Order Items Policies
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_staff());

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, COALESCE(new.email, 'user_' || substr(new.id::text, 1, 8) || '@mmo.com'));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sync email changes from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET email = new.email
    WHERE id = new.id;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- Improved Order Approval Function
CREATE OR REPLACE FUNCTION public.approve_order(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
    v_order_status public.order_status;
    v_item RECORD;
    v_row_count INTEGER;
BEGIN
    -- 1. Security Check: Only admin or staff
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- 2. Lock order and check status
    SELECT status INTO v_order_status
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_order_status != 'WAITING_APPROVAL' THEN
        RAISE EXCEPTION 'Order is not in WAITING_APPROVAL status';
    END IF;

    -- 3. Fulfill items one by one
    FOR v_item IN (SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
        -- Allocate inventory using FOR UPDATE SKIP LOCKED
        WITH selected_items AS (
            SELECT id FROM public.inventory
            WHERE product_id = v_item.product_id AND status = 'AVAILABLE'
            ORDER BY created_at ASC
            LIMIT v_item.quantity
            FOR UPDATE SKIP LOCKED
        )
        UPDATE public.inventory
        SET status = 'DELIVERED', order_id = p_order_id, updated_at = NOW()
        WHERE id IN (SELECT id FROM selected_items);

        -- 4. Check if we actually updated the required quantity
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        
        IF v_row_count < v_item.quantity THEN
            RAISE EXCEPTION 'Not enough stock for product ID: % (%)', v_item.product_id, v_item.quantity;
        END IF;
    END LOOP;

    -- 5. Finalize order
    UPDATE public.orders
    SET 
        status = 'COMPLETED', 
        download_expires_at = NOW() + INTERVAL '48 hours',
        updated_at = NOW()
    WHERE id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke public access
REVOKE EXECUTE ON FUNCTION public.approve_order(UUID) FROM PUBLIC, anon, authenticated;
-- Grant access to authenticated users (role check inside function handles security)
GRANT EXECUTE ON FUNCTION public.approve_order(UUID) TO authenticated;
