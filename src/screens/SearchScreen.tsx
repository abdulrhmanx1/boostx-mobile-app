import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search as SearchIcon, ArrowRight, Mic, SlidersHorizontal, X, 
  Utensils, Pill, ShoppingCart, Megaphone, Printer, Gift, Hammer, Home as HomeIcon,
  Star, Clock, MapPin, Award, Loader2, Sparkles, ChevronLeft
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const SearchScreen = ({ 
  onBack, 
  onPartnerClick,
  onOfferClick,
  onCategoryClick
}: { 
  onBack: () => void;
  onPartnerClick: (partner: any) => void;
  onOfferClick?: (offer: any) => void;
  onCategoryClick?: (category: string) => void;
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results grouped
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Recent / Popular
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterOffersOnly, setFilterOffersOnly] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  const popularSearches = ['البيك', 'شاورما', 'صيدلية', 'كروت شخصية', 'صيانة سبليت', 'برجر'];

  // Categories definition
  const categories = [
    { id: 'restaurants', label: 'مطاعم', icon: <Utensils size={18} />, color: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', bgOpacity: 'rgba(239, 68, 68, 0.12)' },
    { id: 'pharmacies', label: 'صيدليات', icon: <Pill size={18} />, color: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', bgOpacity: 'rgba(16, 185, 129, 0.12)' },
    { id: 'grocery', label: 'تموينات', icon: <ShoppingCart size={18} />, color: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', bgOpacity: 'rgba(59, 130, 246, 0.12)' },
    { id: 'agency', label: 'دعاية وإعلان', icon: <Megaphone size={18} />, color: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', bgOpacity: 'rgba(245, 158, 11, 0.12)' },
    { id: 'print', label: 'مطابع', icon: <Printer size={18} />, color: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', bgOpacity: 'rgba(139, 92, 246, 0.12)' },
    { id: 'flowers', label: 'ورد وهدايا', icon: <Gift size={18} />, color: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', bgOpacity: 'rgba(236, 72, 153, 0.12)' },
    { id: 'crafts', label: 'صنايعية', icon: <Hammer size={18} />, color: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', bgOpacity: 'rgba(107, 114, 128, 0.12)' },
    { id: 'home', label: 'خدمات منزلية', icon: <HomeIcon size={18} />, color: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)', bgOpacity: 'rgba(20, 184, 166, 0.12)' },
  ];

  // Load recents on mount
  useEffect(() => {
    const recents = localStorage.getItem('BX_RECENT_SEARCHES');
    if (recents) {
      setRecentSearches(JSON.parse(recents));
    } else {
      const defaultRecents = ['شاورما حراق', 'النهدي', 'صيانة سبليت'];
      setRecentSearches(defaultRecents);
      localStorage.setItem('BX_RECENT_SEARCHES', JSON.stringify(defaultRecents));
    }
  }, []);

  // Debouncing Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  // Execute Search
  useEffect(() => {
    const executeSearch = async () => {
      if (!debouncedQuery.trim()) {
        setStores([]);
        setProducts([]);
        setOffers([]);
        setServices([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (!supabase) return;
        const cleanQuery = debouncedQuery.trim();

        // 1. Query Partners (Stores / Services)
        const partnersPromise = supabase
          .from('partners')
          .select('*')
          .or(`name.ilike.%${cleanQuery}%,city.ilike.%${cleanQuery}%,district.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`);

        // 2. Query Menu Items (Products)
        const productsPromise = supabase
          .from('menu_items')
          .select('*')
          .or(`title.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`);

        // 3. Query Offers
        const offersPromise = supabase
          .from('offers')
          .select('*')
          .or(`title.ilike.%${cleanQuery}%,partner_name.ilike.%${cleanQuery}%`);

        const [partnersRes, productsRes, offersRes] = await Promise.all([
          partnersPromise,
          productsPromise,
          offersPromise
        ]);

        if (partnersRes.error) throw partnersRes.error;
        if (productsRes.error) throw productsRes.error;
        if (offersRes.error) throw offersRes.error;

        // Apply filters locally on partners
        let filteredPartners = partnersRes.data || [];
        
        if (selectedCategory !== 'all') {
          const catLabel = categories.find(c => c.id === selectedCategory)?.label || '';
          filteredPartners = filteredPartners.filter((p: any) => 
            p.category === catLabel || p.biz_type === selectedCategory
          );
        }
        if (filterRating) {
          filteredPartners = filteredPartners.filter((p: any) => (p.rating || 4.5) >= filterRating);
        }

        // Group partners into stores vs services
        const finalStores = filteredPartners.filter((p: any) => p.biz_type !== 'services');
        const finalServices = filteredPartners.filter((p: any) => p.biz_type === 'services' || p.category === 'صنايعية' || p.category === 'صيانة منزلية');

        setStores(finalStores);
        setServices(finalServices);

        // Group products
        let finalProducts = productsRes.data || [];
        if (filterOffersOnly) {
          finalProducts = finalProducts.filter((p: any) => p.discount_percent > 0 || p.is_sponsored);
        }
        setProducts(finalProducts);

        // Group offers
        setOffers(offersRes.data || []);

      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'فشل الاتصال بقاعدة البيانات');
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery, selectedCategory, filterOpenNow, filterOffersOnly, filterRating]);

  // Save recent search
  const handleSaveSearch = (keyword: string) => {
    if (!keyword.trim()) return;
    const cleanWord = keyword.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(w => w !== cleanWord);
      const updated = [cleanWord, ...filtered].slice(0, 6);
      localStorage.setItem('BX_RECENT_SEARCHES', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem('BX_RECENT_SEARCHES');
  };

  const totalResults = stores.length + products.length + offers.length + services.length;

  return (
    <motion.div 
      className="search-screen-container" 
      initial={{ opacity: 0, scale: 0.99 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0 }}
      style={{
        background: '#f8fafc',
        minHeight: '100vh',
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* Premium Glossy Header */}
      <header 
        style={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', 
          padding: '16px 20px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: 14, 
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.15)',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', boxSizing: 'border-box' }}>
          {/* Back Button */}
          <button 
            onClick={onBack} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              width: 38, 
              height: 38, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <ArrowRight size={20} />
          </button>

          {/* Search Input Bar */}
          <div style={{ flex: 1, position: 'relative', boxSizing: 'border-box' }}>
            <SearchIcon 
              size={18} 
              style={{ 
                position: 'absolute', 
                right: 14, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#7c3aed' 
              }} 
            />
            <input 
              type="text" 
              placeholder="ابحث عن مطعم، صيدلية، فني..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch(query)}
              style={{ 
                width: '100%',
                background: '#ffffff', 
                border: 'none', 
                color: '#1e0b36', 
                fontSize: '0.88rem',
                fontWeight: 800,
                padding: '12px 42px 12px 42px', 
                borderRadius: 14,
                outline: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                boxSizing: 'border-box'
              }}
            />
            {query ? (
              <button 
                onClick={() => setQuery('')} 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'rgba(124, 58, 237, 0.08)', 
                  border: 'none', 
                  color: '#7c3aed', 
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer' 
                }}
              >
                <X size={12} />
              </button>
            ) : (
              <button 
                onClick={() => {
                  setQuery('البيك');
                  handleSaveSearch('البيك');
                }}
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  color: '#7c3aed', 
                  cursor: 'pointer' 
                }}
              >
                <Mic size={18} />
              </button>
            )}
          </div>

          {/* Filter Trigger Button */}
          <button 
            onClick={() => setShowFilters(true)}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: 'white', 
              width: 38, 
              height: 38, 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', boxSizing: 'border-box' }} className="hide-scrollbar">
        
        {loading ? (
          /* Loading State */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 12 }}>
            <Loader2 size={36} color="#7c3aed" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.86rem', color: '#4b5563', fontWeight: 900 }}>جاري البحث الفوري بالخادم السحابي... ⚡</span>
          </div>
        ) : error ? (
          /* Error State */
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 20, padding: 20, textAlign: 'center', marginTop: 20 }}>
            <h4 style={{ color: '#ef4444', fontWeight: 900, fontSize: '0.94rem', margin: '0 0 8px 0' }}>فشل جلب النتائج سحابياً</h4>
            <p style={{ color: '#dc2626', fontSize: '0.78rem', margin: 0, fontWeight: 'bold' }}>{error}</p>
            <button onClick={() => setDebouncedQuery(query)} style={{ marginTop: 12, background: '#ef4444', border: 'none', color: 'white', fontSize: '0.74rem', fontWeight: 900, padding: '6px 16px', borderRadius: 8, cursor: 'pointer' }}>إعادة المحاولة 🔄</button>
          </div>
        ) : query.trim() ? (
          /* Results Container */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 950, color: '#1e0b36' }}>نتائج البحث الفورية ({totalResults})</span>
              {totalResults > 0 && <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 900 }}>بحث سحابي متزامن 🟢</span>}
            </div>

            {totalResults === 0 ? (
              /* Empty Results State */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</span>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 950, color: '#1e0b36', margin: '0 0 6px 0' }}>عذراً، لم نجد نتائج لـ "{query}"</h4>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, fontWeight: 'bold' }}>تأكد من كتابة الكلمات بشكل صحيح أو جرب تصنيفات أخرى.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Stores / Partners Group */}
                {stores.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.84rem', color: '#7c3aed', fontWeight: 950, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>المتاجر والشركاء ({stores.length})</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(124, 58, 237, 0.1)' }} />
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {stores.map(s => (
                        <motion.div 
                          whileTap={{ scale: 0.98 }}
                          key={s.id} 
                          onClick={() => onPartnerClick(s)}
                          style={{ 
                            background: '#ffffff', 
                            borderRadius: 18, 
                            border: '1px solid rgba(0,0,0,0.03)',
                            padding: 12, 
                            display: 'flex', 
                            gap: 12, 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
                            cursor: 'pointer'
                          }}
                        >
                          <img src={s.image || s.cover_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80'} alt="" style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <h4 style={{ fontSize: '0.82rem', fontWeight: 950, color: '#1e0b36', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{s.name}</h4>
                              <ChevronLeft size={16} color="#9ca3af" />
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginTop: 3, fontWeight: 'bold' }}>{s.category || 'متجر'} • {s.district || s.city}</span>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, fontSize: '0.68rem', color: '#374151', fontWeight: 'bold' }}>
                              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}><Star size={12} fill="#f59e0b" /> {s.rating || 4.8}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><MapPin size={12} /> {s.distance || '١.٥ كم'}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Clock size={12} /> {s.time || '١٥ دقيقة'}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Products / Menu Items Group */}
                {products.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.84rem', color: '#ef4444', fontWeight: 950, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>المنتجات والوجبات ({products.length})</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(239, 68, 68, 0.1)' }} />
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {products.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            if (onOfferClick) {
                              onOfferClick({
                                id: p.id,
                                title: p.title,
                                description: p.desc || p.description || p.title,
                                image_url: p.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
                                new_price: p.price || 20,
                                old_price: (p.price || 20) * 1.3,
                                discount_percent: p.discount_percent || 20,
                                store_name: 'شريك BoostX',
                                addons: [],
                                variants: []
                              });
                            }
                          }}
                          style={{ 
                            background: '#ffffff', 
                            borderRadius: 16, 
                            border: '1px solid rgba(0,0,0,0.03)',
                            padding: 10, 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8, 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          <img src={p.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80'} alt="" style={{ width: '100%', height: 90, borderRadius: 10, objectFit: 'cover' }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 950, color: '#1e0b36', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                              <span style={{ fontSize: '0.84rem', fontWeight: 950, color: '#7c3aed' }}>{p.price} ر.س</span>
                              <button style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', border: 'none', color: 'white', fontSize: '0.58rem', fontWeight: 900, padding: '4px 8px', borderRadius: 6 }}>طلب 🛒</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Offers Group */}
                {offers.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.84rem', color: '#10b981', fontWeight: 950, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>العروض الترويجية النشطة ({offers.length})</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(16, 185, 129, 0.1)' }} />
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {offers.map(o => (
                        <div 
                          key={o.id}
                          onClick={() => {
                            if (onOfferClick) {
                              onOfferClick({
                                id: o.id,
                                title: o.title,
                                description: o.description || o.title,
                                image_url: o.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
                                new_price: 25,
                                old_price: 50,
                                discount_percent: o.discount_percentage || 50,
                                store_name: o.partner_name || 'الشريك الموفر',
                                addons: [],
                                variants: []
                              });
                            }
                          }}
                          style={{ 
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                            borderRadius: 16, 
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            padding: 12, 
                            display: 'flex', 
                            gap: 12,
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                            🎁
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 950, color: '#064e3b', margin: 0 }}>{o.title}</h4>
                            <span style={{ fontSize: '0.64rem', color: '#047857', display: 'block', marginTop: 2, fontWeight: 'bold' }}>مقدم من {o.partner_name || 'الشريك'} • خصم {o.discount_percentage}% اليوم 🔥</span>
                          </div>
                          <ChevronLeft size={16} color="#047857" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Services / Technicians Group */}
                {services.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.84rem', color: '#f59e0b', fontWeight: 950, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>الفنيين وصيانة الخدمات ({services.length})</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(245, 158, 11, 0.1)' }} />
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {services.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => onPartnerClick(s)}
                          style={{ 
                            background: '#ffffff', 
                            borderRadius: 16, 
                            border: '1px solid rgba(0,0,0,0.03)',
                            padding: 12, 
                            display: 'flex', 
                            gap: 12, 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Hammer size={20} color="#f59e0b" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: '0.8rem', fontWeight: 950, color: '#1e0b36', margin: 0 }}>{s.name}</h4>
                              <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: 6, fontWeight: 900 }}>نشط الآن 🟢</span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginTop: 3, fontWeight: 'bold' }}>{s.category || 'فني معتمد'} • {s.district || s.city}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Suggestions / Categories Home Block */
          <div style={{ boxSizing: 'border-box' }}>
            
            {/* Main Categories Section */}
            <div style={{ marginBottom: 28, boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 950, color: '#1e0b36', marginBottom: 14 }}>التصنيفات الرئيسية</h3>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 12,
                  boxSizing: 'border-box' 
                }}
              >
                {categories.map(c => (
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    key={c.id} 
                    onClick={() => {
                      if (onCategoryClick) onCategoryClick(c.label);
                    }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: 8, 
                      cursor: 'pointer' 
                    }}
                  >
                    <div 
                      style={{ 
                        width: 52, 
                        height: 52, 
                        borderRadius: 16, 
                        background: c.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {c.icon}
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#374151' }}>{c.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 950, color: '#1e0b36', margin: 0 }}>عمليات البحث الأخيرة</h3>
                  <button 
                    onClick={handleClearRecents}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', fontWeight: 900, cursor: 'pointer', outline: 'none' }}
                  >
                    مسح الكل 🗑️
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recentSearches.map((s, i) => (
                    <motion.span 
                      whileTap={{ scale: 0.95 }}
                      key={i} 
                      onClick={() => {
                        setQuery(s);
                        handleSaveSearch(s);
                      }} 
                      style={{ 
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#374151',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '6px 14px',
                        borderRadius: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        cursor: 'pointer' 
                      }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches Section */}
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 950, color: '#1e0b36', marginBottom: 12 }}>الأكثر بحثاً الآن 🔥</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {popularSearches.map((s, i) => (
                  <motion.span 
                    whileTap={{ scale: 0.95 }}
                    key={i} 
                    onClick={() => {
                      setQuery(s);
                      handleSaveSearch(s);
                    }} 
                    style={{ 
                      background: '#f5f3ff',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                      color: '#7c3aed',
                      fontSize: '0.72rem',
                      fontWeight: 950,
                      padding: '6px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Award size={10} />
                    <span>{s}</span>
                  </motion.span>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'fixed', inset: 0, background: 'rgba(22, 5, 45, 0.4)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowFilters(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{ 
                width: '100%', 
                background: '#ffffff', 
                borderTopLeftRadius: 28, 
                borderTopRightRadius: 28, 
                padding: '24px 20px 40px 20px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
                boxSizing: 'border-box'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div style={{ width: 44, height: 5, background: '#e2e8f0', borderRadius: 3, margin: '0 auto 20px auto' }}></div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 950, color: '#1e0b36', marginBottom: 18, textAlign: 'right' }}>معايير تصفية البحث الفوري 🔮</h3>
              
              {/* Category Filter */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 900, color: '#4b5563', display: 'block', marginBottom: 8, textAlign: 'right' }}>تحديد التصنيف</label>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="hide-scrollbar">
                  <button 
                    className={`search-tag ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                    style={{
                      background: selectedCategory === 'all' ? '#7c3aed' : '#ffffff',
                      color: selectedCategory === 'all' ? '#ffffff' : '#374151',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.74rem',
                      fontWeight: 900,
                      padding: '6px 14px',
                      borderRadius: 10,
                      cursor: 'pointer'
                    }}
                  >
                    الكل
                  </button>
                  {categories.map(c => (
                    <button 
                      key={c.id} 
                      className={`search-tag ${selectedCategory === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(c.id)}
                      style={{
                        background: selectedCategory === c.id ? '#7c3aed' : '#ffffff',
                        color: selectedCategory === c.id ? '#ffffff' : '#374151',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        padding: '6px 14px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button 
                  onClick={() => setFilterOffersOnly(!filterOffersOnly)}
                  style={{
                    flex: 1,
                    background: filterOffersOnly ? '#ecfdf5' : '#ffffff',
                    border: filterOffersOnly ? '1px solid #10b981' : '1px solid #e2e8f0',
                    color: filterOffersOnly ? '#047857' : '#374151',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    padding: '10px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>🎁 عروض خاصة فقط</span>
                </button>
                <button 
                  onClick={() => setFilterOpenNow(!filterOpenNow)}
                  style={{
                    flex: 1,
                    background: filterOpenNow ? '#f0f9ff' : '#ffffff',
                    border: filterOpenNow ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    color: filterOpenNow ? '#0369a1' : '#374151',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    padding: '10px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>🟢 مفتوح الآن</span>
                </button>
              </div>

              {/* Rating Filter */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 900, color: '#4b5563', display: 'block', marginBottom: 8, textAlign: 'right' }}>الحد الأدنى للتقييم</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[3, 4, 4.5, 4.8].map(r => (
                    <button 
                      key={r} 
                      className={`search-tag ${filterRating === r ? 'active' : ''}`}
                      onClick={() => setFilterRating(filterRating === r ? null : r)}
                      style={{
                        flex: 1,
                        background: filterRating === r ? '#7c3aed' : '#ffffff',
                        color: filterRating === r ? '#ffffff' : '#374151',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        fontWeight: 950,
                        padding: '8px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <Star size={12} fill={filterRating === r ? '#ffffff' : '#f59e0b'} color={filterRating === r ? '#ffffff' : '#f59e0b'} />
                      <span>{r}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, boxSizing: 'border-box' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ 
                    flex: 1, 
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#6b7280',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    padding: '12px',
                    borderRadius: 14,
                    cursor: 'pointer'
                  }} 
                  onClick={() => {
                    setSelectedCategory('all');
                    setFilterOpenNow(false);
                    setFilterOffersOnly(false);
                    setFilterRating(null);
                    setShowFilters(false);
                  }}
                >
                  إعادة ضبط 🔄
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    flex: 2,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    padding: '12px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                  }} 
                  onClick={() => setShowFilters(false)}
                >
                  تطبيق التصفية السحابية
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default SearchScreen;
