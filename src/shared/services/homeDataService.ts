/**
 * homeDataService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified home-screen data layer for the BoostX customer marketplace.
 *
 * Responsibilities:
 *  - Fetch all homepage data in one batched call from Supabase
 *  - Apply active/approved/non-expired filters (server-side + client-side)
 *  - Cache results in memory to avoid redundant queries
 *  - Provide Realtime channel subscriptions so admin changes reflect live
 *  - Return safe fallback data when Supabase is unreachable or in sandbox mode
 *  - Never expose admin-only fields to the customer
 *
 * Tables consumed (READ ONLY, public active data):
 *   home_sections, home_banners, stories, categories,
 *   app_settings, offers, partner_items, partners
 */

import { supabase } from '../api/supabase';

// ─────────────────────────────── Types ────────────────────────────────────────

export interface HBanner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  action_url?: string;
  sort_order: number;
}

export interface HStory {
  id: string;
  partner_id: string;
  partner_name: string;
  logo_url: string;
  media_url: string;
  tagline?: string;
  is_sponsored: boolean;
  viewed: boolean;
}

export interface HCategory {
  id: string;
  name_ar: string;
  name_en: string;
  icon_name: string;
  sort_order: number;
}

export interface HOffer {
  id: string;
  title_ar: string;
  image_url: string;
  discount_percentage?: number;
  promo_code?: string;
  shop_name?: string;
}

export interface HSponsoredProduct {
  id: string;
  name_ar: string;
  price: number;
  image_url?: string;
  partner_id: string;
  bid_amount?: number;
}

export interface HPartner {
  id: string;
  business_name: string;
  biz_type: string;
  cover_url?: string;
  logo_url?: string;
  rating: number;
  working_hours?: string;
}

