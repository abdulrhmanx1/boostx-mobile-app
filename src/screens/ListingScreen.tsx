import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Search, Star, MapPin, Clock, ShieldCheck, Sparkles, Filter, ChevronDown, RefreshCw
} from 'lucide-react';
import { supabase } from 'boostx-shared'; // DB connection

export const ListingScreen = ({ 
  sectionType, 
  onBack, 
  onPartnerClick,
  onOfferClick
}: { 
  sectionType: 'restaurants' | 'pharmacies' | 'offers' | 'products';
  onBack: () => void;
  onPartnerClick?: (partner: any) => void;
  onOfferClick?: (offer: any) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'time'>('rating');
  const [filterSponsored, setFilterSponsored] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Dynamic fetch simulated fallback data
  const mockPartners = [
    { id: 'p1', name: 'مطعم البيك الرواد', category: 'restaurants', rating: 4.9, reviews: '(١٤٣٠ تقييم)', distance: '٢.٤ كم', time: '١٥-٢٥ د', sponsored: true, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },
    { id: 'p2', name: 'شاورما هليل الياسمين', category: 'restaurants', rating: 4.7, reviews: '(٨٢٠ تقييم)', distance: '١.٨ كم', time: '١٢-٢٠ د', sponsored: false, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80' },
    { id: 'p3', name: 'برجر نيون الفاخر', category: 'restaurants', rating: 4.8, reviews: '(٩٥ تقييم)', distance: '٣.١ كم', time: '٢٠-٣٠ د', sponsored: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
    { id: 'p4', name: 'صيدلية النهدي العقيق', category: 'pharmacies', rating: 4.8, reviews: '(٢٤٠ تقييم)', distance: '١.٢ كم', time: '١٠-١٢ د', sponsored: true, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80' },
    { id: 'p5', name: 'صيدلية الدواء الصحافة', category: 'pharmacies', rating: 4.6, reviews: '(١١٥ تقييم)', distance: '٢.٩ كم', time: '١٥-١٨ د', sponsored: false, image: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b6e?w=600&q=80' }
  ];

  const mockOffers = [
    {
      id: 'd1',
      store_name: 'مطعم البيك الرواد',
      store_logo: '🍗',
      title: 'خصم ٤٠٪ للوجبة العائلية الحارّة بالكامل',
      discount_percent: 40,
      sponsored_until: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      old_price: 58.00,
      new_price: 35.00,
      description: 'استمتع بالوجبة العائلية الأكثر طلباً وشهرة في المملكة من دجاج البيك الحراق والمقرمش المكون من ١٢ قطعة مع البطاطس وصلصة الثوم الأسطورية والخبز الطازج.',
      rating: 4.9,
      stock_status: 'available',
      delivery_time: '١٥-٢٠ دقيقة',
      images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80']
    },
    {
      id: 'd2',
      store_name: 'صيدلية النهدي الياسمين',
      store_logo: '💊',
      title: 'خصم ٥٠٪ علبة مكمل فيتامين سي فوار للنشاط',
      discount_percent: 50,
      sponsored_until: new Date(Date.now() + 3.2 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80',
      old_price: 36.00,
      new_price: 18.00,
      description: 'احصل على الطاقة والحيوية لجسمك وصحتك اليومية مع فوار فيتامين سي ١٠٠٠ ملغ سريع الامتصاص والخالي من السكر لحمايتك ودعم مناعتك.',
      rating: 4.8,
      stock_status: 'low',
      delivery_time: '١٠-١٢ دقيقة',
      images: ['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80']
    }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Fetch from Supabase based on section type
        if (sectionType === 'restaurants' || sectionType === 'pharmacies') {
          const bizType = sectionType === 'restaurants' ? 'restaurant' : 'pharmacy';
          if (supabase) {
            const { data } = await supabase
              .from('partners')
              .select('*')
              .eq('biz_type', bizType)
              .limit(10);
            if (data && data.length > 0) {
              setItems(data);
            } else {
              setItems(mockPartners.filter(p => p.category === sectionType));
            }
          } else {
            setItems(mockPartners.filter(p => p.category === sectionType));
          }
        } else if (sectionType === 'offers') {
          setItems(mockOffers);
        } else {
          // Products
          setItems(mockOffers); // use fallback products offers
        }
      } catch (e) {
        console.error('View-all fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [sectionType]);

  // Client side search, sort, filters
  const filteredItems = items
    .filter(item => {
      const matchSearch = (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchSponsored = !filterSponsored || item.sponsored || item.sponsored_until;
      return matchSearch && matchSponsored;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const getPageTitle = () => {
    switch (sectionType) {
      case 'restaurants': return 'قائمة المطاعم الشريكة 🍕';
      case 'pharmacies': return 'الصيدليات والرعاية الطبية 💊';
      case 'offers': return 'عروض الفلاش الحصرية 🔥';
      case 'products': return 'المنتجات والخدمات الممولة 🏷️';
      default: return 'تصفح الكل';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -30 }} 
      style={{ 
        background: '#f8f9fc', 
        minHeight: '100vh', 
        paddingBottom: '120px', 
        textAlign: 'right', 
        fontFamily: 'Cairo, sans-serif',
        position: 'relative', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Floating glossy purple background shapes */}
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)', filter: 'blur(35px)', top: '10%', right: '-40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* 
        =====================================================================
        PART 1: GLOSSY TOP HEADER WITH SEARCH
        =====================================================================
      */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #2e0854 0%, #15052b 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          paddingBottom: '24px',
          borderBottomLeftRadius: '36px',
          borderBottomRightRadius: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(21, 5, 43, 0.35)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 14px 20px', direction: 'rtl', boxSizing: 'border-box' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: 'white', 
              cursor: 'pointer', 
              width: 38, 
              height: 38, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              outline: 'none' 
            }}
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}>{getPageTitle()}</h2>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0 0', fontWeight: 'bold' }}>اكتشف مئات الخيارات المتاحة في موقعك الآن</p>
          </div>
        </div>

        {/* Dynamic Search Bar */}
        <div style={{ padding: '0 20px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.06)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: 18, 
            padding: '10px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            backdropFilter: 'blur(10px)',
            boxSizing: 'border-box'
          }}>
            <Search size={18} color="rgba(255,255,255,0.4)" />
            <input 
              type="text" 
              placeholder="ابحث عن المتاجر، الوجبات، الكوبونات..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', flex: 1, textAlign: 'right', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif' }}
            />
          </div>
        </div>
      </div>

      {/* 
        =====================================================================
        PART 2: FILTERS & LISTING VIEWS
        =====================================================================
      */}
      <div style={{ padding: '20px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
        
        {/* Quick Filter chips */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', direction: 'rtl' }}>
          <button 
            onClick={() => setFilterSponsored(!filterSponsored)}
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              border: '1px solid ' + (filterSponsored ? 'var(--color-accent)' : '#e2e8f0'),
              background: filterSponsored ? 'var(--color-accent)' : '#ffffff',
              color: filterSponsored ? 'white' : '#4b5563',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Sparkles size={12} />
            <span>المميزة فقط</span>
          </button>

          <button 
            onClick={() => setSortBy(sortBy === 'rating' ? 'distance' : 'rating')}
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#4b5563',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Filter size={12} />
            <span>الترتيب حسب: {sortBy === 'rating' ? 'الأعلى تقييماً' : 'الأقرب مسافة'}</span>
          </button>
        </div>

        {/* Dynamic Cards Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <RefreshCw className="animate-spin" size={30} color="#7c3aed" />
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div style={{ background: '#ffffff', border: '1px solid #eef2f6', padding: '40px 20px', borderRadius: 20, textAlign: 'center' }}>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36', margin: '0 0 6px 0' }}>لا توجد نتائج مطابقة 🔍</h4>
            <p style={{ fontSize: '0.74rem', color: '#6b7280', margin: 0, fontWeight: 'bold' }}>جرب تعديل كلمات البحث أو شروط الفرز لعرض خيارات أكثر.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredItems.map(item => (
              <motion.div 
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (sectionType === 'offers' || sectionType === 'products') {
                    onOfferClick?.(item);
                  } else {
                    onPartnerClick?.(item);
                  }
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #eef2f6',
                  borderRadius: 22,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  display: 'flex',
                  direction: 'rtl',
                  gap: 14,
                  padding: 12,
                  boxSizing: 'border-box'
                }}
              >
                {/* Image Cover */}
                <div style={{ width: 84, height: 84, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                  <img src={item.image || item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', boxSizing: 'border-box' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{item.name || item.title}</h4>
                      {(item.sponsored || item.sponsored_until) && <ShieldCheck size={14} color="#10b981" />}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginTop: 4, fontWeight: 'bold' }}>{item.store_name || item.category || 'شريك معتمد'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                    {item.rating && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold' }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" /> {item.rating}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold' }}>
                      <MapPin size={12} color="#7c3aed" /> {item.distance || '٢.٤ كم'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold' }}>
                      <Clock size={12} /> {item.time || item.delivery_time || '١٥-٢٥ د'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
};
export default ListingScreen;
