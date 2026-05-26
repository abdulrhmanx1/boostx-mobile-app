import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock3, ArrowLeft, MapPin, Truck, Compass, CheckCircle2, ShieldAlert, Sparkles, Navigation, User, Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const OrdersScreen = ({ 
  onTrackOrderClick, 
  onReorderClick 
}: { 
  onTrackOrderClick: (orderId?: string) => void;
  onReorderClick?: () => void;
}) => {
  const [orderTab, setOrderTab] = useState<'current' | 'previous' | 'cancelled'>('current');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Supabase Sandbox
  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*');

      if (!error && data) {
        // Sort by created_at descending
        const sorted = [...data].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sorted);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime orders changes
    const channel = supabase.channel('realtime_orders_screen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Filter orders based on selected tab
  const filteredOrders = orders.filter(o => {
    const status = (o.status || '').toLowerCase();
    const isCompleted = ['completed', 'delivered', 'مكتمل', 'تم التسليم', 'تم تسليم الطلب'].includes(status);
    const isCancelled = ['cancelled', 'ملغى', 'ملغي'].includes(status);

    if (orderTab === 'previous') return isCompleted;
    if (orderTab === 'cancelled') return isCancelled;
    return !isCompleted && !isCancelled;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ 
        background: '#f8f9fc', 
        minHeight: '100vh',
        padding: '0 20px 120px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20,
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
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

      {/* Floating purple glow background elements */}
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)', filter: 'blur(40px)', top: '15%', right: '-40px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)', filter: 'blur(35px)', top: '55%', left: '-40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'calc(env(safe-area-inset-top, 24px) + 12px)', marginBottom: '4px', position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>تتبع وإدارة الطلبات 📦</h2>
          <p style={{ fontSize: '0.68rem', color: '#6b7280', margin: '2px 0 0 0', fontWeight: 'bold' }}>تابع خط سير المندوب وتحديثات الطلبات الفورية</p>
        </div>
      </div>
      
      {/* Premium Tab Switcher */}
      <div style={{ 
        display: 'flex', 
        background: '#ffffff', 
        borderRadius: 24, 
        padding: 4, 
        border: '1px solid #eef2f6',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        zIndex: 1
      }}>
        {[
          { id: 'current', label: 'الطلبات النشطة' },
          { id: 'previous', label: 'الطلبات السابقة' },
          { id: 'cancelled', label: 'الملغاة' }
        ].map(tab => {
          const isTabActive = orderTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setOrderTab(tab.id as any)}
              style={{ 
                flex: 1, 
                padding: '10px 12px', 
                borderRadius: 20, 
                border: 'none', 
                background: isTabActive ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' : 'transparent',
                color: isTabActive ? 'white' : '#6b7280',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: isTabActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                boxSizing: 'border-box'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold' }}>جاري جلب قائمة طلباتك النشطة...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #eef2f6', 
            borderRadius: 22, 
            padding: '40px 20px', 
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
            boxSizing: 'border-box'
          }}>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(107,114,128,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', margin: '0 auto 16px auto' }}>
              <Compass size={28} />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 'bold' }}>لا توجد طلبات في هذا القسم حالياً</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const getStatusDetails = (statusStr: string) => {
              const status = (statusStr || '').toLowerCase();
              if (['pending', 'قيد الانتظار', 'accepted', 'تم قبول طلبك'].includes(status)) {
                return { label: 'قيد الانتظار', color: '#d97706', bg: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', progress: 15 };
              }
              if (['preparing', 'جاري التجهيز', 'جاري التجهيز 👨‍🍳'].includes(status)) {
                return { label: 'جاري التجهيز 👨‍🍳', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', progress: 45 };
              }
              if (['delivering', 'في الطريق', 'المندوب في الطريق', 'في الطريق للاستلام', 'heading_to_pickup', 'جاري التوصيل ⚡', 'delivering'].includes(status)) {
                return { label: 'جاري التوصيل ⚡', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', progress: 80, glow: true };
              }
              if (['completed', 'delivered', 'مكتمل', 'تم التسليم', 'تم تسليم الطلب'].includes(status)) {
                return { label: 'مكتمل ✔️', color: '#10b981', bg: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', progress: 100 };
              }
              if (['cancelled', 'ملغى', 'ملغي'].includes(status)) {
                return { label: 'ملغى ❌', color: '#ef4444', bg: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', progress: 0 };
              }
              return { label: statusStr, color: '#1e0b36', bg: '#f1f5f9', border: '1px solid #eef2f6', progress: 50 };
            };

            const statusInfo = getStatusDetails(order.status);
            const isCompleted = ['completed', 'delivered', 'مكتمل', 'تم التسليم', 'تم تسليم الطلب'].includes((order.status || '').toLowerCase());
            const isCancelled = ['cancelled', 'ملغى', 'ملغي'].includes((order.status || '').toLowerCase());

            return (
              <motion.div 
                key={order.id} 
                whileTap={{ scale: 0.99 }}
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #eef2f6', 
                  borderRadius: 22, 
                  overflow: 'hidden',
                  boxShadow: statusInfo.glow ? '0 10px 24px rgba(16,185,129,0.06)' : '0 6px 18px rgba(0,0,0,0.01)',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              >
                {/* Upper Section */}
                <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center', direction: 'rtl', boxSizing: 'border-box' }}>
                  <div style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f1f5f9', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                    <img 
                      src={order.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80'} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4, boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>
                        {order.pickup_location?.split(' - ')[0] || 'مطعم البيك الرواد'}
                      </h3>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 900, 
                        padding: '3px 8px', 
                        borderRadius: 10, 
                        color: statusInfo.color, 
                        background: statusInfo.bg,
                        border: statusInfo.border
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 'bold' }}>طلب #{order.id} • توصيل</span>
                    <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220, fontWeight: 'bold' }}>
                      {order.items || 'وجبة مسحب حراق + حمّص مميّز'}
                    </p>
                  </div>
                </div>

                {/* Animated progress bar for active orders */}
                {!isCancelled && !isCompleted && (
                  <div style={{ padding: '0 16px 12px 16px', boxSizing: 'border-box' }}>
                    <div style={{ width: '100%', height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${statusInfo.progress}%` }} 
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed 0%, #10b981 100%)', borderRadius: 2 }} 
                      />
                    </div>
                  </div>
                )}

                {/* Active driver section if available */}
                {order.driver_name && (
                  <div style={{ 
                    background: 'rgba(124,58,237,0.02)', 
                    borderTop: '1px solid #f8fafc',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    direction: 'rtl',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ffffff', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        👨‍✈️
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#1e0b36', display: 'block' }}>المندوب: {order.driver_name}</span>
                        <span style={{ fontSize: '0.62rem', color: '#6b7280', display: 'block', fontWeight: 'bold' }}>⭐ 4.9 • {order.driver_vehicle || 'توصيل نيون سريع'}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onTrackOrderClick(order.id)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #eef2f6',
                        borderRadius: 12,
                        padding: '6px 12px',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        color: '#7c3aed',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                      }}
                    >
                      <Navigation size={12} fill="#7c3aed" />
                      <span>خريطة التتبع</span>
                    </button>
                  </div>
                )}

                {/* Bottom Pricing Summary Row */}
                <div style={{ 
                  background: '#f8f9fc', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px solid #eef2f6',
                  direction: 'rtl',
                  flexWrap: 'wrap',
                  gap: 12,
                  boxSizing: 'border-box'
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', fontWeight: 'bold' }}>إجمالي الفاتورة</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#7c3aed' }}>{order.total_price || '٦١.٠٠'} ر.س</span>
                  </div>

                  {!isCancelled && !isCompleted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e0b36', fontSize: '0.74rem', fontWeight: 800 }}>
                      <Clock3 size={14} color="#7c3aed" />
                      <span>الوقت المتوقع: <strong style={{ color: '#10b981' }}>{order.eta || 15} دقيقة</strong></span>
                    </div>
                  )}

                  <div style={{ marginRight: 'auto' }}>
                    {!isCancelled && !isCompleted ? (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.72rem', borderRadius: 10, boxShadow: 'none' }}
                        onClick={() => onTrackOrderClick(order.id)}
                      >
                        تتبع الطلب الفوري
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '0.72rem', borderRadius: 10, border: '1px solid #eef2f6', color: '#4b5563', background: '#ffffff', boxSizing: 'border-box' }}
                        onClick={() => {
                          if (onReorderClick) onReorderClick();
                        }}
                      >
                        إعادة طلب السلة
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
export default OrdersScreen;
