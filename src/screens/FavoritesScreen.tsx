import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Heart, Star, MapPin, Clock, ShieldCheck, ShoppingCart, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const FavoritesScreen = ({ 
  onBack, 
  onPartnerClick,
  currentUser,
  onRequireLogin
}: { 
  onBack: () => void;
  onPartnerClick?: (partner: any) => void;
  currentUser?: any;
  onRequireLogin?: (callback: () => void) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritePartners, setFavoritePartners] = useState<any[]>([]);

  // Sample premium mock stores as a fallback to ensure page always populates beautifully
  const mockFavorites = [
    { 
      id: 'p1', 
      name: 'مطعم البيك الرواد', 
      category: 'مطاعم', 
      rating: 4.9, 
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80', 
      status: 'open', 
      sponsored: true,
      time: '١٥-٢٥ دقيقة',
      distance: '٢.٤ كم'
    },
    { 
      id: 'p2', 
      name: 'صيدلية النهدي الياسمين', 
      category: 'صيدليات', 
      rating: 4.8, 
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80', 
      status: 'open', 
      sponsored: false,
      time: '١٠-١٥ دقيقة',
      distance: '١.٢ كم'
    }
  ];

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (supabase) {
          // Fetch raw favorites for user
          const { data: favs, error: sbError } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', currentUser?.id || 'usr_cust_1');
            
          if (sbError) throw sbError;
          
          if (favs && favs.length > 0) {
            // Fetch all partners to match relations manually (simulating joins perfectly)
            const { data: partnersList, error: partnersError } = await supabase
              .from('partners')
              .select('*');

            if (!partnersError && partnersList) {
              const matched = favs
                .map((f: any) => partnersList.find((p: any) => p.id === f.partner_id))
                .filter(Boolean);
              
              setFavoritePartners(matched);
            } else {
              setFavoritePartners([]);
            }
          } else {
            setFavoritePartners([]);
          }
        } else {
          setFavoritePartners(mockFavorites);
        }
      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        setError('تعذر تحميل الشركاء المفضلين.');
        setFavoritePartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    const channel = supabase.channel('realtime:favorites_screen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => {
        fetchFavorites();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  const handleRemoveFavorite = async (partnerId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (currentUser?.isGuest) {
      if (onRequireLogin) {
        onRequireLogin(() => {});
      }
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser?.id || 'usr_cust_1')
        .eq('partner_id', partnerId);
      
      if (!deleteError) {
        setFavoritePartners(prev => prev.filter(p => p.id !== partnerId));
      }
    } catch (err) {
      console.error('Error deleting favorite from DB:', err);
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
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* Floating neon glows behind the content area */}
      <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)', filter: 'blur(40px)', top: '20%', right: '-30px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.03) 0%, transparent 70%)', filter: 'blur(35px)', top: '50%', left: '-30px', pointerEvents: 'none', zIndex: 0 }} />

      {/* 
        =====================================================================
        PART 1: GLOSSY PURPLE CURVED HEADER
        =====================================================================
      */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #2e0854 0%, #15052b 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          paddingBottom: '32px',
          borderBottomLeftRadius: '40px',
          borderBottomRightRadius: '40px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(21, 5, 43, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)', filter: 'blur(35px)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
        
        {/* Navigation Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px 20px', direction: 'rtl', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', margin: 0 }}>مفضلتي المتميزة 💖</h2>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0 0', fontWeight: 'bold' }}>متابعة متاجرك وشركائك المفضلين للطلب السريع</p>
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <Heart size={20} fill="#ef4444" />
          </div>
        </div>
      </div>

      {/* 
        =====================================================================
        PART 2: DYNAMIC LISTING WITH PREMIUM GLASS LAYERS
        =====================================================================
      */}
      <div style={{ padding: '24px 20px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
        
        {/* Error Fallback Bar */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 16, padding: '10px 14px', marginBottom: 20, color: '#ef4444', fontSize: '0.72rem', fontWeight: 800, textAlign: 'right', direction: 'rtl' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold' }}>جاري استرجاع متاجرك المفضلة...</span>
          </div>
        ) : favoritePartners.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #eef2f6', 
              borderRadius: 24, 
              padding: '40px 24px', 
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
              marginTop: 20,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 20px auto', boxShadow: '0 8px 20px rgba(239,68,68,0.1)' }}>
              <Heart size={34} fill="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e0b36', margin: '0 0 8px 0' }}>قائمة المفضلة فارغة 💔</h3>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 24px 0', lineHeight: 1.5, fontWeight: 'bold' }}>تصفح مئات المتاجر المميزة في منطقتك وأضف ما تفضله للوصول السريع هنا في أي وقت.</p>
            <button 
              onClick={onBack}
              className="btn btn-primary" 
              style={{ padding: '12px 28px', fontSize: '0.82rem', fontWeight: 900, borderRadius: 'var(--radius-pill)', boxShadow: 'var(--glow-accent)', width: 'auto', display: 'inline-block' }}
            >
              استكشف المتاجر الآن 🚀
            </button>
          </motion.div>
        ) : (
          /* Responsive Cards List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {favoritePartners.map(partner => (
              <motion.div 
                key={partner.id} 
                whileTap={{ scale: 0.98 }}
                onClick={() => onPartnerClick?.(partner)}
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #eef2f6', 
                  borderRadius: 22, 
                  padding: 14, 
                  display: 'flex', 
                  direction: 'rtl', 
                  gap: 14, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }} 
              >
                {/* Store image */}
                <div style={{ width: 84, height: 84, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                  <img src={partner.image} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Store Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', boxSizing: 'border-box' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{partner.name}</h4>
                      <ShieldCheck size={14} color="#10b981" />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginTop: 4, fontWeight: 'bold' }}>فئة {partner.category} • نشط 🟢</span>
                  </div>

                  {/* Metadata Row */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold' }}>
                      <Star size={12} fill="#f59e0b" /> {partner.rating}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold' }}>
                      <MapPin size={12} color="#7c3aed" /> {partner.distance || '٢.٤ كم'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold' }}>
                      <Clock size={12} /> {partner.time || '١٥-٢٥ د'}
                    </span>
                  </div>
                </div>

                {/* Remove heart button */}
                <button 
                  onClick={(e) => handleRemoveFavorite(partner.id, e)}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer', 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    alignSelf: 'flex-start',
                    outline: 'none'
                  }}
                >
                  <Heart size={16} fill="#ef4444" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default FavoritesScreen;
