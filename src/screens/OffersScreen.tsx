import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock3, Gift, Star, Award, CreditCard, Share2, ArrowRight, Check, Sparkles, Copy, ChevronLeft
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const OffersScreen = ({ 
  initialSegment = 'offers',
  currentUser,
  onRequireLogin
}: { 
  initialSegment?: 'offers' | 'rewards';
  currentUser?: any;
  onRequireLogin?: (callback: () => void) => void;
}) => {
  const [activeSegment, setActiveSegment] = useState<'offers' | 'rewards'>(initialSegment);

  useEffect(() => {
    setActiveSegment(initialSegment);
  }, [initialSegment]);

  const [points, setPoints] = useState(1250);
  const [cashback, setCashback] = useState(45.50);
  const [tier, setTier] = useState('العضوية الذهبية 🏆');
  const [pointsToNextTier, setPointsToNextTier] = useState(250);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch wallet for points and cashback dynamically
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', currentUser?.id || 'usr_cust_1')
          .single();
        if (!error && data) {
          if (data.loyalty_points !== undefined) {
            setPoints(data.loyalty_points);
            // Calculate next tier thresholds
            if (data.loyalty_points >= 1500) {
              setTier('العضوية البلاتينية 👑');
              setPointsToNextTier(0);
            } else {
              setTier('العضوية الذهبية 🏆');
              setPointsToNextTier(1500 - data.loyalty_points);
            }
          }
          if (data.cashback !== undefined) {
            setCashback(data.cashback);
          }
        }
      } catch (err) {
        console.error('Error fetching wallet:', err);
      }
    };

    fetchWallet();

    const channel = supabase.channel('realtime:offers_wallet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        fetchWallet();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRedeem = (cost: number, rewardName: string) => {
    const act = async () => {
      if (points >= cost) {
        try {
          // Deduct points from database
          const { error } = await supabase
            .from('wallets')
            .update({ loyalty_points: points - cost })
            .eq('user_id', currentUser?.id || 'usr_cust_1');

          if (!error) {
            setPoints(prev => prev - cost);
            alert(`تم استرداد (${rewardName}) بنجاح! 🎉 تم خصم ${cost} نقطة من رصيدك.`);
          } else {
            throw error;
          }
        } catch (err) {
          console.error('Error redeeming reward:', err);
          alert('تعذر استرداد المكافأة في الوقت الحالي. الرجاء المحاولة لاحقاً.');
        }
      } else {
        alert('عذراً، رصيد نقاطك غير كافٍ لاسترداد هذه المكافأة. ❌');
      }
    };

    if (currentUser?.isGuest) {
      onRequireLogin?.(act);
    } else {
      act();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
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

      {/* Floating premium purple background glow effects */}
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%)', filter: 'blur(35px)', top: '15%', right: '-40px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)', filter: 'blur(30px)', top: '45%', left: '-40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* 
        =====================================================================
        PART 1: GLOSSY PURPLE CURVED HEADER (Switches content depending on tab)
        =====================================================================
      */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #2e0854 0%, #15052b 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          paddingBottom: activeSegment === 'rewards' ? '40px' : '32px',
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
        {/* Glow & reflections */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)', filter: 'blur(35px)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', filter: 'blur(30px)', bottom: '-10%', right: '-10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)', pointerEvents: 'none' }} />

        {/* Header Title & Tagline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px 20px', direction: 'rtl', boxSizing: 'border-box' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', margin: '0 0 4px 0' }}>مركز العروض والمكافآت 🔥</h2>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 'bold', lineHeight: 1.4 }}>اكتشف أقوى الخصومات واستبدل نقاط الولاء بكاش باك فوري</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <Sparkles size={20} />
          </div>
        </div>

        {/* Premium Segmented Glass Switcher */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.06)', 
          borderRadius: 24, 
          padding: 4, 
          border: '1px solid rgba(255,255,255,0.08)',
          margin: '0 20px 16px 20px',
          direction: 'rtl',
          boxSizing: 'border-box'
        }}>
          <button 
            onClick={() => setActiveSegment('offers')}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 20,
              border: 'none',
              background: activeSegment === 'offers' ? '#7c3aed' : 'transparent',
              color: activeSegment === 'offers' ? 'white' : 'rgba(255,255,255,0.6)',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxShadow: activeSegment === 'offers' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
              boxSizing: 'border-box'
            }}
          >
            الخصومات والكوبونات 🏷️
          </button>
          <button 
            onClick={() => setActiveSegment('rewards')}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 20,
              border: 'none',
              background: activeSegment === 'rewards' ? '#7c3aed' : 'transparent',
              color: activeSegment === 'rewards' ? 'white' : 'rgba(255,255,255,0.6)',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxShadow: activeSegment === 'rewards' ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
              boxSizing: 'border-box'
            }}
          >
            محفظة المكافآت والنقاط 🏆
          </button>
        </div>

        {/* If rewards tab is active, show the Loyalty Wallet Card embedded inside the purple header */}
        <AnimatePresence>
          {activeSegment === 'rewards' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ padding: '0 20px', boxSizing: 'border-box' }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)', 
                border: '1px solid rgba(251,191,36,0.3)', 
                borderRadius: 22, 
                padding: 20, 
                color: 'white',
                boxShadow: '0 8px 24px rgba(217,119,6,0.35)',
                position: 'relative',
                overflow: 'hidden',
                direction: 'rtl',
                boxSizing: 'border-box'
              }}>
                <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', display: 'block', fontWeight: 700 }}>بطاقة الولاء الرقمية</span>
                    <span style={{ fontSize: '0.94rem', fontWeight: 900, color: 'white', marginTop: 4, display: 'block' }}>{tier}</span>
                  </div>
                  <Award size={26} color="white" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)' }}>النقاط المتاحة</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', margin: '2px 0 0 0' }}>{points.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>نقطة</span></h3>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)' }}>الكاش باك المسترجع</span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', margin: '2px 0 0 0' }}>{cashback.toFixed(2)} ر.س</h3>
                  </div>
                </div>

                {/* Progress bar to next level */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.9)', marginBottom: 4, fontWeight: 700 }}>
                    <span>المستوى البلاتيني 🚀</span>
                    <span>المتبقي: {pointsToNextTier} نقطة</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.22)', borderRadius: 2.5 }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(points / (points + pointsToNextTier)) * 100}%` }} 
                      transition={{ duration: 1 }}
                      style={{ height: '100%', background: '#ffffff', borderRadius: 2.5 }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 
        =====================================================================
        PART 2: CONTENT AREA BELOW THE CURVE (High contrast clean light theme)
        =====================================================================
      */}
      <div style={{ padding: '24px 20px 0 20px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
        <AnimatePresence mode="wait">
          {activeSegment === 'offers' ? (
            <motion.div 
              key="offers-pane" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              transition={{ duration: 0.2 }} 
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              
              {/* Featured Offers */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36' }}>عروض مميزة للغاية ⭐</span>
                  <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 800 }}>شاهد الكل</span>
                </div>
                
                <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, paddingLeft: 4, paddingRight: 4 }} className="no-scrollbar">
                  {[
                    { 
                      id: 1, 
                      title: 'خصم ٤٠٪ على قائمة المسحب بالكامل', 
                      partner: 'مطعم البيك', 
                      discount: '٤٠٪ خصم', 
                      expiry: 'ينتهي خلال ٢ ساعة', 
                      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
                      logo: '🍗'
                    },
                    { 
                      id: 2, 
                      title: 'تخفيض ٢٥٪ على أجهزة قياس الضغط', 
                      partner: 'صيدلية النهدي', 
                      discount: '٢٥٪ خصم', 
                      expiry: 'ينتهي خلال ٥ ساعات', 
                      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80',
                      logo: '💊'
                    }
                  ].map(slide => (
                    <div 
                      key={slide.id} 
                      style={{ 
                        flexShrink: 0, 
                        width: '236px', 
                        borderRadius: 20, 
                        overflow: 'hidden', 
                        background: '#ffffff', 
                        border: '1px solid #eef2f6', 
                        position: 'relative',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ height: 110, position: 'relative', backgroundColor: '#f1f5f9', backgroundImage: `url('${slide.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)' }}></div>
                        
                        <span style={{ position: 'absolute', top: 10, right: 10, background: '#7c3aed', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px', borderRadius: 10 }}>
                          {slide.discount}
                        </span>
                        
                        <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: '#c084fc', fontSize: '0.58rem', fontWeight: 800, padding: '3px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock3 size={10} />
                          {slide.expiry}
                        </span>

                        <div style={{ position: 'absolute', bottom: -14, right: 14, width: 32, height: 32, borderRadius: '50%', background: '#ffffff', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 5 }}>
                          {slide.logo}
                        </div>
                      </div>
                      
                      <div style={{ padding: '20px 14px 14px 14px', textAlign: 'right', boxSizing: 'border-box' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e0b36', margin: '0 0 4px 0', lineHeight: 1.3, height: 36, overflow: 'hidden', wordBreak: 'break-word' }}>{slide.title}</h4>
                        <span style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: 12, fontWeight: 'bold' }}>{slide.partner}</span>
                        
                        <button 
                          className="btn btn-primary" 
                          style={{ width: '100%', padding: '8px', fontSize: '0.72rem', fontWeight: 900, borderRadius: 10, boxShadow: 'none', boxSizing: 'border-box' }}
                          onClick={() => alert(`تم تفعيل عرض ${slide.partner} بنجاح! 🎉`)}
                        >
                          احصل على العرض 🎁
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Nearby Deals */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36' }}>صفقات قريبة جداً من موقعك 🔴</span>
                  <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 800 }}>شاهد الكل</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { 
                      id: 1, 
                      title: 'توصيل مجاني بالكامل اليوم', 
                      partner: 'أسواق التميمي', 
                      discount: 'توصيل مجاني', 
                      expiry: 'ينتهي الليلة', 
                      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&q=80',
                      logo: '🛒'
                    },
                    { 
                      id: 2, 
                      title: 'خصم ٣٠٪ على طباعة الكروت', 
                      partner: 'الركن الذهبي للطباعة', 
                      discount: '٣٠٪ خصم', 
                      expiry: 'ينتهي خلال ٣ ساعات', 
                      image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=400&q=80',
                      logo: '🖨️'
                    }
                  ].map(deal => (
                    <div key={deal.id} style={{ borderRadius: 20, overflow: 'hidden', background: '#ffffff', border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                      <div style={{ height: 80, position: 'relative', backgroundColor: '#f1f5f9', backgroundImage: `url('${deal.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)' }}></div>
                        
                        <span style={{ position: 'absolute', top: 8, right: 8, background: '#7c3aed', color: 'white', fontSize: '0.58rem', fontWeight: 900, padding: '2px 6px', borderRadius: 8 }}>
                          {deal.discount}
                        </span>
                        
                        <div style={{ position: 'absolute', bottom: -12, right: 10, width: 26, height: 26, borderRadius: '50%', background: '#ffffff', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', zIndex: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                          {deal.logo}
                        </div>
                      </div>
                      
                      <div style={{ padding: '14px 10px 10px 10px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, boxSizing: 'border-box' }}>
                        <div>
                          <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e0b36', margin: '0 0 4px 0', lineHeight: 1.3, minHeight: 34, overflow: 'hidden', wordBreak: 'break-word' }}>{deal.title}</h4>
                          <span style={{ fontSize: '0.62rem', color: '#6b7280', display: 'block', marginBottom: 10, fontWeight: 'bold' }}>{deal.partner}</span>
                        </div>
                        
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%', padding: '6px', fontSize: '0.65rem', fontWeight: 800, borderRadius: 8, border: '1px solid #eef2f6', background: '#ffffff', color: '#4b5563', boxSizing: 'border-box', whiteSpace: 'nowrap' }}
                          onClick={() => alert(`تم تفعيل كود ${deal.partner}! 💸`)}
                        >
                          احصل عليه
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Combo Packages */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36', textAlign: 'right', margin: 0 }}>باقات الكومبو المشتركة (Combo Packages) 🎁</h3>
                
                <div style={{ padding: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(124,58,237,0.04) 100%)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 20, direction: 'rtl', textAlign: 'right', boxShadow: '0 4px 16px rgba(0,0,0,0.01)', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 900, display: 'block', marginBottom: 4 }}>باقة التوفير الأكثر طلباً في الرياض 💖</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e0b36', margin: 0, lineHeight: 1.4 }}>باقة "عشاء البيك الفاخر 🍗 + باقة جوري حمراء 🌹"</h4>
                  <p style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: 6, marginBottom: 14, lineHeight: 1.4, fontWeight: 'bold' }}>اطلب وجبة البيك الشهيرة مع باقة ورد جوري طبيعي لتصلك في صندوق إهداء موحد وسائق توصيل واحد.</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', boxSizing: 'border-box' }}>
                    <div style={{ flexGrow: 1, minWidth: '100px', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', textDecoration: 'line-through', marginLeft: 6, fontWeight: 'bold' }}>١٢٠ ر.س</span>
                      <strong style={{ fontSize: '1rem', color: '#10b981', display: 'inline-block' }}>٨٩.٠٠ ر.س فقط</strong>
                    </div>
                    <button 
                      onClick={() => alert('تمت إضافة باقة الكومبو المدمجة إلى سلتك بنجاح! 🛒')}
                      className="btn btn-primary" 
                      style={{ padding: '8px 14px', fontSize: '0.7rem', fontWeight: 900, borderRadius: 8, boxShadow: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      شراء الباقة المشتركة
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          ) : (
            <motion.div 
              key="rewards-pane" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }} 
              transition={{ duration: 0.2 }} 
              style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}
            >
              
              {/* Referrals & Invite Rewards */}
              <section style={{ 
                background: '#ffffff', 
                border: '1px solid #eef2f6', 
                borderRadius: 20, 
                padding: '14px 16px', 
                textAlign: 'right', 
                direction: 'rtl',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: '1 1 200px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}><Share2 size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e0b36', margin: 0, wordBreak: 'break-word' }}>دعوة الأصدقاء = كاش باك ٢٠ ر.س 💸</h4>
                    <p style={{ fontSize: '0.65rem', color: '#6b7280', margin: '4px 0 0 0', fontWeight: 'bold', lineHeight: 1.3 }}>احصل على رصيد محفظة عند إتمام أول طلب لصديقك.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopyCode('BOOSTX-INVITE')}
                  style={{ 
                    background: copiedCode === 'BOOSTX-INVITE' ? '#d1fae5' : '#f1f5f9', 
                    border: '1px solid ' + (copiedCode === 'BOOSTX-INVITE' ? '#10b981' : '#e2e8f0'), 
                    color: copiedCode === 'BOOSTX-INVITE' ? '#059669' : '#4b5563', 
                    padding: '8px 14px', 
                    borderRadius: 12, 
                    fontSize: '0.68rem', 
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    outline: 'none',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  {copiedCode === 'BOOSTX-INVITE' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode === 'BOOSTX-INVITE' ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </section>

              {/* Redeem Rewards List */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36', textAlign: 'right', margin: 0 }}>استبدل نقاطك بمكافآت كبرى 🎁</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'قسيمة خصم بقيمة ٥٠ ر.س من مطعم البيك', cost: 500, desc: 'صالحة للاستخدام على كافة قائمة الطعام بجميع الفروع.', logo: '🍗' },
                    { name: 'توصيل مجاني بالكامل لـ ٣ طلبات قادمة', cost: 300, desc: 'تطبق تلقائياً على رسوم توصيل أي طلب شريك.', logo: '🛵' },
                    { name: 'شحن رصيد كاش باك بقيمة ٢٠ ر.س في محفظتك', cost: 400, desc: 'شحن فوري مباشر لرصيد كاش باك بالمحفظة الرقمية.', logo: '💳' },
                    { name: 'علبة مكمل فيتامين سي فوار من صيدلية النهدي', cost: 250, desc: 'استلمها مجاناً من أي فرع للصيدلية بنقاطك.', logo: '💊' }
                  ].map((reward, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #eef2f6', 
                        padding: '14px', 
                        borderRadius: 20, 
                        display: 'flex', 
                        direction: 'rtl', 
                        gap: 12, 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: '1 1 200px' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f8f9fc', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                          {reward.logo}
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e0b36', margin: 0, wordBreak: 'break-word' }}>{reward.name}</h4>
                          <p style={{ fontSize: '0.65rem', color: '#6b7280', margin: '4px 0 0 0', fontWeight: 'bold', lineHeight: 1.3 }}>{reward.desc}</p>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', display: 'block', marginTop: 4 }}>التكلفة: {reward.cost} نقطة</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRedeem(reward.cost, reward.name)}
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0, borderRadius: 10, boxShadow: 'none', boxSizing: 'border-box' }}
                      >
                        استبدال
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};
export default OffersScreen;