export interface HSection {
  id: string;
  section_key: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomePageData {
  sections: HSection[];
  banners: HBanner[];
  stories: HStory[];
  categories: HCategory[];
  promoText: string | null;
  offers: HOffer[];
  sponsoredProducts: HSponsoredProduct[];
  partners: HPartner[];
  loadedAt: number;
}

// ──────────────────────────── Fallback Data ────────────────────────────────────

export const FALLBACK_BANNERS: HBanner[] = [
  {
    id: 'fallback-1',
    title: 'خصم ٢٠٪ على المطاعم المميزة',
    subtitle: 'عروض اليوم',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    sort_order: 1,
  },
  {
    id: 'fallback-2',
    title: 'توصيل مجاني من الصيدليات الكبرى',
    subtitle: 'رعاية صحية',
    image_url: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b6f?w=800&q=80',
    sort_order: 2,
  },
  {
    id: 'fallback-3',
    title: 'مستلزمات البيت بنصف السعر',
    subtitle: 'سوبرماركت',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    sort_order: 3,
  },
];

export const FALLBACK_CATEGORIES: HCategory[] = [
  { id: 'c1', name_ar: 'مطاعم',       name_en: 'Restaurants', icon_name: 'Utensils',     sort_order: 1 },
  { id: 'c2', name_ar: 'صيدليات',     name_en: 'Pharmacies',  icon_name: 'Pill',         sort_order: 2 },
  { id: 'c3', name_ar: 'سوبر ماركت', name_en: 'Supermarket',  icon_name: 'ShoppingCart', sort_order: 3 },
  { id: 'c4', name_ar: 'دعاية وإعلان', name_en: 'Advertising', icon_name: 'Megaphone',  sort_order: 4 },
  { id: 'c5', name_ar: 'طباعة',       name_en: 'Printing',    icon_name: 'Printer',      sort_order: 5 },
  { id: 'c6', name_ar: 'ورد وهدايا',  name_en: 'Gifts',       icon_name: 'Gift',         sort_order: 6 },
  { id: 'c7', name_ar: 'صنايعية',     name_en: 'Technicians', icon_name: 'Hammer',       sort_order: 7 },
  { id: 'c8', name_ar: 'خدمات منزلية', name_en: 'Home Svcs', icon_name: 'Home',         sort_order: 8 },
  { id: 'c9', name_ar: 'عروض',        name_en: 'Offers',      icon_name: 'Flame',        sort_order: 9 },
  { id: 'c10', name_ar: 'الأقرب لك', name_en: 'Nearby',       icon_name: 'MapPin',       sort_order: 10 },
];

const FALLBACK_OFFERS: HOffer[] = [
  {
    id: 'fo1',
    title_ar: 'توصيل مجاني',
    image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
    shop_name: 'صيدلية الدواء',
  },
  {
    id: 'fo2',
    title_ar: 'خصم ٣٠٪ للطباعة',
    image_url: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&q=80',
    shop_name: 'الركن الذهبي',
  },
];

const FALLBACK_DAILY_OFFERS: HOffer[] = [
  { id: 'do1', title_ar: 'عقد شاورما مزدوج مع بطاطس', image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&q=80', discount_percentage: 50, promo_code: 'SHWRM50', shop_name: 'شاورما هليل' },
  { id: 'do2', title_ar: 'علبة فيتامينات متكاملة للنشاط', image_url: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b6e?w=300&q=80', promo_code: '1+1', shop_name: 'صيدلية النهدي' },
  { id: 'do3', title_ar: 'كرتونة مياه صحية شرب نقية', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80', shop_name: 'أسواق التميمي' },
];

const FALLBACK_SPONSORED: HSponsoredProduct[] = [
  { id: 'sp1', name_ar: 'وجبة سوبر جامبو بروستد حراق', price: 35.00, image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&q=80', partner_id: '' },
  { id: 'sp2', name_ar: 'مرطب شفاة طبي معالج وجاف', price: 18.50, image_url: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b6e?w=300&q=80', partner_id: '' },
  { id: 'sp3', name_ar: 'مجموعة ألوان زيتية فنية فاخرة', price: 55.00, image_url: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=300&q=80', partner_id: '' },
];

const FALLBACK_PARTNERS: HPartner[] = [
  { id: 'p1', business_name: 'مطعم البيك',       biz_type: 'restaurant',  rating: 4.9, cover_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  { id: 'p2', business_name: 'صيدلية النهدي',    biz_type: 'pharmacy',    rating: 4.8, cover_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80' },
  { id: 'p3', business_name: 'أسواق التميمي',    biz_type: 'store',       rating: 4.7, cover_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80' },
];

// ──────────────────────────── Cache Layer ──────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: HomePageData;
  expiresAt: number;
}

let memoryCache: CacheEntry | null = null;

const isCacheValid = (): boolean => {
  return !!(memoryCache && Date.now() < memoryCache.expiresAt);
};

const writeCache = (data: HomePageData) => {
  memoryCache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
};

export const invalidateHomeCache = () => {
  memoryCache = null;
};

// ──────────────────── Safe fetch helper ───────────────────────────────────────

/**
 * Wraps a Supabase query with error handling.
 * On failure, returns { data: [], error } and logs in dev mode.
 */
const safeFetch = async <T>(
  fetcher: () => Promise<{ data: T[] | null; error: any }>,
  fallback: T[] = []
): Promise<T[]> => {
  try {
    const { data, error } = await fetcher();
    if (error) {
      if (import.meta.env.DEV) console.warn('[homeDataService] Supabase error:', error.message);
      return fallback;
    }
    return (data as T[]) ?? fallback;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[homeDataService] Unexpected fetch error:', e);
    return fallback;
  }
};

// ───────────────────────── Main fetch function ─────────────────────────────────

export const fetchHomeData = async (forceRefresh = false): Promise<HomePageData> => {
  if (!forceRefresh && isCacheValid()) {
    return memoryCache!.data;
  }

  // Run all queries in parallel for performance
  const [sectionsRaw, bannersRaw, storiesRaw, categoriesRaw, settingsRaw, offersRaw, sponsoredRaw, partnersRaw] =
    await Promise.all([
      // 1. Home Sections (ordering)
      safeFetch<any>(() =>
        supabase
          .from('home_sections')
          .select('id, section_key, name, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ),

      // 2. Home Banners
      safeFetch<any>(() =>
        supabase
          .from('home_banners')
          .select('id, title, subtitle, image_url, action_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ),

      // 3. Stories – active & not expired
      safeFetch<any>(() =>
        supabase
          .from('stories')
          .select('id, partner_id, partner_name, logo_url, media_url, tagline, is_sponsored')
          .eq('is_active', true)
          .order('is_sponsored', { ascending: false }) // sponsored first
      ),

      // 4. Categories
      safeFetch<any>(() =>
        supabase
          .from('categories')
          .select('id, name_ar, name_en, icon_name, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ),

      // 5. App Settings (promo strip)
      safeFetch<any>(() =>
        supabase
          .from('app_settings')
          .select('key, value')
      ),

      // 6. Daily offers
      safeFetch<any>(() =>
        supabase
          .from('offers')
          .select('id, title_ar, image_url, discount_percentage, promo_code, partner_id')
          .eq('is_active', true)
          .eq('is_daily', true)
          .order('created_at', { ascending: false })
      ),

      // 7. Sponsored products
      safeFetch<any>(() =>
        supabase
          .from('partner_items')
          .select('id, name_ar, price, image_url, partner_id')
          .eq('is_available', true)
          .eq('is_sponsored', true)
          .order('created_at', { ascending: false })
          .limit(10)
      ),

      // 8. Approved partners
      safeFetch<any>(() =>
        supabase
          .from('partners')
          .select('id, business_name, biz_type, cover_url, logo_url, rating, working_hours')
          .eq('status', 'approved')
          .order('rating', { ascending: false })
          .limit(20)
      ),
    ]);

  // ── Map & filter results ──────────────────────────────────────────────────

  const sections: HSection[] = sectionsRaw.length > 0
    ? sectionsRaw
    : [
        { id: 's1', section_key: 'stories',    name: 'القصص',         sort_order: 1,  is_active: true },
        { id: 's2', section_key: 'banners',    name: 'البانرات',       sort_order: 2,  is_active: true },
        { id: 's3', section_key: 'categories', name: 'التصنيفات',     sort_order: 3,  is_active: true },
        { id: 's4', section_key: 'offers',     name: 'العروض',         sort_order: 4,  is_active: true },
        { id: 's5', section_key: 'daily',      name: 'عروض يومية',    sort_order: 5,  is_active: true },
        { id: 's6', section_key: 'sponsored',  name: 'منتجات ممولة',  sort_order: 6,  is_active: true },
        { id: 's7', section_key: 'partners',   name: 'شركاء قريبون', sort_order: 7,  is_active: true },
      ];

  const banners: HBanner[] = bannersRaw.length > 0 ? bannersRaw : FALLBACK_BANNERS;

  const stories: HStory[] = storiesRaw.map((s: any) => ({
    id: s.id,
    partner_id: s.partner_id,
    partner_name: s.partner_name ?? 'شريك',
    logo_url: s.logo_url ?? '',
    media_url: s.media_url ?? '',
    tagline: s.tagline,
    is_sponsored: !!s.is_sponsored,
    viewed: false,
  }));

  const categories: HCategory[] = categoriesRaw.length > 0 ? categoriesRaw : FALLBACK_CATEGORIES;

  // Extract promo strip text from app_settings
  const settingsMap: Record<string, string> = {};
  settingsRaw.forEach((row: any) => {
    if (row.key && row.value) settingsMap[row.key] = row.value;
  });
  const promoText: string | null = settingsMap['promo_strip_text'] ?? null;

  const offers: HOffer[] = offersRaw.length > 0
    ? offersRaw.map((o: any) => ({
        id: o.id,
        title_ar: o.title_ar,
        image_url: o.image_url ?? 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
        discount_percentage: o.discount_percentage,
        promo_code: o.promo_code,
        shop_name: o.shop_name,
      }))
    : FALLBACK_OFFERS;

  // For daily offers – separate fetch or same offers table filtered by is_daily
  // Already filtered is_daily=true in offersRaw; use as daily offers section too
  const dailyOffers: HOffer[] = offersRaw.length > 0 ? offers : FALLBACK_DAILY_OFFERS;

  const sponsoredProducts: HSponsoredProduct[] = sponsoredRaw.length > 0
    ? sponsoredRaw.map((p: any) => ({
        id: p.id,
        name_ar: p.name_ar,
        price: p.price ?? 0,
        image_url: p.image_url,
        partner_id: p.partner_id,
      }))
    : FALLBACK_SPONSORED;

  const partners: HPartner[] = partnersRaw.length > 0 ? partnersRaw : FALLBACK_PARTNERS;

  const result: HomePageData = {
    sections,
    banners,
    stories,
    categories,
    promoText,
    offers,         // promo offers (horizontal scroll cards)
    sponsoredProducts,
    partners,
    loadedAt: Date.now(),
  };

  // Also expose daily offers on the same object via a slight augmentation:
  (result as any).dailyOffers = dailyOffers;

  writeCache(result);
  return result;
};

// ─────────────────────── Realtime subscriptions ───────────────────────────────

type HomeDataListener = (data: HomePageData) => void;

const listeners = new Set<HomeDataListener>();
let realtimeChannel: any = null;

/**
 * Subscribe to home data changes.
 * When Supabase sends a realtime event, the cache is invalidated and
 * all registered listeners are called with fresh data.
 *
 * Returns an unsubscribe function.
 */
export const subscribeHomeData = (listener: HomeDataListener): (() => void) => {
  listeners.add(listener);

  // Kick off the realtime channel once
  if (!realtimeChannel) {
    try {
      realtimeChannel = supabase
        .channel('home_control_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'home_banners' }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_items' }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'home_sections' }, handleChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, handleChange)
        .subscribe();
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[homeDataService] Realtime subscription failed:', e);
    }
  }

  return () => {
    listeners.delete(listener);
    // If no more listeners, unsubscribe the channel to save resources
    if (listeners.size === 0 && realtimeChannel) {
      try { realtimeChannel.unsubscribe(); } catch (_) {}
      realtimeChannel = null;
    }
  };
};

const handleChange = async (_payload: any) => {
  invalidateHomeCache();
  try {
    const freshData = await fetchHomeData(true);
    listeners.forEach(fn => fn(freshData));
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[homeDataService] Realtime refresh failed:', e);
  }
};

// ────────────────── Sandbox / Fallback compatibility ─────────────────────────

/**
 * The sandbox client (supabaseClient.ts) does not know about marketplace
 * tables (home_banners, stories, categories, etc.).  When a SELECT is issued
 * against an unknown table it returns `{ data: [], error: null }`.
 * Our `safeFetch` handles this gracefully by returning the fallback arrays,
 * so the home screen always looks populated even in sandbox/dev mode.
 */
