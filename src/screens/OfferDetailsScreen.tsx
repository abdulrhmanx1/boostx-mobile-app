import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Heart, Star, Clock, MapPin, Plus, ShoppingCart, Check, Eye, ShieldCheck, Sparkles, MessageSquare
} from 'lucide-react';

export interface HSponsoredOffer {
  id: string;
  store_id: string;
  store_name: string;
  store_logo: string;
  product_id: string;
  title: string;
  discount_percent: number;
  sponsored_until: string; // ISO date string or countdown target
  priority: number;
  is_active: boolean;
  image_url: string;
  old_price: number;
  new_price: number;
  description: string;
  rating: number;
  stock_status: 'available' | 'low' | 'out_of_stock';
  delivery_time: string;
  images: string[]; // gallery
  addons?: {
    id: string;
    title: string;
    type: 'select' | 'multiple';
    required: boolean;
    max_selection: number;
    options: {
      name: string;
      extra_price: number;
    }[];
  }[];
  variants?: {
    id: string;
    name: string;
    price_impact: number;
  }[];
}

export const OfferDetailsScreen = ({ 
  offer, 
  onBack, 
  onAddToCart 
}: { 
  offer: HSponsoredOffer; 
  onBack: () => void; 
  onAddToCart?: (item: any) => void;
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(
    offer.variants && offer.variants.length > 0 ? offer.variants[0] : null
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown timer effect
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

  // Calculate live dynamic price based on selections
  const variantPriceImpact = selectedVariant ? selectedVariant.price_impact : 0;
  const extrasPriceImpact = selectedExtras.reduce((sum, extraName) => {
    if (offer.addons) {
      for (const addon of offer.addons) {
        const option = addon.options.find(opt => opt.name === extraName);
        if (option) {
          return sum + option.extra_price;
        }
      }
    }
    return sum;
  }, 0);

  const basePrice = offer.new_price;
  const singleItemPrice = basePrice + variantPriceImpact + extrasPriceImpact;
  const totalPrice = singleItemPrice * quantity;
  const savings = (offer.old_price - offer.new_price) * quantity;

  const toggleExtra = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) 
        ? prev.filter(e => e !== extraName) 
        : [...prev, extraName]
    );
  };

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart({
        id: `offer_${offer.id}`,
        name: offer.title,
        price: `${totalPrice} ر.س`,
        rawPrice: totalPrice,
        qty: quantity,
        extras: [
          ...(selectedVariant ? [`الحجم: ${selectedVariant.name}`] : []),
          ...selectedExtras
        ],
        notes: customerNotes,
        partnerName: offer.store_name
      });
    }
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      style={{ 
        minHeight: '100vh', 
        background: '#120b1f', 
        paddingBottom: '120px', 
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* Floating purple neon glow behind cover */}
      <div style={{ position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)', filter: 'blur(50px)', top: '10%', right: '-40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Immersive Product Gallery Slider */}
      <div style={{ position: 'relative', height: 280, backgroundColor: '#1a112d', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImgIndex}
            src={offer.images[activeImgIndex] || offer.image_url} 
            alt={offer.title} 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </AnimatePresence>
        
        {/* Layered Rich Gradient Glass overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(18,11,31,0.1) 0%, rgba(18,11,31,0.5) 60%, #120b1f 100%)' }} />

        {/* Back and favorite buttons */}
        <div style={{ position: 'absolute', top: 20, right: 20, left: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 }}>
          <button onClick={onBack} style={{ background: 'rgba(26,11,46,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', outline: 'none' }}>
            <ArrowRight size={20} />
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setIsFavorite(!isFavorite)} style={{ background: 'rgba(26,11,46,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
              <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : 'white'} />
            </button>
          </div>
        </div>

        {/* Image Dots Indicator */}
        {offer.images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
            {offer.images.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setActiveImgIndex(i)} 
                style={{ 
                  width: i === activeImgIndex ? 18 : 6, 
                  height: 6, 
                  borderRadius: 3, 
                  background: i === activeImgIndex ? 'var(--color-accent-light)' : 'rgba(255,255,255,0.4)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease' 
                }} 
              />
            ))}
          </div>
        )}

        {/* Store Logo / Info Badge */}
        <div style={{ position: 'absolute', bottom: 16, right: 20, display: 'flex', gap: 10, alignItems: 'center', zIndex: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '2px solid #120b1f', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
            {offer.store_logo || '🍗'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white' }}>{offer.store_name}</span>
              <ShieldCheck size={14} color="#10b981" />
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 'bold' }}>عرض فلاش ممول ⚡</span>
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div style={{ padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* CountDown and Discount Header */}
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.08)', 
          border: '1px solid rgba(239, 68, 68, 0.18)', 
          borderRadius: 18, 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.05)',
          direction: 'rtl',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: 'bold' }}>ينتهي العرض خلال:</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace', letterSpacing: 1 }}>
              {timeLeft}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', background: '#ef4444', padding: '2px 8px', borderRadius: 8, color: 'white', fontWeight: 900 }}>
            {offer.discount_percent}% خصم 🔥
          </span>
        </div>

        {/* Product Title and Price Info */}
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', margin: '0 0 6px 0' }}>{offer.title}</h1>
          
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginTop: 8 }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--color-accent-light)' }}>
              {singleItemPrice} ر.س
            </span>
            <span style={{ fontSize: '0.94rem', color: '#ef4444', textDecoration: 'line-through', fontWeight: 'bold' }}>
              {offer.old_price} ر.س
            </span>
            <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 900 }}>
              وفرت {(offer.old_price - singleItemPrice).toFixed(1)} ر.س! 🎉
            </span>
          </div>
        </div>

        {/* Store Metadata Grid */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.06)', 
          borderRadius: 20, 
          padding: 14, 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: 10, 
          textAlign: 'center',
          marginBottom: 20,
          boxSizing: 'border-box'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>التقييم</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Star size={12} fill="#f59e0b" color="#f59e0b" /> {offer.rating}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>الحالة</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: offer.stock_status === 'available' ? '#10b981' : '#f59e0b' }}>
              {offer.stock_status === 'available' ? 'متوفر' : 'مخزون قليل'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>التوصيل المتوقع</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Clock size={12} color="#7c3aed" /> {offer.delivery_time}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 8 }}>تفاصيل العرض والمواصفات</h3>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0, fontWeight: 'bold' }}>
            {offer.description}
          </p>
        </div>

        {/* Variants Option Selector */}
        {offer.variants && offer.variants.length > 0 && (
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 10 }}>اختر الحجم / الفئة</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {offer.variants.map(variant => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <button 
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      border: '1px solid ' + (isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'),
                      background: isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  >
                    {variant.name} {variant.price_impact > 0 ? `(+${variant.price_impact} ر.س)` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Addons Extras Selector */}
        {offer.addons && offer.addons.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {offer.addons.map(addon => (
              <div key={addon.id} style={{ textAlign: 'right', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  {addon.title} {addon.required ? '(إجباري)' : '(اختياري)'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {addon.options.map(option => {
                    const isChecked = selectedExtras.includes(option.name);
                    return (
                      <div 
                        key={option.name} 
                        onClick={() => toggleExtra(option.name)} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '12px 16px', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid ' + (isChecked ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)'), 
                          borderRadius: 14, 
                          cursor: 'pointer', 
                          direction: 'rtl',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 'bold' }}>
                          {option.name} {option.extra_price > 0 ? `(+${option.extra_price} ر.س)` : ''}
                        </span>
                        <div style={{ width: 22, height: 22, borderRadius: 8, border: '1.5px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isChecked ? 'var(--color-accent)' : 'none', transition: 'all 0.2s', flexShrink: 0 }}>
                          {isChecked && <Check size={14} color="white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Notes */}
        <div style={{ textAlign: 'right', marginBottom: 28 }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 8 }}>ملاحظات العميل</h3>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '10px 14px', boxSizing: 'border-box' }}>
            <textarea 
              rows={2} 
              placeholder="اكتب أي شروط خاصة أو ملاحظات للتوصيل (مثال: بدون بصل، صوص حار جانبي...)" 
              value={customerNotes}
              onChange={e => setCustomerNotes(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', resize: 'none', fontFamily: 'Cairo, sans-serif', fontSize: '0.78rem', textAlign: 'right' }}
            />
          </div>
        </div>

        {/* Quantity Controls & Dynamic Totals Bar */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 20, 
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          boxSizing: 'border-box'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>سعر الإجمالي الديناميكي</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--color-accent-light)' }}>{totalPrice} ر.س</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', direction: 'rtl' }}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', outline: 'none' }}>-</button>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', outline: 'none' }}>+</button>
          </div>
        </div>

        {/* Add to Cart CTA with Liquid Glow */}
        <motion.button 
          onClick={handleAddToCartClick}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', 
            display: 'flex', 
            gap: 12, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '14px', 
            borderRadius: 'var(--radius-pill)', 
            fontWeight: 900, 
            boxShadow: 'var(--glow-accent)',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            outline: 'none',
            fontSize: '0.9rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <ShoppingCart size={18} />
          <span>تأكيد الإضافة السريعة للسلة ({totalPrice} ر.س)</span>
        </motion.button>

      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: 40, left: 24, right: 24, background: 'var(--color-success)', color: 'white', padding: '12px 24px', borderRadius: 12, display: 'flex', gap: 10, zIndex: 200, justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 25px rgba(16,185,129,0.3)' }}>
            <Check size={20} />
            <span style={{ fontWeight: 'bold' }}>تمت إضافة العرض إلى السلة الرقمية بنجاح! 🛒</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default OfferDetailsScreen;
