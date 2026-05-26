-- ==========================================
-- BoostX Database Realtime Coordination Schema
-- Tables: favorites, order_tracking, driver_locations, technician_locations, customer_addresses, customer_contacts
-- ==========================================

-- 1. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" 
    ON public.favorites 
    FOR ALL 
    USING (auth.uid() = user_id);

-- 2. Order Tracking Table
CREATE TABLE IF NOT EXISTS public.order_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    status VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    eta INTEGER DEFAULT 15,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tracking data" 
    ON public.order_tracking 
    FOR SELECT 
    USING (true);

CREATE POLICY "Drivers can update tracking data" 
    ON public.order_tracking 
    FOR UPDATE 
    USING (true);

-- 3. Driver Locations Table
CREATE TABLE IF NOT EXISTS public.driver_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL,
    order_id UUID,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION DEFAULT 0.0,
    speed DOUBLE PRECISION DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read driver locations" 
    ON public.driver_locations 
    FOR SELECT 
    USING (true);

CREATE POLICY "Drivers can update their own locations" 
    ON public.driver_locations 
    FOR ALL 
    USING (true);

-- 4. Technician Locations Table
CREATE TABLE IF NOT EXISTS public.technician_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    technician_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.technician_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active technicians" 
    ON public.technician_locations 
    FOR SELECT 
    USING (true);

-- 5. Customer Addresses Table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses" 
    ON public.customer_addresses 
    FOR ALL 
    USING (auth.uid() = customer_id);

-- 6. Customer Contacts Table
CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    relation VARCHAR(100) DEFAULT 'self',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their contacts" 
    ON public.customer_contacts 
    FOR ALL 
    USING (auth.uid() = customer_id);

-- ==========================================
-- 7. Notifications Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'order', 'store_offer', 'flash_offer', 'sponsored_campaign', 'service'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    target_route VARCHAR(255),
    is_sponsored BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
    ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- 8. Notification Reads Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notification_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notification read logs"
    ON public.notification_reads
    FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- 9. Notification Campaigns Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city VARCHAR(255),
    categories VARCHAR(255),
    target_audience VARCHAR(255) DEFAULT 'all',
    sponsored_by VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notification campaigns"
    ON public.notification_campaigns
    FOR SELECT
    USING (true);

-- ==========================================
-- 10. User Notification Preferences Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    order_updates BOOLEAN DEFAULT true,
    promotional BOOLEAN DEFAULT true,
    nearby_offers BOOLEAN DEFAULT true,
    sponsored_campaigns BOOLEAN DEFAULT true,
    sound_vibe BOOLEAN DEFAULT true,
    device_token TEXT,
    platform VARCHAR(50), -- 'android', 'ios'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
    ON public.user_notification_preferences
    FOR ALL
    USING (auth.uid() = user_id);

