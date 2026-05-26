import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Mic, SlidersHorizontal, X, 
  Utensils, Pill, ShoppingCart, Megaphone, Printer, Gift, Hammer, Home as HomeIcon,
  Star, Clock, MapPin, Award
} from 'lucide-react';

export const SearchScreen = ({ onBack, onPartnerClick }: { onBack: () => void, onPartnerClick: (partner: any) => void }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceLevel, setPriceLevel] = useState(2);
  const [distance, setDistance] = useState(5);
  const [isListening, setIsListening] = useState(false);
  const [typoTip, setTypoTip] = useState('');
  const [semanticParsed, setSemanticParsed] = useState<{ category: string, location: string, intent: string } | null>(null);

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'nearest', label: 'الأقرب لك' },
    { id: 'open', label: 'مفتوح الآن' },
    { id: 'top_rated', label: 'الأعلى تقييماً' },
    { id: 'fastest', label: 'الأسرع توصيلاً' },
  ];

  const categories = [
    { id: 'food', label: 'مطاعم', icon: <Utensils size={20} />, color: 'rgba(239, 68, 68, 0.15)' },
    { id: 'pharmacy', label: 'صيدليات', icon: <Pill size={20} />, color: 'rgba(16, 185, 129, 0.15)' },
    { id: 'supermarket', label: 'سوبرماركت', icon: <ShoppingCart size={20} />, color: 'rgba(59, 130, 246, 0.15)' },
    { id: 'ads', label: 'دعاية وإعلان', icon: <Megaphone size={20} />, color: 'rgba(245, 158, 11, 0.15)' },
    { id: 'print', label: 'مطابع', icon: <Printer size={20} />, color: 'rgba(139, 92, 246, 0.15)' },
    { id: 'flowers', label: 'ورد وهدايا', icon: <Gift size={20} />, color: 'rgba(236, 72, 153, 0.15)' },
    { id: 'tech', label: 'صنايعية', icon: <Hammer size={20} />, color: 'rgba(107, 114, 128, 0.15)' },
    { id: 'home', label: 'خدمات منزلية', icon: <HomeIcon size={20} />, color: 'rgba(20, 184, 166, 0.15)' },
  ];

  const recentSearches = ['برجر البيك', 'صيانة تكييف سبليت', 'فيتامين سي فوار', 'كروت شخصية فاخرة'];
  const trending = ['شاورما حراق', 'توصيل هدايا ورد', 'سباك ممتاز', 'قهوة مختصة باردة'];

  const results = [
    { id: 1, name: 'مطعم البيك', category: 'مطاعم', rating: 4.9, distance: '1.2 كم', time: '١٥-٢٥ دقيقة', isOpen: true, sponsored: true, icon: <Utensils size={24} />, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
    { id: 2, name: 'صيدلية النهدي', category: 'صيدليات', rating: 4.8, distance: '2.5 كم', time: '١٠-٢٠ دقيقة', isOpen: true, sponsored: false, icon: <Pill size={24} />, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80' },
  ];

  return (
    <motion.div className="search-screen-container" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      {/* Search Header */}
      <header className="header" style={{ padding: '16px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn-back" onClick={onBack} style={{ position: 'static' }}><ArrowRight size={20} /></button>
        <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="ابحث عن مطعم، صيدلية، فني..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            style={{ paddingRight: 40, paddingLeft: 40 }}
          />
          {query ? (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          ) : (
            <button onClick={() => setIsListening(!isListening)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: isListening ? 'var(--color-accent-light)' : 'var(--color-text-muted)', cursor: 'pointer' }}>
              <Mic size={18} className={isListening ? 'pulse' : ''} />
            </button>
          )}
        </div>
        <button className="icon-button" onClick={() => setShowFilters(true)}><SlidersHorizontal size={20} /></button>
      </header>

      {/* Categories & Filter Tabs */}
      <div style={{ padding: '0 24px 16px 24px', display: 'flex', gap: 8, overflowX: 'auto' }} className="hide-scrollbar">
        {filters.map(f => (
          <button 
            key={f.id} 
            className={`search-tag ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results or Suggestions */}
      <div style={{ padding: '24px' }}>
        {query ? (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>نتائج البحث ({results.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map(r => (
                <div key={r.id} className="search-result-card" onClick={() => onPartnerClick(r)}>
                  <img src={r.image} alt={r.name} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1, paddingRight: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: 800 }}>{r.name}</h4>
                      {r.sponsored && <span style={{ fontSize: '0.65rem', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', padding: '2px 6px', borderRadius: 4 }}>إعلان ممول</span>}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{r.category}</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, fontSize: '0.8rem' }}>
                      <span style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="#FBBF24" /> {r.rating}</span>
                      <span><MapPin size={14} /> {r.distance}</span>
                      <span><Clock size={14} /> {r.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 12 }}>التصنيفات الرئيسية</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {c.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{c.label}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 12 }}>عمليات البحث الأخيرة</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {recentSearches.map((s, i) => (
                <span key={i} className="search-tag" onClick={() => setQuery(s)} style={{ cursor: 'pointer' }}>{s}</span>
              ))}
            </div>

            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 12 }}>الأكثر بحثاً الآن</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {trending.map((s, i) => (
                <span key={i} className="search-tag" onClick={() => setQuery(s)} style={{ borderColor: 'rgba(168,85,247,0.3)', cursor: 'pointer' }}><Award size={12} style={{ marginLeft: 4 }} /> {s}</span>
              ))}
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowFilters(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: '100%', background: 'var(--color-primary-dark)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 24px 40px 24px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px auto' }}></div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>معايير التصفية</h3>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>مستوى السعر</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4].map(p => (
                    <button key={p} className={`search-tag ${priceLevel === p ? 'active' : ''}`} onClick={() => setPriceLevel(p)}>
                      {'﷼'.repeat(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>المسافة القصوى</label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={distance} 
                  onChange={e => setDistance(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--color-accent)' }} 
                  dir="ltr" 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 8 }}>
                  <span>١ كم</span>
                  <span style={{ color: 'var(--color-accent-light)', fontWeight: 800 }}>{distance} كم</span>
                  <span>٥٠ كم</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFilters(false)}>إلغاء</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setShowFilters(false)}>تطبيق</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
