import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Trash2, CheckCircle2, Gift, ShieldCheck, 
  Sparkles, CheckCheck, Clock, HelpCircle, Bell, Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const NotificationsScreen = ({ 
  onBack,
  currentUser,
  onTrackOrder,
  onViewOffer,
  onViewPartner
}: { 
  onBack: () => void;
  currentUser?: any;
  onTrackOrder?: () => void;
  onViewOffer?: (offer: any) => void;
  onViewPartner?: (partner: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = currentUser?.id || 'usr_cust_1';

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (!supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId);

      if (!error && data) {
        // Sort by created_at descending
        const sorted = [...data].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(sorted);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase.channel('realtime_notifications_screen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      if (!supabase) return;
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUserId);
      
      // Update local state instantly
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      if (!supabase) return;
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!supabase) return;
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Deep-linking callback executor
  const handleNotificationClick = async (notif: any) => {
    // Mark as read first
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }

    // Trigger proper route deep linking
    if (notif.type === 'order' || notif.type === 'service') {
      if (onTrackOrder) onTrackOrder();
    } 
    else if (['offer', 'store_offer', 'flash_offer'].includes(notif.type)) {
      if (onViewOffer) {
        // Construct a premium offer details payload
        const offerPayload = {
          id: notif.id,
          store_id: 'p1',
          store_name: notif.title.includes('النهدي') ? 'صيدلية النهدي الياسمين' : 'مطعم البيك الرواد',
          store_logo: notif.title.includes('النهدي') ? '💊' : '🍗',
          product_id: 'o101',
          title: notif.title,
          discount_percent: 50,
          sponsored_until: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          image_url: notif.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
          old_price: 68.00,
          new_price: 34.00,
          description: notif.body,
          rating: 4.9,
          stock_status: 'available',
          delivery_time: '١٥-٢٠ دقيقة',
          images: [
            notif.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'
          ]
        };
        onViewOffer(offerPayload);
      }
    } 
    else if (notif.type === 'sponsored_campaign' || notif.is_sponsored) {
      if (onViewPartner) {
        // Construct partner payload
        const partnerPayload = {
          id: 'p1',
          name: 'مطعم البيك الرواد',
          category: 'مطاعم',
          rating: 4.9,
          reviews: '١٢.٥ ألف تقييم',
          distance: '١.٢ كم',
          time: '١٥-٢٥ دقيقة',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
          sponsored: true
        };
        onViewPartner(partnerPayload);
      }
    }
  };

  // Helper to get matching type icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircle2 size={20} color="#10b981" />;
      case 'service':
        return <CheckCircle2 size={20} color="#6366f1" />;
      case 'offer':
      case 'store_offer':
      case 'flash_offer':
        return <Gift size={20} color="#ef4444" />;
      case 'sponsored_campaign':
        return <Sparkles size={20} color="#7c3aed" fill="#7c3aed" />;
      default:
        return <HelpCircle size={20} color="#9ca3af" />;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'orders') return n.type === 'order' || n.type === 'service';
    if (activeTab === 'offers') return ['offer', 'store_offer', 'flash_offer', 'sponsored_campaign'].includes(n.type);
    return true;
  });

  // Group notifications by day
  const getGroupedNotifications = () => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const earlier: any[] = [];

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayDate = todayDate - 86400000;

    filteredNotifications.forEach(n => {
      const createdTime = new Date(n.created_at).getTime();
      if (createdTime >= todayDate) {
        today.push(n);
      } else if (createdTime >= yesterdayDate) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = getGroupedNotifications();

  const formatNotificationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
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
        .search-tag-notif {
          padding: 8px 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255,255,255,0.7);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .search-tag-notif.active {
          background: #c084fc;
          border-color: #c084fc;
          color: #1a0b2e;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
        .notif-card {
          background: #ffffff;
          border: 1px solid #eef2f6;
          border-radius: 20px;
          padding: 16px;
          display: flex;
          gap: 14px;
          direction: rtl;
          position: relative;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.015);
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .notif-card.unread {
          background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
          border-color: rgba(168, 85, 247, 0.15);
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.04);
        }
        .notif-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.05);
        }
        .unread-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #7c3aed;
          position: absolute;
          top: 18px;
          left: 18px;
          box-shadow: 0 0 6px #7c3aed;
        }
      ` }} />

      {/* Floating Ambient Glows */}
      <div style={{ position: 'absolute', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, transparent 70%)', filter: 'blur(40px)', top: '15%', right: '-40px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '240px', height: '240px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)', filter: 'blur(35px)', top: '50%', left: '-30px', pointerEvents: 'none' }} />

      {/* 
        =====================================================================
        PART 1: GLOSSY PURPLE CURVED HEADER
        =====================================================================
      */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #2e0854 0%, #15052b 100%)',
          paddingTop: 'calc(env(safe-area-inset-top, 24px) + 12px)',
          paddingBottom: '28px',
          borderBottomLeftRadius: '36px',
          borderBottomRightRadius: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(21, 5, 43, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10
        }}
      >
        {/* Glow Effects */}
        <div style={{ position: 'absolute', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)', filter: 'blur(30px)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
        
        {/* Action Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 18px 20px', direction: 'rtl', boxSizing: 'border-box' }}>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: 'white', margin: 0 }}>التنبيهات والإشعارات 🔔</h2>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0', fontWeight: 'bold' }}>تابع طلباتك، عروضك، وحملاتك الترويجية لحظياً</p>
            </div>
          </div>
          {notifications.some(n => !n.read) && (
            <button 
              onClick={handleMarkAllRead}
              style={{ 
                background: 'rgba(168,85,247,0.12)', 
                border: '1px solid rgba(168,85,247,0.3)', 
                borderRadius: '12px', 
                color: '#c084fc', 
                fontSize: '0.68rem', 
                fontWeight: 900, 
                padding: '6px 12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4 
              }}
            >
              <CheckCheck size={12} />
              قراءة الكل
            </button>
          )}
        </div>

        {/* Dynamic Glass Filter Tabs */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px', direction: 'rtl' }}>
          <div className={`search-tag-notif ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>الكل</div>
          <div className={`search-tag-notif ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>الطلبات والخدمات</div>
          <div className={`search-tag-notif ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>العروض والحملات</div>
        </div>
      </div>

      {/* 
        =====================================================================
        PART 2: NOTIFICATIONS FEED AREA
        =====================================================================
      */}
      <div style={{ padding: '24px 20px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold' }}>جاري تحميل الإشعارات الحية...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #eef2f6', 
              borderRadius: 24, 
              padding: '44px 24px', 
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
              marginTop: 10,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', margin: '0 auto 20px auto', boxShadow: '0 8px 24px rgba(124,58,237,0.1)' }}>
              <Bell size={32} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e0b36', margin: '0 0 8px 0' }}>لا توجد إشعارات جديدة ✨</h3>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 20px 0', lineHeight: 1.5, fontWeight: 'bold' }}>صندوق الإشعارات الخاص بك فارغ تماماً حالياً. سنقوم بإعلامك فور تغيير حالة طلبك أو توفر عروض مميزة حولك!</p>
            <button 
              onClick={onBack}
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', border: 'none', color: 'white', fontSize: '0.8rem', fontWeight: 900, padding: '10px 24px', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}
            >
              العودة للرئيسية
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Today Group */}
            {today.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, direction: 'rtl' }}>
                  <span>اليوم</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(124, 58, 237, 0.08)' }} />
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <AnimatePresence>
                    {today.map(n => (
                      <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleNotificationClick(n)}
                        className={`notif-card ${!n.read ? 'unread' : ''}`}
                      >
                        {/* Icon Container */}
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(124, 58, 237, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.02)' }}>
                          {getNotificationIcon(n.type)}
                        </div>

                        {/* Contents */}
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{n.title}</h4>
                            {n.is_sponsored && (
                              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontSize: '0.58rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                <Sparkles size={8} fill="#7c3aed" />
                                ممول
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: '#4b5563', margin: '4px 0 0 0', lineHeight: 1.45, fontWeight: 'bold' }}>{n.body}</p>
                          <span style={{ fontSize: '0.62rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontWeight: 'bold' }}>
                            <Clock size={10} /> {formatNotificationTime(n.created_at)}
                          </span>
                        </div>

                        {/* Unread Indicator */}
                        {!n.read && <div className="unread-indicator-dot" />}

                        {/* Trash Delete Action */}
                        <button 
                          onClick={(e) => handleDeleteNotification(n.id, e)}
                          style={{ 
                            background: 'rgba(239,68,68,0.06)', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            alignSelf: 'flex-start',
                            outline: 'none'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Yesterday Group */}
            {yesterday.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, direction: 'rtl' }}>
                  <span>أمس</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0, 0, 0, 0.05)' }} />
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <AnimatePresence>
                    {yesterday.map(n => (
                      <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleNotificationClick(n)}
                        className={`notif-card ${!n.read ? 'unread' : ''}`}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(124, 58, 237, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getNotificationIcon(n.type)}
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{n.title}</h4>
                            {n.is_sponsored && (
                              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontSize: '0.58rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                <Sparkles size={8} fill="#7c3aed" />
                                ممول
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: '#4b5563', margin: '4px 0 0 0', lineHeight: 1.45, fontWeight: 'bold' }}>{n.body}</p>
                          <span style={{ fontSize: '0.62rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontWeight: 'bold' }}>
                            <Clock size={10} /> أمس، {formatNotificationTime(n.created_at)}
                          </span>
                        </div>
                        {!n.read && <div className="unread-indicator-dot" />}
                        <button 
                          onClick={(e) => handleDeleteNotification(n.id, e)}
                          style={{ 
                            background: 'rgba(239,68,68,0.06)', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            alignSelf: 'flex-start',
                            outline: 'none'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Earlier Group */}
            {earlier.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, direction: 'rtl' }}>
                  <span>سابقاً</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0, 0, 0, 0.04)' }} />
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <AnimatePresence>
                    {earlier.map(n => (
                      <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleNotificationClick(n)}
                        className={`notif-card ${!n.read ? 'unread' : ''}`}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(124, 58, 237, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getNotificationIcon(n.type)}
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{n.title}</h4>
                            {n.is_sponsored && (
                              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontSize: '0.58rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                <Sparkles size={8} fill="#7c3aed" />
                                ممول
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.74rem', color: '#4b5563', margin: '4px 0 0 0', lineHeight: 1.45, fontWeight: 'bold' }}>{n.body}</p>
                          <span style={{ fontSize: '0.62rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontWeight: 'bold' }}>
                            <Clock size={10} /> {new Date(n.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        {!n.read && <div className="unread-indicator-dot" />}
                        <button 
                          onClick={(e) => handleDeleteNotification(n.id, e)}
                          style={{ 
                            background: 'rgba(239,68,68,0.06)', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            alignSelf: 'flex-start',
                            outline: 'none'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </motion.div>
  );
};
export default NotificationsScreen;
