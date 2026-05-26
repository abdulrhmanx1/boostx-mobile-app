import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Search, Star, Sparkles, SlidersHorizontal, Loader2, ArrowUpDown
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const SponsoredListingScreen = ({ 
  onBack,
  onOfferClick
}: { 
  onBack: () => void;
  onOfferClick?: (offer: any) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('discount'); // discount, price_asc, price_desc, rating
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch sponsored products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('sponsored_products')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching sponsored listing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.store_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simple category mapping based on store name or title
    let category = 'food';
    if (p.store_name.includes('صيدلية') || p.store_logo === '💊') category = 'pharmacy';
    else if (p.store_name.includes('إلكترونيات') || p.store_logo === '⚡') category = 'electronics';
    else if (p.store_name.includes('سوبرماركت') || p.store_logo === '🍏') category = 'supermarket';

    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'discount') {
      return b.discount_percent - a.discount_percent; // Highest discount first
    }
    if (sortBy === 'price_asc') {
      return a.new_price - b.new_price;
    }
    if (sortBy === 'price_desc') {
      return b.new_price - a.new_price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  // Paginated products
  const paginatedProducts = sortedProducts.slice(0, page * itemsPerPage);
  const hasMore = sortedProducts.length > paginatedProducts.length;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      style={{ 
        background: '#0d0418', // Immersive dark cinematic background
        minHeight: '100vh', 
        paddingBottom: '120px', 
        textAlign: 'right', 
        fontFamily: 'Cairo, sans-serif',
        position: 'relative', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes listing-moving-grid {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .listing-grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: linear-gradient(to right, rgba(168, 85, 247, 0.25) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 85, 247, 0.25) 1px, transparent 1px);
          background-size: 30px 30px;
          transform: perspective(600px) rotateX(60deg) scale(1.6) translateY(-40px);
          transform-origin: top center;
          animation: listing-moving-grid 10s linear infinite;
          pointer-events: none;
        }
        .listing-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 80%);
          filter: blur(45px);
          top: -100px;
          right: -50px;
          pointer-events: none;
        }
        .listing-glow-2 {
          position: absolute;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 80%);
          filter: blur(40px);
          bottom: 20%;
          left: -80px;
          pointer-events: none;
        }
        .listing-tag {
          padding: 8px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .listing-tag.active {
          background: #c084fc;
          border-color: #c084fc;
          color: #1a0b2e;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);
        }
        .listing-card-glass {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 14px;
          display: flex;
          gap: 14px;
          direction: rtl;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          transition: all 0.25s ease;
          overflow: hidden;
          box-sizing: border-box;
        }
        .listing-card-glass:hover {
          transform: translateY(-3px);
          border-color: rgba(168, 85, 247, 0.35);
          box-shadow: 0 10px 28px rgba(168, 85, 247, 0.15);
        }
      ` }} />

      {/* Decorative Cinematic Elements */}
      <div className="listing-grid-bg" />
      <div className="listing-glow" />
      <div className="listing-glow-2" />

      {/* 
        =====================================================================
        PART 1: GLASSMORPHIC CURVED HEADER
        =====================================================================
      */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(46, 8, 84, 0.95) 0%, rgba(21, 5, 43, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          paddingBottom: '24px',
          borderBottomLeftRadius: '36px',
          borderBottomRightRadius: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(13, 4, 24, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10
        }}
      >
        {/* Navigation Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px 20px', direction: 'rtl', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#c084fc" fill="#c084fc" />
                <span>منتجات بخصومات عالية</span>
              </h2>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0', fontWeight: 'bold' }}>اكتشف مئات السلع الفاخرة بأسعار تنافسية ممولة</p>
            </div>
          </div>
        </div>

        {/* Search Bar in listing page */}
        <div style={{ padding: '0 20px 16px 20px' }}>
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              direction: 'rtl'
            }}
          >
            <Search size={16} color="rgba(255,255,255,0.5)" />
            <input 
              type="text"
              placeholder="ابحث داخل العروض الكبرى المتميزة..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '0.78rem', 
                fontWeight: 800, 
                width: '100%',
                outline: 'none',
                fontFamily: 'Cairo, sans-serif'
              }}
            />
          </div>
        </div>

        {/* Category filters tags scroll */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px', direction: 'rtl' }} className="no-scrollbar">
          <div className={`listing-tag ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => { setSelectedCategory('all'); setPage(1); }}>الكل 🔥</div>
          <div className={`listing-tag ${selectedCategory === 'food' ? 'active' : ''}`} onClick={() => { setSelectedCategory('food'); setPage(1); }}>مطاعم 🍔</div>
          <div className={`listing-tag ${selectedCategory === 'pharmacy' ? 'active' : ''}`} onClick={() => { setSelectedCategory('pharmacy'); setPage(1); }}>صيدليات 💊</div>
          <div className={`listing-tag ${selectedCategory === 'supermarket' ? 'active' : ''}`} onClick={() => { setSelectedCategory('supermarket'); setPage(1); }}>سوبرماركت 🍏</div>
          <div className={`listing-tag ${selectedCategory === 'electronics' ? 'active' : ''}`} onClick={() => { setSelectedCategory('electronics'); setPage(1); }}>إلكترونيات ⚡</div>
        </div>
      </div>

      {/* 
        =====================================================================
        PART 2: IMMERSIVE PRODUCT FEED
        =====================================================================
      */}
      <div style={{ padding: '20px 20px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
        
        {/* Sort & Count Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, direction: 'rtl' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>
            تم العثور على {sortedProducts.length} منتج مميز
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={12} color="#c084fc" />
            <select 
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                padding: '4px 8px', 
                borderRadius: 8, 
                outline: 'none',
                fontFamily: 'Cairo, sans-serif'
              }}
            >
              <option value="discount" style={{ background: '#15052b', color: 'white' }}>أعلى خصم أولاً</option>
              <option value="price_asc" style={{ background: '#15052b', color: 'white' }}>السعر: من الأقل للأعلى</option>
              <option value="price_desc" style={{ background: '#15052b', color: 'white' }}>السعر: من الأعلى للأقل</option>
              <option value="rating" style={{ background: '#15052b', color: 'white' }}>التقييم الأعلى</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#c084fc' }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>جاري تحميل المنتجات الكبرى...</span>
          </div>
        ) : paginatedProducts.length === 0 ? (
          /* Empty state */
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', margin: '0 0 8px 0' }}>لا تتوفر نتائج تطابق بحثك 🔍</h3>
            <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              حاول تعديل شروط البحث أو التصفية واستكشاف فئات ومنتجات ترويجية أخرى.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {paginatedProducts.map(prod => (
                <motion.div 
                  key={prod.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={() => onOfferClick?.(prod)}
                  className="listing-card-glass"
                >
                  {/* LARGE dominant product image */}
                  <div style={{ width: 104, height: 104, borderRadius: 16, overflow: 'hidden', flexShrink: 0, position: 'relative', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <img src={prod.image_url} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', color: 'white', fontSize: '0.55rem', fontWeight: 900, padding: '2px 5px', borderRadius: 5 }}>
                      {prod.discount_percent}% خصم
                    </span>
                    <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(168, 85, 247, 0.9)', backdropFilter: 'blur(6px)', color: 'white', fontSize: '0.5rem', fontWeight: 900, padding: '1px 4px', borderRadius: 4 }}>
                      ممول
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', boxSizing: 'border-box' }}>
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.4 }}>
                        {prod.title}
                      </h4>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: 4, fontWeight: 'bold' }}>
                        {prod.store_logo} {prod.store_name}
                      </span>
                    </div>

                    {/* Price and Rating Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 950, color: '#c084fc' }}>{prod.new_price} ر.س</span>
                        <span style={{ fontSize: '0.72rem', color: '#fca5a5', textDecoration: 'line-through', fontWeight: 'bold' }}>{prod.old_price} ر.س</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b', fontSize: '0.68rem', fontWeight: 800 }}>
                          <Star size={11} fill="#f59e0b" color="#f59e0b" /> {prod.rating}
                        </span>
                        
                        <button 
                          style={{ 
                            background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', 
                            border: 'none', 
                            color: 'white', 
                            fontSize: '0.62rem', 
                            fontWeight: 900, 
                            padding: '4px 12px', 
                            borderRadius: 8, 
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
            </AnimatePresence>

            {/* Simulated Infinite Scroll / Load More Button */}
            {hasMore && (
              <button 
                onClick={() => setPage(prev => prev + 1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  padding: '12px',
                  borderRadius: 16,
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: 10,
                  transition: 'all 0.25s ease',
                  outline: 'none'
                }}
              >
                تحميل المزيد من العروض الكبرى 🚀
              </button>
            )}

          </div>
        )}
      </div>
    </motion.div>
  );
};
export default SponsoredListingScreen;
