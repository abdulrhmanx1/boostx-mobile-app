import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Heart, Share2, Star, Clock, MapPin, Plus, ShoppingCart, Check, Eye, ShieldCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const StoresScreen = ({ 
  partner, 
  onBack, 
  onAddToCart,
  currentUser,
  onRequireLogin
}: { 
  partner: any;
  onBack: () => void;
  onAddToCart?: (item: any) => void;
  currentUser?: any;
  onRequireLogin?: (callback: () => void) => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState('best');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<any | null>(null);
  const [highlightProgress, setHighlightProgress] = useState(0);
  
  // Product Detail Bottom Sheet States
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productQty, setProductQty] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Booking details states for technician bookings
  const [bookingDate, setBookingDate] = useState('اليوم، ٠٥:٣٠ م');
  const [bookingLocation, setBookingLocation] = useState('حي الصحافة، الرياض');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Prefill client name & phone from current user
  useEffect(() => {
    if (currentUser) {
      setClientName(currentUser.name || '');
      setClientPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Dynamic state for partner and products
  const [currentPartner, setCurrentPartner] = useState<any>(partner || { id: 'p1', name: 'مطعم البيك', biz_type: 'restaurant', rating: 4.9, reviews: '١٢.٥ ألف تقييم', distance: '١.٢ كم', time: '١٥-٢٥ دقيقة', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', sponsored: true, is_active: true, city: 'الرياض', district: 'الملقا', category: 'مطاعم' });
  const [products, setProducts] = useState<any[]>([]);

  // Fetch partner info and listen in realtime
  useEffect(() => {
    if (!partner || !partner.id) return;
    
    const fetchPartner = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('id', partner.id)
          .single();
        if (!error && data) {
          setCurrentPartner(data);
        }
      } catch (err) {
        console.error('Error fetching partner details:', err);
      }
    };

    fetchPartner();

    const channel = supabase.channel(`realtime:partner:${partner.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners', filter: `id=eq.${partner.id}` }, (payload: any) => {
        if (payload.new) {
          setCurrentPartner(payload.new);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [partner]);

  // Fetch products or technician services and listen in realtime
  useEffect(() => {
    if (!currentPartner || !currentPartner.id) return;

    const isCraftsman = currentPartner.category === 'صنايعية' || currentPartner.category === 'خدمات منزلية';

    const fetchProducts = async () => {
      try {
        if (isCraftsman) {
          const { data, error } = await supabase
            .from('technician_services')
            .select('*')
            .eq('technician_id', currentPartner.id);
          
          if (!error && data) {
            const normalized = data.map((s: any) => ({
              id: s.id,
              name: s.name,
              desc: `مدة الخدمة التقريبية: ${s.duration || 'غير محددة'}`,
              price: `${s.price} ر.س`,
              rawPrice: s.price,
              images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80'],
              category: 'best', // Default to best tab
              duration: s.duration
            }));
            setProducts(normalized);
          }
        } else {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('partner_id', currentPartner.id);
          
          if (!error && data) {
            const normalized = data.map((p: any) => ({
              ...p,
              images: p.images || [p.image_url || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80']
            }));
            setProducts(normalized);
          }
        }
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };

    fetchProducts();

    const channelName = isCraftsman
      ? `realtime:technician_services:${currentPartner.id}`
      : `realtime:products:${currentPartner.id}`;

    const channelTable = isCraftsman
      ? 'technician_services'
      : 'menu_items';

    const filterCol = isCraftsman
      ? 'technician_id'
      : 'partner_id';

    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: channelTable, filter: `${filterCol}=eq.${currentPartner.id}` }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentPartner]);

  // Check if store is in favorites
  useEffect(() => {
    if (!currentUser || currentUser.isGuest || !currentUser.id || !currentPartner || !currentPartner.id) return;

    const checkFavorite = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('partner_id', currentPartner.id);
        if (!error && data && data.length > 0) {
          setIsFavorite(true);
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    checkFavorite();
  }, [currentUser, currentPartner]);

  // Toggle favorite in database
  const handleToggleFavorite = async () => {
    if (!currentUser || currentUser.isGuest || !currentUser.id) {
      if (onRequireLogin) {
        onRequireLogin(handleToggleFavorite);
      }
      return;
    }

    try {
      if (isFavorite) {
        // Delete from database
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('partner_id', currentPartner.id);
        if (!error) {
          setIsFavorite(false);
        }
      } else {
        // Insert into database
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: currentUser.id,
            partner_id: currentPartner.id,
            created_at: new Date().toISOString()
          });
        if (!error) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite in DB:', err);
    }
  };

  // Dynamic Highlight Timers
  useEffect(() => {
    let timer: any;
    if (activeHighlight) {
      setHighlightProgress(0);
      timer = setInterval(() => {
        setHighlightProgress(prev => {
          if (prev >= 100) {
            setActiveHighlight(null);
            return 0;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeHighlight]);

  // Reset scroll position to top on page mount and partner change
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    return () => clearTimeout(t);
  }, [partner?.id]);

  const highlights = [
    { id: 1, label: 'جديدنا 🔥', icon: '✨', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', tag: 'برجر الحطب المدخن الجديد باختيار الشيف!' },
    { id: 2, label: 'الأكثر مبيعاً ⭐', icon: '🔥', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80', tag: 'وجبات البروست الأكثر طلباً في المنطقة!' },
    { id: 3, label: 'عروض اليوم ✔️', icon: '🏷️', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', tag: 'اشترِ وجبة واحصل على الثانية مجاناً!' },
    { id: 4, label: 'من نحن 🔴', icon: '📍', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', tag: 'فروعنا تغطي الرياض، جدة، والدمام لخدمتكم.' }
  ];

  const isCraftsman = currentPartner.category === 'صنايعية' || currentPartner.category === 'خدمات منزلية';

  const productCategories = isCraftsman ? [
    { id: 'best', label: 'الخدمات المتاحة 🛠️' }
  ] : [
    { id: 'best', label: 'الأكثر مبيعاً ⭐' },
    { id: 'meals', label: 'الأطباق الرئيسية 🍔' },
    { id: 'sides', label: 'المقبلات والجانبيات 🍟' },
    { id: 'drinks', label: 'المشروبات المنعشة 🥤' }
  ];

  const getNumericPrice = (priceStr: string | number) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const arabicToEnglish = (str: string) => {
      const chars: any = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
      return str.replace(/[٠-٩]/g, d => chars[d]);
    };
    const cleanStr = arabicToEnglish(priceStr).replace(/[^0-9.]/g, '');
    return parseFloat(cleanStr) || 0;
  };

  const getExtrasCost = () => {
    let cost = 0;
    selectedExtras.forEach(extra => {
      if (extra.includes('+١') || extra.includes('+1')) cost += 1;
      else if (extra.includes('+٢') || extra.includes('+2')) cost += 2;
      else if (extra.includes('+٥') || extra.includes('+5')) cost += 5;
    });
    return cost;
  };

  const currentBasePrice = selectedProduct ? (selectedProduct.rawPrice || getNumericPrice(selectedProduct.price) || 0) : 0;
  const currentExtrasCost = getExtrasCost();
  const currentProductTotalPrice = (currentBasePrice + currentExtrasCost) * productQty;

  const handleAddToCartClick = (p: any) => {
    const extrasCost = getExtrasCost();
    const baseP = p.rawPrice || getNumericPrice(p.price) || 0;
    const finalRawPrice = baseP + extrasCost;
    const finalPriceStr = `${finalRawPrice} ر.س`;

    if (onAddToCart) {
      onAddToCart({
        id: p.id,
        name: p.name,
        price: finalPriceStr,
        rawPrice: finalRawPrice,
        qty: productQty,
        extras: selectedExtras,
        partnerName: currentPartner?.name || 'شريك نيون',
        partnerId: currentPartner?.id
      });
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setSelectedProduct(null);
  };

  const handleBookService = async () => {
    if (!clientName || !clientPhone || !bookingDate || !bookingLocation) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة. ⚠️');
      return;
    }

    setIsBookingSubmitting(true);

    const bookingRow = {
      id: 'sb-' + Date.now(),
      customer_id: currentUser?.id || 'usr_cust_guest',
      customer_name: clientName,
      customer_phone: clientPhone,
      technician_id: currentPartner.id,
      service_name: selectedProduct.name,
      price: selectedProduct.rawPrice,
      booking_date: bookingDate,
      location: bookingLocation,
      status: 'pending'
    };

    try {
      const { error } = await supabase
        .from('service_bookings')
        .insert(bookingRow);

      if (error) {
        alert('حدث خطأ أثناء حجز الخدمة: ' + error.message);
      } else {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedProduct(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      alert('خطأ غير متوقع.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const toggleExtra = (extra: string) => {
    setSelectedExtras(prev => prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra]);
  };

  return (
    <motion.div className="partner-details-container" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} style={{ minHeight: '100vh', background: '#120b1f', paddingBottom: '100px', fontFamily: 'Cairo, sans-serif' }}>
      
      {/* Immersive Hero Cover */}
      <div style={{ position: 'relative', height: 260, backgroundImage: `url(${currentPartner.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        
        {/* Layered Rich Gradient Glass overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(18,11,31,0.2) 0%, rgba(18,11,31,0.6) 60%, #120b1f 100%)' }}></div>
        
        <div style={{ position: 'absolute', top: 20, right: 20, left: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 }}>
          <button className="btn-back" onClick={onBack} style={{ position: 'static', background: 'rgba(26,11,46,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              className="icon-button" 
              onClick={handleToggleFavorite} 
              style={{ background: 'rgba(26,11,46,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Heart size={20} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : 'white'} />
            </button>
            <button className="icon-button" style={{ background: 'rgba(26,11,46,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Floating Store Logo / Emoji Circle */}
        <div style={{ position: 'absolute', bottom: 16, right: 24, display: 'flex', gap: 16, alignItems: 'flex-end', zIndex: 10 }}>
          <div style={{ width: 72, height: 72, borderRadius: '24px', background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', boxShadow: '0 8px 25px rgba(124,58,237,0.4)', border: '3.5px solid #120b1f' }}>
            {currentPartner.category === 'صيدليات' ? '💊' : (currentPartner.category === 'صنايعية' || currentPartner.category === 'خدمات منزلية') ? '🛠️' : '🍔'}
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white', margin: 0 }}>{currentPartner.name}</h1>
              <ShieldCheck size={18} color="#10b981" style={{ filter: 'drop-shadow(0 0 5px rgba(16,185,129,0.5))' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 6, direction: 'rtl' }}>
              <span>فئة {currentPartner.category}</span>
              <span>•</span>
              <span style={{ color: currentPartner.is_active ? '#10b981' : '#ef4444', fontWeight: 800 }}>
                {currentPartner.is_active ? 'نشط الآن 🟢' : 'مغلق مؤقتاً 🔴'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Immersive Store Metadata (Distance, Rating, Delivery) */}
      <div style={{ padding: '12px 24px' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 20, 
          padding: '16px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 8, 
          textAlign: 'center',
          direction: 'rtl',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>التقييم</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Star size={12} fill="#f59e0b" /> {currentPartner.rating}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>المسافة</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><MapPin size={12} color="var(--color-accent-light)" /> ٢.٤ كم</span>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>التوصيل</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Clock size={12} color="var(--color-success)" /> ١٥-٢٥ د</span>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>رسوم التوصيل</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#10b981' }}>مجاني 🎉</span>
          </div>
        </div>
      </div>

      {/* Realtime Customer-Store Direct Communication Actions */}
      <div style={{ padding: '0 24px 12px 24px', display: 'flex', gap: 12, direction: 'rtl' }}>
        <button 
          onClick={() => {
            const act = () => alert(`جاري فتح الدردشة المباشرة مع ${currentPartner.name}... 💬\nبياناتك الهوية تم مشاركتها تلقائياً لتسهيل الاستلام.`);
            if (currentUser?.isGuest) onRequireLogin?.(act);
            else act();
          }}
          style={{ 
            flex: 1, 
            background: 'rgba(192, 132, 252, 0.08)', 
            border: '1px solid rgba(192, 132, 252, 0.25)', 
            borderRadius: 16, 
            padding: '10px 14px', 
            color: 'white', 
            fontWeight: 800, 
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <span>دردشة حية</span>
          <span>💬</span>
        </button>

        <a 
          href={currentUser?.isGuest ? '#' : 'https://wa.me/966555555555'}
          onClick={(e) => {
            if (currentUser?.isGuest) {
              e.preventDefault();
              onRequireLogin?.(() => window.open('https://wa.me/966555555555', '_blank'));
            } else {
              alert(`تمت مشاركة بياناتك (${currentUser.name} - ${currentUser.phone}) مع المتجر عبر الواتساب لتجهيز الطلب.`);
            }
          }}
          style={{ 
            flex: 1, 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: 16, 
            padding: '10px 14px', 
            color: 'white', 
            fontWeight: 800, 
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            textDecoration: 'none'
          }}
        >
          <span>واتساب المتجر</span>
          <span>🟢</span>
        </a>

        <a 
          href={currentUser?.isGuest ? '#' : 'tel:+966555555555'}
          onClick={(e) => {
            if (currentUser?.isGuest) {
              e.preventDefault();
              onRequireLogin?.(() => window.location.href = 'tel:+966555555555');
            }
          }}
          style={{ 
            flex: 1, 
            background: 'rgba(255, 255, 255, 0.04)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: 16, 
            padding: '10px 14px', 
            color: 'white', 
            fontWeight: 800, 
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            textDecoration: 'none'
          }}
        >
          <span>اتصال هاتفي</span>
          <span>📞</span>
        </a>
      </div>

      {/* Special Offer Banner */}
      <div style={{ padding: '0 24px 12px 24px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(99,102,241,0.1) 100%)', 
          border: '1px solid rgba(168,85,247,0.25)', 
          borderRadius: 16, 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>🏷️</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white' }}>خصم ٢٠٪ باستخدام كود: <strong style={{ color: 'var(--color-accent-light)' }}>BOOSTX</strong></span>
          </div>
          <span style={{ fontSize: '0.68rem', background: 'var(--color-accent)', padding: '2px 8px', borderRadius: 4, color: 'white', fontWeight: 900 }}>نشط</span>
        </div>
      </div>

      {/* Stories / Highlights Carousel */}
      <div style={{ padding: '8px 24px 0 24px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white', marginBottom: 12, textAlign: 'right' }}>قصص وعروض المتجر الحية 🔥</h3>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }} className="no-scrollbar">
          {highlights.map(h => (
            <div key={h.id} onClick={() => setActiveHighlight(h)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0, width: 70 }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', padding: 2.5, boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}>
                <img src={h.image} alt={h.label} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #120b1f' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 800, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 10, overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: '#120b1f', zIndex: 30 }} className="no-scrollbar">
        {productCategories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? 'var(--glow-accent)' : 'none'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Premium Product Cards Grid */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {products.filter(p => (p.is_available !== false && p.active !== false && p.is_active !== false) && (p.category === selectedCategory || selectedCategory === 'best')).map(p => (
          <motion.div 
            key={p.id} 
            whileHover={{ y: -3 }}
            style={{ 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)', 
              padding: 14, 
              borderRadius: 20, 
              display: 'flex', 
              gap: 14, 
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
            }} 
            onClick={() => { setSelectedProduct(p); setProductQty(1); setSelectedExtras([]); }}
          >
            <img src={p.images[0]} alt={p.name} style={{ width: 96, height: 96, borderRadius: 16, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: 'white', margin: 0 }}>{p.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4, lineHeight: '1.4' }}>{p.desc}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>{p.price}</span>
                <button className="add-btn" style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--color-accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--glow-accent)' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stories Overlay Viewer */}
      <AnimatePresence>
        {activeHighlight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 4, padding: '16px 20px' }}>
              <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <div style={{ width: `${highlightProgress}%`, height: '100%', background: 'var(--color-accent-light)' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 10px', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{activeHighlight.label}</span>
              <button onClick={() => setActiveHighlight(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem' }}>&times;</button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <img src={activeHighlight.image} alt={activeHighlight.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', bottom: 40, right: 24, left: 24, background: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 12, backdropFilter: 'blur(8px)', textAlign: 'right' }}>
                <p style={{ color: 'white', fontSize: '0.95rem' }}>{activeHighlight.tag}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Liquid Glass Bottom Sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} style={{ width: '100%', background: 'rgba(26,15,46,0.92)', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '24px 24px 40px 24px', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)' }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 42, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, margin: '0 auto 20px auto' }}></div>
              
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', margin: 0 }}>{selectedProduct.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 6, lineHeight: 1.4 }}>{selectedProduct.desc}</p>
              
              {isCraftsman ? (
                // Booking Form for Craftsman / Technician
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>سعر الخدمة: {selectedProduct.price}</span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '4px 12px', borderRadius: 8, fontWeight: 'bold' }}>مدة الخدمة: {selectedProduct.duration || 'غير محددة'}</span>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 12 }}>بيانات حجز موعد الزيارة المنزلية 📅</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>اسم العميل</label>
                      <input 
                        type="text" 
                        value={clientName} 
                        onChange={e => setClientName(e.target.value)} 
                        placeholder="أدخل اسمك الكامل..."
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', textAlign: 'right' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>رقم الجوال للتواصل</label>
                      <input 
                        type="tel" 
                        value={clientPhone} 
                        onChange={e => setClientPhone(e.target.value)} 
                        placeholder="أدخل رقم الجوال..."
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', textAlign: 'right' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>الموعد المناسب للزيارة</label>
                      <input 
                        type="text" 
                        value={bookingDate} 
                        onChange={e => setBookingDate(e.target.value)} 
                        placeholder="مثال: اليوم، ٠٥:٣٠ م أو غداً صباحاً..."
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', textAlign: 'right' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>عنوان موقع الزيارة المنزلية</label>
                      <input 
                        type="text" 
                        value={bookingLocation} 
                        onChange={e => setBookingLocation(e.target.value)} 
                        placeholder="أدخل تفاصيل الحي والشارع..."
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', textAlign: 'right' }} 
                      />
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    disabled={isBookingSubmitting}
                    style={{ width: '100%', display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', padding: '14px', borderRadius: 'var(--radius-pill)', fontWeight: 900, boxShadow: 'var(--glow-accent)', cursor: 'pointer' }} 
                    onClick={() => {
                      if (currentUser?.isGuest) {
                        onRequireLogin?.(handleBookService);
                      } else {
                        handleBookService();
                      }
                    }}
                  >
                    <span>{isBookingSubmitting ? 'جاري إرسال طلب الحجز...' : 'تأكيد حجز الخدمة الفوري 📅'}</span>
                  </button>
                </div>
              ) : (
                // Regular Food / Pharmacy details with Add to Cart
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>{currentProductTotalPrice} ر.س</span>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', direction: 'rtl' }}>
                      <button onClick={() => setProductQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{productQty}</span>
                      <button onClick={() => setProductQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  {/* Extras Selector */}
                  <div style={{ marginBottom: 28 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 12 }}>خيارات وإضافات اختيارية</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['ثوم إضافي (+١ ر.س)', 'جبنة إضافية (+٢ ر.س)', 'حجم عائلي كبير (+٥ ر.س)'].map(extra => (
                        <div key={extra} onClick={() => toggleExtra(extra)} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid ' + (selectedExtras.includes(extra) ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)'), borderRadius: 14, cursor: 'pointer', direction: 'rtl' }}>
                          <span style={{ fontSize: '0.85rem', color: 'white' }}>{extra}</span>
                          <div style={{ width: 22, height: 22, borderRadius: 8, border: '1.5px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedExtras.includes(extra) ? 'var(--color-accent)' : 'none', transition: 'all 0.2s' }}>
                            {selectedExtras.includes(extra) && <Check size={14} color="white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', padding: '14px', borderRadius: 'var(--radius-pill)', fontWeight: 900, boxShadow: 'var(--glow-accent)' }} 
                    onClick={() => {
                      const act = () => handleAddToCartClick(selectedProduct);
                      if (currentUser?.isGuest) {
                        onRequireLogin?.(act);
                      } else {
                        act();
                      }
                    }}
                  >
                    <ShoppingCart size={20} />
                    <span>إضافة السلة الرقمية ({currentProductTotalPrice} ر.س)</span>
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: 40, left: 24, right: 24, background: 'var(--color-success)', color: 'white', padding: '12px 24px', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center', zIndex: 200, justifyContent: 'center', boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}>
            <Check size={20} />
            <span style={{ fontWeight: 'bold' }}>تمت إضافة الوجبة إلى السلة الرقمية بنجاح! 🛒</span>
          </motion.div>
        )}
        {bookingSuccess && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: 40, left: 24, right: 24, background: 'var(--color-success)', color: 'white', padding: '12px 24px', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center', zIndex: 200, justifyContent: 'center', boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}>
            <Check size={20} />
            <span style={{ fontWeight: 'bold' }}>تم إرسال طلب الحجز بنجاح! الفني بانتظارك 📅🛠️</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export const ProductsScreen = StoresScreen; // Alias since they share product detail UI
export default StoresScreen;
