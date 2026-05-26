import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, MapPin, Navigation2, Check, Star, MessageCircle, Phone, ShieldAlert, Utensils
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const TrackingScreen = ({ orderId, onBack }: { orderId?: string | null; onBack: () => void }) => {
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [showChatPane, setShowChatPane] = useState(false);
  const [driverProgress, setDriverProgress] = useState(0); // 0 to 100
  const [isSimulating, setIsSimulating] = useState(true); // Default to local simulation for modularity

  const targetOrderId = orderId || 'order-101';

  // Bezier coordinates fallback
  const p0 = { x: 120, y: 150 };
  const p1 = { x: 320, y: 250 };
  const p2 = { x: 200, y: 380 };

  // Fetch active order and driver location from live DB
  const refreshTrackingData = async () => {
    try {
      const { data: order } = await supabase.from('orders').select('*').eq('id', targetOrderId).single();
      if (order) {
        setActiveOrder(order);
        const { data: loc } = await supabase.from('driver_locations').select('*').eq('order_id', order.id).single();
        if (loc) {
          setDriverLocation(loc);
        }
      }
    } catch (e) {
      console.log('Using local sandbox tracking simulation.');
    }
  };

  useEffect(() => {
    if (!isSimulating) {
      refreshTrackingData();
      const handleRealtime = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail.table === 'orders' && detail.record.id === targetOrderId) {
          setActiveOrder(detail.record);
        }
        if (detail.table === 'driver_locations' && detail.record.order_id === targetOrderId) {
          setDriverLocation(detail.record);
        }
      };
      window.addEventListener('BX_REALTIME_CHANGE', handleRealtime);
      return () => {
        window.removeEventListener('BX_REALTIME_CHANGE', handleRealtime);
      };
    }
  }, [isSimulating, targetOrderId]);

  // Standard simulation logic when no real database updates are coming
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setDriverProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Compute map marker coordinates
  let driverX = p0.x;
  let driverY = p0.y;
  let currentStatus = activeOrder?.status || 'في الطريق للاستلام';
  let eta = 15;

  if (isSimulating || !activeOrder) {
    const t = driverProgress / 100;
    driverX = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    driverY = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
    eta = Math.max(1, Math.round(25 - (t * 20)));
    if (t < 0.25) currentStatus = 'في الطريق للاستلام';
    else if (t < 0.5) currentStatus = 'تم الاستلام';
    else if (t < 0.8) currentStatus = 'في الطريق للعميل';
    else if (t < 0.98) currentStatus = 'وصلت للموقع';
    else currentStatus = 'تم التسليم';
  } else {
    const latStart = activeOrder.pickup_latitude || 24.7136;
    const latEnd = activeOrder.dropoff_latitude || 24.7885;
    const currentLat = driverLocation?.latitude || latStart;

    const t = Math.min(1, Math.max(0, (currentLat - latStart) / (latEnd - latStart)));
    driverX = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    driverY = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;

    if (currentStatus === 'تم التسليم') eta = 0;
    else if (currentStatus === 'وصلت للموقع') eta = 1;
    else eta = Math.max(1, Math.round((1 - t) * 15));
  }

  const timelineSteps = [
    { id: 'accepted', label: 'تم قبول الطلب', desc: 'تم إسناد التوصيل للمندوب بنجاح', active: true },
    { id: 'pickup', label: 'في الطريق للاستلام', desc: 'المندوب يتجه حالياً لنقطة المتجر', active: currentStatus !== 'pending' },
    { id: 'picked_up', label: 'تم استلام الشحنة', desc: 'استلم المندوب شحنتك وهي ساخنة ومعقمة', active: ['تم الاستلام', 'في الطريق للعميل', 'وصلت للموقع', 'تم التسليم'].includes(currentStatus) },
    { id: 'on_the_way', label: 'في الطريق إليك', desc: 'مندوبنا الذكي ينطلق لموقعك الحركي', active: ['في الطريق للعميل', 'وصلت للموقع', 'تم التسليم'].includes(currentStatus) },
    { id: 'arrived', label: 'تم التسليم بنجاح', desc: 'استمتع بطلبك ونأمل تقييم الخدمة', active: currentStatus === 'تم التسليم' }
  ];

  const items = [
    { name: '٢x وجبة البيك مسحب حراق', price: '٤٤.٠٠ ر.س' },
    { name: '١x بطاطس مع ثوم إضافي', price: '٨.٠٠ ر.س' },
  ];

  const isCompleted = currentStatus === 'تم التسليم';

  return (
    <motion.div 
      className="order-tracking-container" 
      initial={{ opacity: 0, y: 100 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 100 }} 
      transition={{ type: "spring", stiffness: 200, damping: 25 }} 
      style={{ 
        position: 'fixed', 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100vw',
        background: '#120b1f',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Bar Navigation */}
      <div className="tracking-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'calc(env(safe-area-inset-top, 24px) + 12px) 20px 16px 20px', zIndex: 10, position: 'relative', background: 'rgba(18, 11, 31, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <button className="btn-back" style={{ position: 'static' }} onClick={onBack}><ArrowRight size={20} /></button>
        <h2 style={{ fontSize: '1.05rem', color: 'white', fontWeight: 900, margin: 0 }}>تتبع الطلب المباشر #{targetOrderId.replace('order-', '')}</h2>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          style={{
            background: isSimulating ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid ' + (isSimulating ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.1)'),
            color: isSimulating ? 'var(--color-success)' : 'white',
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {isSimulating ? 'محاكاة نشطة' : 'تتبع حقيقي (DB)'}
        </button>
      </div>

      {/* Futuristic Map Canvas */}
      <div className="map-bg" style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 300, background: '#120b1f' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.7 }}></div>
        
        <svg className="map-route-svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          <path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none" stroke="var(--color-accent-light)" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
        </svg>

        {/* Live Badge */}
        <div className="live-badge" style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: 'rgba(26,15,46,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" style={{ width: 8, height: 8, background: 'var(--color-success)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-success)' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
            {isSimulating ? 'وضع المحاكاة النشط' : `سرعة المندوب: ${driverLocation?.speed || 35} كم/س`}
          </span>
        </div>

        {/* Pickup & Dropoff Markers */}
        <motion.div style={{ position: 'absolute', top: p0.y, left: p0.x, transform: 'translate(-50%, -50%)', width: 44, height: 44, background: 'var(--color-primary-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-light)', border: '2px solid var(--color-accent)', boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)', zIndex: 8 }}>
          <Utensils size={20} />
        </motion.div>
        <motion.div style={{ position: 'absolute', top: p2.y, left: p2.x, transform: 'translate(-50%, -50%)', width: 44, height: 44, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', border: '2px solid var(--color-accent-light)', zIndex: 8 }}>
          <MapPin size={22} color="var(--color-accent)" />
        </motion.div>

        {/* Live Driver Marker */}
        <motion.div style={{ position: 'absolute', top: driverY, left: driverX, transform: 'translate(-50%, -50%)', width: 46, height: 46, background: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid white', zIndex: 12, boxShadow: '0 0 25px rgba(16,185,129,0.6)' }}>
          <Navigation2 size={22} style={{ transform: `rotate(${(driverLocation?.heading || 45) - 45}deg)` }} />
        </motion.div>
      </div>

      {/* Information Panel Bottom Sheet */}
      <div className="tracking-sheet" style={{ background: 'var(--color-primary-dark)', borderTop: '1px solid var(--glass-border)', padding: '20px', borderTopLeftRadius: 28, borderTopRightRadius: 28, zIndex: 20, boxShadow: '0 -10px 30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '50vh', overflowY: 'auto' }}>
        <div className="sheet-handle" style={{ margin: '0 auto 4px', width: 40, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}></div>
        
        {/* Estimated Time (ETA) */}
        <div className="eta-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>حالة الشحنة الحالية</span>
            <strong style={{ color: 'white', fontSize: '1rem', fontWeight: 900 }}>{currentStatus}</strong>
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>{eta}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: 4 }}>دقائق للوصول</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="tracking-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 6px' }}>
          {timelineSteps.map((step, idx) => (
            <div key={step.id} className="timeline-step" style={{ display: 'flex', gap: 12, opacity: step.active ? 1 : 0.35 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: step.active ? 'var(--color-success)' : 'rgba(255,255,255,0.05)', border: '2px solid ' + (step.active ? 'transparent' : 'rgba(255,255,255,0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.active && <Check size={10} color="white" />}
                </div>
                {idx < timelineSteps.length - 1 && <div style={{ width: 1.5, height: 20, background: 'rgba(255,255,255,0.06)', marginTop: 4 }}></div>}
              </div>
              <div style={{ textAlign: 'right', flex: 1 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', margin: 0 }}>{step.label}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Driver Profile */}
        <div className="driver-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="driver-info" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: 'white' }}>أ</div>
            <div className="driver-details" style={{ textAlign: 'right' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white', margin: 0 }}>أحمد محمد (المندوب)</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0' }}>تويوتا كامري - أ ب ج ١٢٣</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning)', fontSize: '0.72rem', fontWeight: 700 }}>
                <Star size={10} fill="currentColor" /> ٤.٩ (مندوب توصيل ممتاز)
              </div>
            </div>
          </div>
          <div className="driver-actions" style={{ display: 'flex', gap: 8 }}>
            <button className="action-circle-btn chat" onClick={() => setShowChatPane(true)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MessageCircle size={16} />
            </button>
            <a href="tel:+966522222222" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <Phone size={16} />
            </a>
            <a href="https://wa.me/966522222222" target="_blank" rel="noreferrer" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 900 }}>WA</span>
            </a>
          </div>
        </div>

        {/* Privacy Note */}
        <div style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: 12, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <ShieldAlert size={16} color="var(--color-accent-light)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', flex: 1 }}>🛡️ حماية الخصوصية: يتم إخفاء بيانات الاتصال وأرقام الهواتف تلقائياً بمجرد إتمام التوصيل بنجاح.</span>
        </div>

        {/* Receipts Summary */}
        <div className="order-summary" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-lg)', padding: 14, border: '1px solid rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6, textAlign: 'right' }}>تفاصيل وجبتك من برجر النيون</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((item, idx) => (
              <div key={idx} className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                <span>{item.name}</span>
                <span>{item.price}</span>
              </div>
            ))}
            <div className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <span>رسوم التوصيل</span>
              <span>١٢.٠٠ ر.س</span>
            </div>
            <div className="order-total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-accent-light)', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8, marginTop: 4 }}>
              <span>الإجمالي شامل الضريبة</span>
              <span>٥٦.٠٠ ر.س</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
