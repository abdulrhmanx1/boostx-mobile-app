import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Star, Clock, MapPin, 
  Utensils, Pill, ShoppingCart, Megaphone, Printer, Gift, Hammer, Home as HomeIcon,
  Phone, Briefcase, Truck, ArrowRight, ShieldCheck, ChevronLeft, Flame, Sparkles, Heart
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// Live Ticking Premium Flash Offer Card Component
const FlashOfferCard = ({ offer, onClick }: { offer: any, onClick: () => void }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(offer.sponsored_until) - +new Date();
      let timeLeftStr = '00:00:00';

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        timeLeftStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      setTimeLeft(timeLeftStr);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [offer.sponsored_until]);

  return (
    <motion.div 
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{ 
        flexShrink: 0, 
        width: 250, 
        background: '#ffffff', 
        border: '1px solid #eef2f6', 
        borderRadius: 20, 
        overflow: 'hidden', 
        direction: 'rtl', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
        position: 'relative',
        cursor: 'pointer',
        boxSizing: 'border-box'
      }}
    >
      {/* Product Image Cover with badges */}
      <div style={{ height: 110, position: 'relative', overflow: 'hidden' }}>
        <img src={offer.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 80%)' }} />
        
        {/* Sponsored Badge */}
        <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(124, 58, 237, 0.9)', backdropFilter: 'blur(8px)', color: 'white', fontSize: '0.58rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Sparkles size={8} fill="white" />
          <span>ممول</span>
        </span>

        {/* Discount Badge */}
        <span style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: 'white', fontSize: '0.62rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>
          {offer.discount_percent}% خصم
        </span>

        {/* Live Timer Strip */}
        <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', color: '#f87171', fontSize: '0.62rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: 8, fontFamily: 'monospace' }}>
          {timeLeft}
        </span>
      </div>

      {/* Store Logo + Info Area */}
      <div style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', boxSizing: 'border-box' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124, 58, 237, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, border: '1px solid #eef2f6' }}>
          {offer.store_logo}
        </div>
        <div style={{ flex: 1, textAlign: 'right', overflow: 'hidden' }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 900, color: '#1e0b36', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.title}</h4>
          <span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', marginTop: 2, fontWeight: 'bold' }}>{offer.store_name}</span>
        </div>
      </div>

      {/* Price + CTA Footer */}
      <div style={{ padding: '0 12px 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.94rem', fontWeight: 950, color: '#7c3aed' }}>{offer.new_price} ر.س</span>
          <span style={{ fontSize: '0.74rem', color: '#ef4444', textDecoration: 'line-through', fontWeight: 'bold' }}>{offer.old_price} ر.س</span>
        </div>
        <button style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', border: 'none', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', outline: 'none', boxShadow: '0 2px 6px rgba(124, 58, 237, 0.2)' }}>
          احصل الآن
        </button>
      </div>
    </motion.div>
  );
};

