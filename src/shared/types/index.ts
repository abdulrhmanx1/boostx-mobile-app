// BoostX Unified Type Definitions for Shared API Layer

export interface UserProfile {
  id: string;
  role: 'customer' | 'partner' | 'driver' | 'technician' | 'admin' | 'superadmin';
  full_name?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface HomeSection {
  id: string;
  name: string;
  section_key: string;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  action_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Story {
  id: string;
  partner_id: string;
  partner_name: string;
  logo_url: string;
  media_url: string;
  tagline?: string;
  is_active: boolean;
  is_sponsored: boolean;
  viewed?: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Offer {
  id: string;
  partner_id?: string;
  title_ar: string;
  title_en: string;
  image_url: string;
  discount_percentage?: number;
  promo_code?: string;
  is_active: boolean;
  is_daily: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  partner_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_sponsored: boolean;
  created_at: string;
}

export interface Partner {
  id: string;
  owner_id: string;
  business_name: string;
  biz_type: 'store' | 'pharmacy' | 'restaurant' | 'service';
  cover_url?: string;
  logo_url?: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  working_hours?: string; // JSON string or text
  earnings?: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  partner_id: string;
  driver_id?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_lat?: number;
  delivery_lng?: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string; // 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE'
  entity_type: string; // 'banners' | 'offers' | 'products' | 'settings' etc.
  entity_id: string;
  old_value?: string; // JSON stringified
  new_value?: string; // JSON stringified
  created_at: string;
}