export const HomeScreen = ({ 
  currentUser, 
  onPartnerClick, 
  onSearchClick, 
  onNotificationsClick,
  onTrackOrderClick,
  onAdsManagerClick,
  onCartClick,
  onFavoritesClick,
  onOfferClick,
  onListingViewAllClick,
  onViewSponsoredAllClick
}: { 
  currentUser: any, 
  onPartnerClick: (partner: any) => void, 
  onSearchClick: () => void, 
  onNotificationsClick: () => void,
  onTrackOrderClick: (orderId?: string) => void,
  onAdsManagerClick?: () => void,
  onCartClick?: () => void,
  onFavoritesClick?: () => void,
  onOfferClick?: (offer: any) => void,
  onListingViewAllClick?: (sectionType: 'restaurants' | 'pharmacies' | 'offers' | 'products') => void,
  onViewSponsoredAllClick?: () => void
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fallback states
  const fallbackAds = [
    { id: 1, title: 'عروض الملقا الكبرى 🍕', subtitle: 'احصل على وجبتين بسعر واحدة من المتاجر المشاركة اليوم فقط', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', color: 'linear-gradient(135deg, #701a75 0%, #1e1b4b 100%)' }
  ];

  const fallbackStories = [
    { id: 1, partner: 'نيون برجر', type: 'image', media: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', label: 'خصم ٥٠٪ 🔥', viewed: false }
  ];

  const fallbackCategories = [
    { id: 'food', name: 'مطاعم', icon: 'Utensils', bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', is_active: true },
    { id: 'pharmacy', name: 'صيدليات', icon: 'Pill', bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', is_active: true },
    { id: 'supermarket', name: 'تموينات', icon: 'ShoppingCart', bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', is_active: true },
    { id: 'agency', name: 'دعاية وإعلان', icon: 'Megaphone', bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', is_active: true },
    { id: 'print', name: 'مطابع', icon: 'Printer', bg: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', is_active: true },
    { id: 'flowers', name: 'هدايا وورد', icon: 'Gift', bg: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', is_active: true },
    { id: 'craftsman', name: 'صنايعية', icon: 'Hammer', bg: 'rgba(107, 114, 128, 0.12)', color: '#a8a29e', is_active: true },
    { id: 'home_services', name: 'خدمات منزلية', icon: 'HomeIcon', bg: 'rgba(20, 184, 166, 0.12)', color: '#14B8A6', is_active: true }
  ];

  const fallbackOffers = [
    {
      id: 'd1',
      store_id: 'p1',
      store_name: 'مطعم البيك الرواد',
      store_logo: '🍗',
      product_id: 'o101',
      title: 'خصم ٤٠٪ للوجبة العائلية الحارّة بالكامل',
      discount_percent: 40,
      sponsored_until: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(),
      priority: 1,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      old_price: 58.00,
      new_price: 35.00,
      description: 'استمتع بالوجبة العائلية الأكثر طلباً وشهرة في المملكة من دجاج البيك الحراق والمقرمش المكون من ١٢ قطعة مع البطاطس وصلصة الثوم الأسطورية والخبز الطازج.',
      rating: 4.9,
      stock_status: 'available',
      delivery_time: '١٥-٢٠ دقيقة',
      images: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80'
      ],
      addons: [],
      variants: []
    },
    {
      id: 'd2',
      store_id: 'p2',
      store_name: 'صيدلية النهدي الياسمين',
      store_logo: '💊',
      product_id: 'o201',
      title: 'خصم ٥٠٪ علبة مكمل فيتامين سي فوار للنشاط',
      discount_percent: 50,
      sponsored_until: new Date(Date.now() + 3.2 * 60 * 60 * 1000).toISOString(),
      priority: 2,
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80',
      old_price: 36.00,
      new_price: 18.00,
      description: 'احصل على الطاقة والحيوية لجسمك وصحتك اليومية مع فوار فيتامين سي ١٠٠٠ ملغ سريع الامتصاص والخالي من السكر لحمايتك ودعم مناعتك.',
      rating: 4.8,
      stock_status: 'low',
      delivery_time: '١٠-١٢ دقيقة',
      images: [
        'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80'
      ],
      addons: [],
      variants: []
    }
  ];

  const fallbackPartners = [
    { id: 'p1', name: 'مطعم البيك', category: 'مطاعم', rating: 4.9, reviews: '١٢.٥ ألف تقييم', distance: '١.٢ كم', time: '١٥-٢٥ دقيقة', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', sponsored: true, is_active: true },
    { id: 'p2', name: 'صيدلية النهدي', category: 'صيدليات', rating: 4.8, reviews: '٥.٢ ألف تقييم', distance: '٢.٥ كم', time: '١٠-٢٠ دقيقة', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80', sponsored: false, is_active: true },
    { id: 'p3', name: 'أسواق التميمي', category: 'تموينات', rating: 4.7, reviews: '٨.١ ألف تقييم', distance: '٣.١ كم', time: '٢٠-٣٠ دقيقة', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80', sponsored: false, is_active: true },
    { id: 'p4', name: 'الركن الذهبي للطباعة', category: 'مطابع', rating: 4.9, reviews: '٩٠٠ تقييم', distance: '١.٨ كم', time: '٤٥-٦٠ دقيقة', image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&q=80', sponsored: true, is_active: true }
  ];

  // Dynamic connected database states
  const [stories, setStories] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [partnersNearby, setPartnersNearby] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [flashOffers, setFlashOffers] = useState<any[]>([]);
  const [sponsoredProducts, setSponsoredProducts] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [ordersEmpty, setOrdersEmpty] = useState(false);
  const [promoText, setPromoText] = useState<{ title: string; subtitle: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      if (!supabase) return;

      // 1. Fetch Campaigns (stories, banners & promo alert)
      const { data: campaignsData } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'approved');

      if (campaignsData && campaignsData.length > 0) {
        // Banners
        const fetchedBanners = campaignsData
          .filter((c: any) => c.placement === 'banners')
          .map((c: any) => ({
            id: c.id,
            title: c.title || 'عرض خاص 🍕',
            subtitle: c.tagline,
            image: c.image_url,
            color: c.color || 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)'
          }));
        setAds(fetchedBanners.length > 0 ? fetchedBanners : fallbackAds);

        // Stories
        const fetchedStories = campaignsData
          .filter((c: any) => c.placement === 'stories')
          .map((c: any) => ({
            id: c.id,
            partner: c.partner_name || 'بوسط إكس',
            type: 'image',
            media: c.image_url,
            label: c.tagline || 'عروض مميزة 🔥',
            viewed: false
          }));
        setStories(fetchedStories.length > 0 ? fetchedStories : fallbackStories);

        // Promo alert strip
        const promoCampaign = campaignsData.find((c: any) => c.placement === 'promo_strip') || campaignsData.find((c: any) => c.placement === 'banners');
        if (promoCampaign) {
          setPromoText({
            title: promoCampaign.title || promoCampaign.tagline || 'عروض مواسم السعودية الحصرية حية 🎟️',
            subtitle: promoCampaign.tagline || 'خصومات حصرية وطلب فعاليات فوري'
          });
        } else {
          setPromoText(null);
        }
      } else {
        setAds(fallbackAds);
        setStories(fallbackStories);
        setPromoText(null);
      }

      // 2. Fetch Categories (dynamic is_active filter)
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      if (categoriesData && categoriesData.length > 0) {
        const activeCategories = categoriesData.filter((c: any) => c.is_active !== false);
        setCategoriesList(activeCategories.length > 0 ? activeCategories : fallbackCategories);
      } else {
        setCategoriesList(fallbackCategories);
      }

      // 3. Fetch Partners (featured stores, is_active check)
      const { data: partnersData } = await supabase
        .from('partners')
        .select('*');

      if (partnersData && partnersData.length > 0) {
        const mappedPartners = partnersData.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category || (p.biz_type === 'restaurant' ? 'مطاعم' : p.biz_type === 'pharmacy' ? 'صيدليات' : p.biz_type === 'grocery' ? 'تموينات' : 'مطابع'),
          rating: Number(p.rating || 4.8),
          reviews: p.reviews || '٥٠٠ تقييم',
          distance: p.distance || '٢.٠ كم',
          time: p.time || '١٥-٢٠ دقيقة',
          image: p.image || p.cover_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
          sponsored: !!p.sponsored,
          is_active: p.is_active !== false
        }));
        setPartnersNearby(mappedPartners);
      } else {
        setPartnersNearby(fallbackPartners);
      }

      // 4. Fetch Sponsored Products & Flash Offers
      const { data: sponsoredData } = await supabase
        .from('sponsored_products')
        .select('*')
        .eq('is_active', true);

      if (sponsoredData && sponsoredData.length > 0) {
        const mappedOffers = sponsoredData.map((o: any) => ({
          id: o.id,
          title: o.title,
          image_url: o.image_url,
          discount_percent: o.discount_percent || 50,
          store_logo: o.store_logo || '🍔',
          store_name: o.store_name || o.sponsored_by,
          new_price: o.new_price,
          old_price: o.old_price,
          sponsored_until: o.expires_at || new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
          description: o.description || o.title,
          rating: o.rating || 4.9,
          delivery_time: o.delivery_time || '١٥-٢٠ دقيقة',
          images: o.images || [o.image_url]
        }));

        setFlashOffers(mappedOffers.filter((o: any) => o.discount_percent >= 50));
        setSponsoredProducts(mappedOffers);
      } else {
        setFlashOffers(fallbackOffers);
        setSponsoredProducts(fallbackOffers);
      }

      // 5. Fetch Active Order
      const currentCustId = currentUser?.id || 'usr_cust_1';
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', currentCustId)
        .order('created_at', { ascending: false });

      if (ordersData && ordersData.length > 0) {
        setOrdersEmpty(false);
        const activeItem = ordersData.find((o: any) => 
          o.status !== 'delivered' && 
          o.status !== 'تم التوصيل للعميل' && 
          o.status !== 'cancelled' && 
          o.status !== 'ملغي'
        );
        setActiveOrder(activeItem || null);
      } else {
        setOrdersEmpty(true);
        setActiveOrder(null);
      }

    } catch (err) {
      console.error('Error fetching dynamic home page connection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();

    // Set up Realtime subscriptions for all 9 components
    const campaignsChannel = supabase.channel('realtime:home_campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ad_campaigns' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const categoriesChannel = supabase.channel('realtime:home_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const partnersChannel = supabase.channel('realtime:home_partners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const sponsoredChannel = supabase.channel('realtime:home_sponsored')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsored_products' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const ordersChannel = supabase.channel('realtime:home_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchHomeData();
      })
      .subscribe();

    return () => {
      campaignsChannel.unsubscribe();
      categoriesChannel.unsubscribe();
      partnersChannel.unsubscribe();
      sponsoredChannel.unsubscribe();
      ordersChannel.unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('read', false);
        if (!error && data) {
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();

    const notifChannel = supabase.channel('realtime:home_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      notifChannel.unsubscribe();
    };
  }, []);

  // Story progression effect
  useEffect(() => {
    let interval: any;
    if (activeStoryIndex !== null) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            if (activeStoryIndex < stories.length - 1) {
              setStories(curr => curr.map((s, idx) => idx === activeStoryIndex ? { ...s, viewed: true } : s));
              setActiveStoryIndex(activeStoryIndex + 1);
            } else {
              setStories(curr => curr.map((s, idx) => idx === activeStoryIndex ? { ...s, viewed: true } : s));
              setActiveStoryIndex(null);
            }
            return 0;
          }
          return prev + 2.5;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [activeStoryIndex, stories.length]);

  // Hero banner auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #15052b 0%, #2e0854 100%)', color: 'white', fontFamily: 'Cairo, sans-serif' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c084fc', marginBottom: 16 }}
        />
        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>جاري مزامنة واجهة بوسط إكس...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ background: '#f8f9fc', minHeight: '100vh', paddingBottom: '110px', textAlign: 'right', fontFamily: 'Cairo, sans-serif', position: 'relative', overflowX: 'hidden' }}
    >
      {/* Premium Injected Styles for Floating vector elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-icon-slow {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.05; }
          50% { transform: translateY(-20px) rotate(15deg); opacity: 0.12; }
          100% { transform: translateY(0px) rotate(0deg); opacity: 0.05; }
        }
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
          85% { transform: rotate(-2deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .bell-icon-pulse {
          animation: bell-ring 1.8s infinite ease-in-out;
          transform-origin: top center;
        }
        .bell-badge-pulse {
          animation: pulse-ring 2s infinite ease-in-out;
        }
        .bell-button-glow:hover {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.7) !important;
          background: rgba(124, 58, 237, 0.3) !important;
        }
        @keyframes moving-grid {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .cinematic-sponsored-section {
          background: linear-gradient(135deg, #1b0a2e 0%, #0d0418 100%);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: 28px;
          padding: 24px 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(26, 8, 48, 0.4), inset 0 1px 3px rgba(255,255,255,0.05);
        }
        .cinematic-grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          background-image: linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 85, 247, 0.3) 1px, transparent 1px);
          background-size: 20px 20px;
          transform: perspective(500px) rotateX(60deg) scale(1.6) translateY(-50px);
          transform-origin: top center;
          animation: moving-grid 8s linear infinite;
          pointer-events: none;
        }
        .cinematic-glow-light {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 80%);
          filter: blur(40px);
          top: -150px;
          left: -100px;
          pointer-events: none;
        }
        .cinematic-glow-light-2 {
          position: absolute;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%);
          filter: blur(35px);
          bottom: -100px;
          right: -80px;
          pointer-events: none;
        }
        .sponsored-card-glass {
          flex-shrink: 0;
          width: 172px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          direction: rtl;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px 0 rgba(13, 4, 24, 0.37);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }
        .sponsored-card-glass:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(168, 85, 247, 0.4);
          box-shadow: 0 12px 35px rgba(168, 85, 247, 0.22);
        }
        .bg-vector-icon {
          position: absolute;
          color: #7c3aed;
          pointer-events: none;
          z-index: 0;
          animation: float-icon-slow 8s infinite ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* Floating Decorative Vector Icons behind content (subtle) */}
      <Utensils className="bg-vector-icon" size={44} style={{ top: '35%', left: '8%', animationDelay: '0s' }} />
      <Pill className="bg-vector-icon" size={40} style={{ top: '65%', right: '5%', animationDelay: '2s' }} />
      <Hammer className="bg-vector-icon" size={42} style={{ top: '78%', left: '10%', animationDelay: '4s' }} />
      <Gift className="bg-vector-icon" size={38} style={{ top: '90%', right: '12%', animationDelay: '1s' }} />

      {/* 
        =====================================================================
        PART 1: PREMIUM GLOSSY CURVED PURPLE HEADER (Starts from the very top)
        =====================================================================
      */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #2e0854 0%, #15052b 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          paddingBottom: '32px',
          borderBottomLeftRadius: '36px',
          borderBottomRightRadius: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(21, 5, 43, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10
        }}
      >
        {/* Glow & reflections */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)', filter: 'blur(35px)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)', filter: 'blur(30px)', bottom: '-10%', right: '-10%', pointerEvents: 'none' }} />
        
        {/* Shiny glass reflection overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)', pointerEvents: 'none' }} />

        {/* 1. Top Level Bar: Logo & Location Row & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 14px 20px', direction: 'rtl' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 950, color: 'white' }}>B</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.45)', display: 'block', fontWeight: 700 }}>التوصيل إلى 📍</span>
              <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                حي الملقا، الرياض <ChevronLeft size={12} color="#c084fc" />
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Premium Liquid Glass Notification Bell Button with Purple Glow */}
            <button 
              onClick={onNotificationsClick}
              className="bell-button-glow"
              style={{ 
                background: 'rgba(124, 58, 237, 0.15)', 
                border: '1px solid rgba(168, 85, 247, 0.4)', 
                color: 'white', 
                cursor: 'pointer', 
                width: 38, 
                height: 38, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transition: 'all 0.3s ease', 
                position: 'relative', 
                outline: 'none',
                boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Bell size={16} className={unreadCount > 0 ? "bell-icon-pulse" : ""} />
              {unreadCount > 0 && (
                <span className="bell-badge-pulse" style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', color: 'white', fontSize: '0.58rem', fontWeight: 'bold', width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 6px #ef4444' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={onFavoritesClick}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', outline: 'none' }}
            >
              <Heart size={16} />
            </button>
            <button 
              onClick={onCartClick}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', position: 'relative', outline: 'none' }}
            >
              <ShoppingCart size={16} />
              <span style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', color: 'white', fontSize: '0.58rem', fontWeight: 'bold', width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>٢</span>
            </button>
          </div>
        </div>

        {/* 2. Search Bar with glass blur */}
        <div style={{ padding: '0 20px 18px 20px' }}>
          <div 
            onClick={onSearchClick}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              direction: 'rtl',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            <Search size={16} color="rgba(255,255,255,0.5)" />
            <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.78rem', fontWeight: 800 }}>ابحث عن مطعم، صيدلية، سباك، أو مطبعة...</span>
          </div>
        </div>

        {/* 3. Stories Highlights Row */}
        <div style={{ width: '100%', overflow: 'hidden', marginBottom: '18px' }}>
          <div 
            className="stories-scroll no-scrollbar" 
            style={{ 
              display: 'flex', 
              gap: 12, 
              overflowX: 'auto', 
              padding: '2px 20px', 
              direction: 'rtl'
            }}
          >
            {/* Add Story button for admins */}
            {['partner', 'admin', 'superadmin'].includes(currentUser?.role) && onAdsManagerClick && (
              <div onClick={onAdsManagerClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0, width: 60 }}>
                <div style={{ width: 56, height: 56, borderRadius: '18px', background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(168,85,247,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                  <span style={{ fontSize: '1.2rem', color: '#c084fc', fontWeight: 900 }}>+</span>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>أعلن هنا</span>
              </div>
            )}

            {/* Stories list */}
            {stories.map((story, idx) => (
              <div key={story.id} onClick={() => setActiveStoryIndex(idx)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0, width: 60 }}>
                <div style={{ width: 56, height: 56, borderRadius: '18px', background: '#120b1f', border: '2px solid ' + (story.viewed ? 'rgba(255,255,255,0.15)' : '#c084fc'), padding: 2.5, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  <img src={story.media} alt={story.partner} style={{ width: '100%', height: '100%', borderRadius: '13px', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginTop: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{story.partner}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Saudi Season Live Event Ticket Alert (Promo Strip) */}
        <div style={{ padding: '0 20px 16px 20px' }}>
          <div 
            onClick={() => onTrackOrderClick(activeOrder?.id || 'order-101')}
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '16px', 
              padding: '10px 14px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              direction: 'rtl',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: 'white', display: 'block' }}>
                  {promoText ? promoText.title : 'عروض مواسم السعودية الحصرية حية 🎟️'}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginTop: 1 }}>
                  {promoText ? promoText.subtitle : 'خصومات حصرية وطلب فعاليات فوري'}
                </span>
              </div>
            </div>
            <ChevronLeft size={14} color="#10b981" />
          </div>
        </div>

        {/* 5. Active Order Tracking Card (Floating at bottom of header) */}
        {activeOrder && (
          <div style={{ padding: '0 20px' }}>
            <div 
              onClick={() => onTrackOrderClick(activeOrder?.id || 'order-101')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                borderRadius: '18px', 
                padding: '12px 16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                cursor: 'pointer',
                direction: 'rtl',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>🛵</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: 'white', display: 'block' }}>
                    {activeOrder ? `طلب رقم #${activeOrder.id.substring(activeOrder.id.length - 6)} نشط حالياً` : 'تتبع طلبك النشط حالياً'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginTop: 1 }}>
                    {activeOrder ? `${activeOrder.driver_name ? `المندوب ${activeOrder.driver_name} - ` : ''}الحالة: ${activeOrder.status}` : 'المندوب أحمد محمد يقترب من موقعك الحالي'}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
                {activeOrder ? 'تتبع' : 'نشط'} <ChevronLeft size={12} color="#10b981" />
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 
        =====================================================================
        PART 2: WHITE CONTENT AREA (Starts right after the curve)
        =====================================================================
      */}
      <div style={{ padding: '24px 20px 0 20px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Fixed Proportions Hero Banner Carousel */}
        <section style={{ position: 'relative' }}>
          <div style={{ width: '100%', height: 154, borderRadius: 20, overflow: 'hidden', background: ads[activeHeroIndex].color, position: 'relative', display: 'flex', direction: 'rtl', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
              <div>
                <span style={{ fontSize: '0.58rem', background: 'rgba(168,85,247,0.25)', color: '#c084fc', padding: '2px 8px', borderRadius: 10, fontWeight: 900, border: '1px solid rgba(168,85,247,0.3)' }}>عروض حية 🏷️</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginTop: 6, lineHeight: 1.3 }}>{ads[activeHeroIndex].title}</h3>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', marginTop: 2, lineHeight: 1.3 }}>{ads[activeHeroIndex].subtitle}</p>
              </div>
              <button className="btn btn-primary" style={{ padding: '4px 12px', borderRadius: 8, border: 'none', fontSize: '0.7rem', fontWeight: 900, width: 'fit-content', boxShadow: 'none' }}>اطلب الآن 🚀</button>
            </div>
            <div style={{ width: '38%', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, ' + ads[activeHeroIndex].color.split(' ')[2] + ', transparent)' }}></div>
              <img src={ads[activeHeroIndex].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 10 }}>
            {ads.map((_, i) => (
              <div key={i} onClick={() => setActiveHeroIndex(i)} style={{ width: i === activeHeroIndex ? 18 : 5, height: 5, borderRadius: 2.5, background: i === activeHeroIndex ? '#7c3aed' : 'rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.3s ease' }}></div>
            ))}
          </div>
        </section>

        {/* Daily Offers Flash Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, direction: 'rtl' }}>
            <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36', display: 'flex', alignItems: 'center', gap: 4 }}>عروض فلاش الحارّة اليومية <Flame size={14} color="#ef4444" fill="#ef4444" /></span>
            <span onClick={() => onListingViewAllClick?.('offers')} style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 800, cursor: 'pointer' }}>شاهد الكل</span>
          </div>
          
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, paddingLeft: 4, paddingRight: 4 }} className="no-scrollbar">
            {flashOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280', width: '100%', fontSize: '0.78rem', background: '#ffffff', borderRadius: 16, border: '1px solid #eef2f6' }}>لا توجد عروض نشطة حالياً 🏷️</div>
            ) : (
              flashOffers.map(offer => (
                <FlashOfferCard 
                  key={offer.id}
                  offer={offer}
                  onClick={() => onOfferClick?.(offer)}
                />
              ))
            )}
          </div>
        </section>

        {/* Polished 8 Categories Grid */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, direction: 'rtl' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36' }}>ماذا تريد أن تطلب اليوم؟</h3>
            <span onClick={() => onListingViewAllClick?.('restaurants')} style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 800, cursor: 'pointer' }}>شاهد الكل</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {categoriesList.map(cat => {
              const renderCategoryIcon = (iconName: string) => {
                switch (iconName) {
                  case 'Utensils': return <Utensils size={22} />;
                  case 'Pill': return <Pill size={22} />;
                  case 'ShoppingCart': return <ShoppingCart size={22} />;
                  case 'Megaphone': return <Megaphone size={22} />;
                  case 'Printer': return <Printer size={22} />;
                  case 'Gift': return <Gift size={22} />;
                  case 'Hammer': return <Hammer size={22} />;
                  case 'HomeIcon': return <HomeIcon size={22} />;
                  default: return <Sparkles size={22} />;
                }
              };

              return (
                <div 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 6, 
                    cursor: 'pointer',
                    transform: selectedCategory === cat.name ? 'scale(1.05)' : 'none',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 16, 
                      background: cat.bg || 'rgba(124, 58, 237, 0.05)', 
                      color: cat.color || '#7c3aed', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: selectedCategory === cat.name ? `2px solid ${cat.color || '#7c3aed'}` : '1px solid rgba(0,0,0,0.03)',
                      boxShadow: selectedCategory === cat.name ? `0 4px 10px rgba(0,0,0,0.05)` : 'none'
                    }}
                  >
                    {renderCategoryIcon(cat.icon)}
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#374151', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', textAlign: 'center' }}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cinematic Sponsored Products Section: "منتجات بخصومات عالية" */}
        {sponsoredProducts.length > 0 && (
          <section className="cinematic-sponsored-section">
            {/* Background elements */}
            <div className="cinematic-grid-bg" />
            <div className="cinematic-glow-light" />
            <div className="cinematic-glow-light-2" />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, direction: 'rtl', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 950, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#c084fc" fill="#c084fc" />
                <span>منتجات بخصومات عالية</span>
              </span>
              <span 
                onClick={onViewSponsoredAllClick}
                style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
              >
                شاهد الكل
              </span>
            </div>

            {/* Horizontally scrollable list */}
            <div 
              style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, position: 'relative', zIndex: 2 }} 
              className="no-scrollbar"
            >
              {sponsoredProducts.map(prod => (
                <motion.div 
                  key={prod.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onOfferClick?.(prod)}
                  className="sponsored-card-glass"
                >
                  {/* LARGE Product Image */}
                  <div style={{ height: 116, position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <img src={prod.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {/* Discount Badge */}
                    <span style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: 'white', fontSize: '0.62rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>
                      {prod.discount_percent}% خصم
                    </span>

                    {/* Sponsored Badge */}
                    <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(168, 85, 247, 0.85)', backdropFilter: 'blur(6px)', color: 'white', fontSize: '0.55rem', fontWeight: 900, padding: '2px 5px', borderRadius: 5 }}>
                      ممول
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                    <div>
                      <h4 style={{ fontSize: '0.76rem', fontWeight: 900, color: 'white', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {prod.title}
                      </h4>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: 2, fontWeight: 'bold' }}>
                        {prod.store_logo} {prod.store_name}
                      </span>
                    </div>

                    {/* Price & Rating Footer */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', direction: 'rtl' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 950, color: '#c084fc' }}>{prod.new_price} ر.س</span>
                        <span style={{ fontSize: '0.68rem', color: '#fca5a5', textDecoration: 'line-through', fontWeight: 'bold' }}>{prod.old_price} ر.س</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b', fontSize: '0.65rem', fontWeight: 800 }}>
                          <Star size={10} fill="#f59e0b" color="#f59e0b" /> {prod.rating}
                        </div>
                        <button 
                          style={{ 
                            background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', 
                            border: 'none', 
                            color: 'white', 
                            fontSize: '0.58rem', 
                            fontWeight: 900, 
                            padding: '3px 8px', 
                            borderRadius: 6, 
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(168, 85, 247, 0.3)'
                          }}
                        >
                          اطلب الآن
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Sponsored Products Nearby Section */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, direction: 'rtl' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36' }}>المتاجر والخدمات القريبة منك 📍</h3>
            <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 800 }}>تصفية الأقرب</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {partnersNearby
              .filter(p => !selectedCategory || p.category === selectedCategory)
              .map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onPartnerClick(p)}
                  style={{ 
                    background: '#ffffff', 
                    border: '1px solid #eef2f6', 
                    borderRadius: 20, 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ height: 110, position: 'relative' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)' }}></div>
                    {p.sponsored && (
                      <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(124,58,237,0.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(124,58,237,0.3)', color: '#c084fc', fontSize: '0.62rem', fontWeight: 900, padding: '3px 8px', borderRadius: 10 }}>
                        مميز وموثق ✨
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 12, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{p.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontSize: '0.74rem', fontWeight: 800 }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" /> {p.rating}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 2, margin: '2px 0 0 0' }}>{p.category} • {p.reviews}</p>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8, direction: 'rtl', fontSize: '0.7rem', color: '#4b5563' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} color="#7c3aed" /> تبعد {p.distance}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} color="#10b981" /> تصل خلال {p.time}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

      </div>

      {/* Stories Viewer Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 4, padding: '16px 20px' }}>
              {stories.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                  <div style={{ 
                    width: i < activeStoryIndex ? '100%' : i === activeStoryIndex ? `${storyProgress}%` : '0%', 
                    height: '100%', 
                    background: '#c084fc' 
                  }}></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 10px', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{stories[activeStoryIndex].partner}</span>
              <button onClick={() => setActiveStoryIndex(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem' }}>&times;</button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <img src={stories[activeStoryIndex].media} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', bottom: 40, right: 24, left: 24, background: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 12, backdropFilter: 'blur(8px)', textAlign: 'right' }}>
                <p style={{ color: 'white', fontSize: '0.95rem' }}>{stories[activeStoryIndex].label}</p>
                <button onClick={() => { setActiveStoryIndex(null); onPartnerClick(partnersNearby.find(p => p.name === stories[activeStoryIndex!].partner) || partnersNearby[0]); }} className="btn btn-primary" style={{ marginTop: 12, padding: '6px 16px', fontSize: '0.8rem' }}>الذهاب للمتجر 🚀</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
export default HomeScreen;
