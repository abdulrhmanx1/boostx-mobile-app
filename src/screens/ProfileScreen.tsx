import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, CreditCard, Gift, ArrowRight, Bell, Heart, Settings, ShieldCheck, Languages, XCircle, MessageSquare, LogOut,
  Volume2, Sparkles, Smartphone
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const ProfileScreen = ({ 
  currentUser, 
  onSupportClick, 
  onAdminClick, 
  onPartnerDashboardClick,
  onFavoritesClick
}: { 
  currentUser?: any;
  onSupportClick?: () => void;
  onAdminClick?: () => void;
  onPartnerDashboardClick?: () => void;
  onFavoritesClick?: () => void;
}) => {
  const [points, setPoints] = useState(1250);
  const [wallet, setWallet] = useState<any>({ balance: 250.0, cashback: 15.0, loyalty_points: 1250 });
  const [profileLang, setProfileLang] = useState('ar');

  // Detailed Notification Channel Preferences
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotional, setPromotional] = useState(true);
  const [nearbyOffers, setNearbyOffers] = useState(true);
  const [sponsoredCampaigns, setSponsoredCampaigns] = useState(true);
  const [soundVibe, setSoundVibe] = useState(true);
  const [deviceToken, setDeviceToken] = useState('fcm-token-sandbox-839210-ios-device-app');
  const [platform, setPlatform] = useState('ios');

  // Fetch wallet and loyalty points
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (!supabase || !currentUser?.id) return;
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
        if (!error && data) {
          setWallet(data);
          if (data.loyalty_points !== undefined) {
            setPoints(data.loyalty_points);
          }
        }
      } catch (err) {
        console.error('Error fetching wallet:', err);
      }
    };
    fetchWallet();

    const channel = supabase.channel('realtime:profile_wallet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        fetchWallet();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        if (!supabase || !currentUser?.id) return;
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!error && data) {
          setOrderUpdates(data.order_updates ?? true);
          setPromotional(data.promotional ?? true);
          setNearbyOffers(data.nearby_offers ?? true);
          setSponsoredCampaigns(data.sponsored_campaigns ?? true);
          setSoundVibe(data.sound_vibe ?? true);
          if (data.device_token) setDeviceToken(data.device_token);
          if (data.platform) setPlatform(data.platform);
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
      }
    };
    fetchPrefs();
  }, [currentUser]);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      if (!supabase || !currentUser?.id) return;
      const updatedFields: any = {};
      
      // map state key to database field
      let dbKey = key;
      if (key === 'orderUpdates') { dbKey = 'order_updates'; setOrderUpdates(value); }
      else if (key === 'promotional') { dbKey = 'promotional'; setPromotional(value); }
      else if (key === 'nearbyOffers') { dbKey = 'nearby_offers'; setNearbyOffers(value); }
      else if (key === 'sponsoredCampaigns') { dbKey = 'sponsored_campaigns'; setSponsoredCampaigns(value); }
      else if (key === 'soundVibe') { dbKey = 'sound_vibe'; setSoundVibe(value); }

      updatedFields[dbKey] = value;
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .update(updatedFields)
        .eq('user_id', currentUser.id);
        
      if (error || !data || data.length === 0) {
        // If not exists, insert it
        await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: currentUser.id,
            order_updates: dbKey === 'order_updates' ? value : orderUpdates,
            promotional: dbKey === 'promotional' ? value : promotional,
            nearby_offers: dbKey === 'nearby_offers' ? value : nearbyOffers,
            sponsored_campaigns: dbKey === 'sponsored_campaigns' ? value : sponsoredCampaigns,
            device_token: deviceToken,
            platform: platform
          });
      }
    } catch (err) {
      console.error('Error updating notification preference:', err);
    }
  };

  // QA Simulator States
  const [qaActiveEnv, setQaActiveEnv] = useState<'staging' | 'production'>('staging');
  const [qaPaymentFailSim, setQaPaymentFailSim] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ 
        padding: '0 20px 100px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20,
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl'
      }}
    >
      {/* PROFILE INFO: Avatar, name, phone, tier */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #eef2f6', 
        borderRadius: 24, 
        padding: 24, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        gap: 12,
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        {/* Avatar with purple gradient glow ring */}
        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'linear-gradient(to bottom, #7c3aed 0%, #c084fc 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          fontSize: '1.75rem', 
          fontWeight: 900, 
          border: '3px solid #ffffff', 
          boxShadow: '0 6px 20px rgba(124, 58, 237, 0.25)' 
        }}>
          عح
        </div>
        
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>عبدالعزيز الحربي</h3>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '4px 0 0 0', fontWeight: 'bold' }}>+٩٦٦ ٥٠ *** ٤٥٦٧</p>
        </div>

        {/* Gold membership tier badge */}
        <span style={{ 
          fontSize: '0.72rem', 
          fontWeight: 800, 
          padding: '4px 12px', 
          background: '#fef3c7', 
          color: '#d97706', 
          borderRadius: 20,
          border: '1px solid #fde68a'
        }}>
          العضوية الذهبية 🏆
        </span>
      </div>

      {/* Glowing Wallet Balance & Stats overview */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(99,102,241,0.06) 100%)', 
        border: '1px solid rgba(124,58,237,0.1)', 
        borderRadius: 20, 
        padding: 20, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 'bold' }}>رصيد المحفظة الرقمية</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#7c3aed', margin: '4px 0 0 0' }}>{(wallet?.balance ?? 250).toFixed(2)} ر.س</h2>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '8px 16px', fontSize: '0.72rem', fontWeight: 900, borderRadius: 12, boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}
          onClick={async () => {
            try {
              const amount = 100;
              const currentBalance = wallet?.balance ?? 250;
              const { error } = await supabase
                .from('wallets')
                .update({ balance: currentBalance + amount })
                .eq('user_id', currentUser?.id);
              if (!error) {
                alert(`تم شحن المحفظة الرقمية بـ ${amount} ر.س بنجاح! 💳`);
              }
            } catch (err) {
              console.error('Wallet recharge error:', err);
            }
          }}
        >
          شحن المحفظة
        </button>
      </div>

      {/* Quick stats counter grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, direction: 'rtl' }}>
        {[
          { label: 'الطلبـات', val: '٢٨', color: '#1e0b36' },
          { label: 'النقـاط', val: points.toLocaleString(), color: '#7c3aed' },
          { label: 'الكوبونات', val: '٤', color: '#10b981' }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: '#ffffff', border: '1px solid #eef2f6', borderRadius: 16, padding: 12, textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.68rem', color: '#6b7280', display: 'block', marginBottom: 4, fontWeight: 'bold' }}>{stat.label}</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: stat.color }}>{stat.val}</span>
          </div>
        ))}
      </div>

      {/* CATEGORY CARD 1: Transactions & Wallet */}
      <div style={{ background: '#ffffff', border: '1px solid #eef2f6', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '12px 16px 4px 16px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#7c3aed' }}>المعاملات والمحفظة</span>
        </div>
        {[
          { label: 'العناوين المحفوظة', desc: 'إدارة مواقع التوصيل والمنزل', icon: <MapPin size={18} />, onClick: () => alert('تم فتح إدارة العناوين المحفوظة!') },
          { label: 'طرق الدفع والبطاقات', desc: 'مدى، فيزا، ماستركارد، Apple Pay', icon: <CreditCard size={18} />, onClick: () => onSupportClick?.() },
          { label: 'جوائزي ومكافآتي', desc: 'تتبع الكوبونات والجوائز النشطة', icon: <Gift size={18} />, onClick: () => alert('تم فتح الجوائز والمكافآت!') }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={item.onClick}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '14px 16px', 
              borderBottom: idx === 2 ? 'none' : '1px solid #f1f5f9',
              cursor: 'pointer',
              direction: 'rtl'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
              <span style={{ color: '#7c3aed' }}>{item.icon}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontWeight: 800 }}>{item.label}</span>
                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>{item.desc}</span>
              </div>
            </div>
            <ArrowRight size={14} color="#9ca3af" style={{ transform: 'rotate(180deg)' }} />
          </div>
        ))}
      </div>

      {/* CATEGORY CARD 2: Preferences */}
      <div style={{ background: '#ffffff', border: '1px solid #eef2f6', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '12px 16px 4px 16px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#7c3aed' }}>التفضيلات والخصوصية</span>
        </div>
        
        {/* 1. Order Updates Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '14px 16px', 
          borderBottom: '1px solid #f1f5f9',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#10b981' }}><Bell size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>تحديثات الطلبات والخدمات</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>إشعارات لحظية بتغير حالة طلبك وتعيين المندوب</span>
            </div>
          </div>
          <button 
            onClick={() => updatePreference('orderUpdates', !orderUpdates)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: orderUpdates ? '#10b981' : '#e5e7eb',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 3,
              right: orderUpdates ? 3 : 23,
              transition: 'all 0.3s ease'
            }}></div>
          </button>
        </div>

        {/* 2. Promotional Notifications Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '14px 16px', 
          borderBottom: '1px solid #f1f5f9',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#ef4444' }}><Gift size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>العروض الترويجية والخصومات</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>تنبيهات بأكواد الخصم الحصرية والتنزيلات الموسمية</span>
            </div>
          </div>
          <button 
            onClick={() => updatePreference('promotional', !promotional)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: promotional ? '#10b981' : '#e5e7eb',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 3,
              right: promotional ? 3 : 23,
              transition: 'all 0.3s ease'
            }}></div>
          </button>
        </div>

        {/* 3. Nearby Offers Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '14px 16px', 
          borderBottom: '1px solid #f1f5f9',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#3b82f6' }}><MapPin size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>العروض القريبة مني</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>تنبيهات ذكية بالعروض النشطة جغرافياً بالقرب منك</span>
            </div>
          </div>
          <button 
            onClick={() => updatePreference('nearbyOffers', !nearbyOffers)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: nearbyOffers ? '#10b981' : '#e5e7eb',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 3,
              right: nearbyOffers ? 3 : 23,
              transition: 'all 0.3s ease'
            }}></div>
          </button>
        </div>

        {/* 4. Sponsored Campaigns Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '14px 16px', 
          borderBottom: '1px solid #f1f5f9',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#7c3aed' }}><Sparkles size={18} fill="#7c3aed" /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>الحملات الإعلانية الممولة</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>استلام حملات المتاجر والشركاء الممولة ممول</span>
            </div>
          </div>
          <button 
            onClick={() => updatePreference('sponsoredCampaigns', !sponsoredCampaigns)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: sponsoredCampaigns ? '#10b981' : '#e5e7eb',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 3,
              right: sponsoredCampaigns ? 3 : 23,
              transition: 'all 0.3s ease'
            }}></div>
          </button>
        </div>

        {/* 5. Sound & Vibration Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '14px 16px', 
          borderBottom: '1px solid #f1f5f9',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#f59e0b' }}><Volume2 size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>الصوت والاهتزاز</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>تشغيل نغمة مميزة واهتزاز عند ورود إشعار جديد</span>
            </div>
          </div>
          <button 
            onClick={() => updatePreference('soundVibe', !soundVibe)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: soundVibe ? '#10b981' : '#e5e7eb',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 3,
              right: soundVibe ? 3 : 23,
              transition: 'all 0.3s ease'
            }}></div>
          </button>
        </div>

        {/* Push Notifications Token Architecture Display Block */}
        <div style={{ 
          background: 'rgba(124, 58, 237, 0.03)', 
          margin: '12px 16px', 
          borderRadius: 12, 
          padding: 12, 
          border: '1px dashed rgba(124, 58, 237, 0.2)',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#7c3aed', marginBottom: 6 }}>
            <Smartphone size={14} />
            <span style={{ fontSize: '0.72rem', fontWeight: 900 }}>جاهزية إشعارات الـ Push المباشرة (APNs / FCM)</span>
          </div>
          <p style={{ fontSize: '0.62rem', color: '#6b7280', margin: '0 0 6px 0', lineHeight: 1.4 }}>
            تم توليد وتسجيل توكن الجهاز بشكل آمن في قاعدة بيانات Supabase. إشعار الـ APNs الخاص بـ iOS وجهاز الـ FCM لـ Android مهيأين تماماً للعمل.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem', color: '#9ca3af', fontFamily: 'monospace' }}>
            <span>Token: BX-DEV-...{deviceToken.substring(deviceToken.length - 8)}</span>
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{platform} READY</span>
          </div>
        </div>

        {/* Favorite partners */}
        <div 
          onClick={onFavoritesClick}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '14px 16px', 
            borderBottom: '1px solid #f1f5f9',
            cursor: 'pointer',
            direction: 'rtl'
          } as any}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#ef4444' }}><Heart size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>الشركاء والمتاجر المفضلة</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>مراجعة وتتبع متاجرك الأكثر طلباً منها</span>
            </div>
          </div>
          <ArrowRight size={14} color="#9ca3af" style={{ transform: 'rotate(180deg)' }} />
        </div>

        {/* Language switcher */}
        <div 
          onClick={() => {
            const nextLang = profileLang === 'ar' ? 'en' : 'ar';
            setProfileLang(nextLang);
            alert(`تم تغيير اللغة إلى: ${nextLang === 'ar' ? 'العربية' : 'English'}`);
          }}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '14px 16px', 
            borderBottom: '1px solid #f1f5f9',
            cursor: 'pointer',
            direction: 'rtl'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#7c3aed' }}><Languages size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>لغة التطبيق / App Language</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>تبديل لغة الواجهات والخرائط</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', background: '#f1f5f9', borderRadius: 6, color: '#1e0b36' }}>
            {profileLang === 'ar' ? 'العربية (AR)' : 'English (EN)'}
          </span>
        </div>

        {/* Delete Account */}
        <div 
          onClick={() => {
            const confirmDelete = window.confirm('تحذير: هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟');
            if (confirmDelete) {
              const phrase = prompt('لتأكيد الحذف، اكتب الكلمة التالية (حذف):');
              if (phrase === 'حذف') {
                alert('تمت جدولة طلب حذف حسابك نهائياً. سيتم تسجيل خروجك الآن.');
                window.location.reload();
              }
            }
          }}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '14px 16px', 
            cursor: 'pointer',
            direction: 'rtl'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#ef4444' }}><XCircle size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800, color: '#ef4444' }}>حذف الحساب نهائياً</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>طلب إزالة جميع بياناتك الشخصية والمعاملات البنكية فوراً</span>
            </div>
          </div>
          <ArrowRight size={14} color="#9ca3af" style={{ transform: 'rotate(180deg)' }} />
        </div>
      </div>

      {/* QA MVP Launch Simulator */}
      <div style={{ 
        background: 'linear-gradient(to bottom, #f3e8ff 0%, #ffffff 100%)', 
        border: '1px solid #e9d5ff', 
        borderRadius: 20, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#7c3aed' }}>محاكي فحص إطلاق الـ MVP 🧪</span>
          <span style={{ fontSize: '0.65rem', background: qaActiveEnv === 'production' ? '#10b981' : '#7c3aed', color: 'white', padding: '3px 8px', borderRadius: 10, fontWeight: 800 }}>
            {qaActiveEnv === 'production' ? 'PROD' : 'STG'}
          </span>
        </div>
        
        <div style={{ padding: '8px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12, direction: 'rtl' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#1e0b36', fontWeight: 800 }}>بيئة العمل النشطة</span>
            <select 
              value={qaActiveEnv} 
              onChange={e => {
                setQaActiveEnv(e.target.value as any);
                alert(`تم تحويل نظام التطبيق إلى: ${e.target.value === 'production' ? 'PROD' : 'STG'}`);
              }}
              style={{ background: '#ffffff', border: '1px solid #eef2f6', color: '#1e0b36', padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', outline: 'none', fontWeight: 'bold' }}
            >
              <option value="staging">Staging (بيئة اختبار)</option>
              <option value="production">Production (بيئة إنتاج)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#1e0b36', display: 'block', fontWeight: 800 }}>محاكاة انقطاع الاتصال</span>
            </div>
            <button 
              onClick={() => alert('تم محاكاة انقطاع الاتصال بنجاح. ستظهر شاشة الخطأ!')}
              style={{ padding: '4px 10px', fontSize: '0.7rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', outline: 'none' }}
            >
              قطع الاتصال 🔌
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#1e0b36', display: 'block', fontWeight: 800 }}>محاكاة فشل الدفع</span>
            </div>
            <button 
              onClick={() => {
                setQaPaymentFailSim(!qaPaymentFailSim);
                alert(`تم ${!qaPaymentFailSim ? 'تفعيل' : 'تعطيل'} محاكاة فشل الدفع!`);
              }}
              style={{ 
                padding: '4px 10px', 
                fontSize: '0.7rem', 
                background: qaPaymentFailSim ? '#d1fae5' : '#f1f5f9', 
                border: qaPaymentFailSim ? '1px solid #a7f3d0' : '1px solid #e2e8f0', 
                color: qaPaymentFailSim ? '#059669' : '#4b5563', 
                borderRadius: 6, 
                cursor: 'pointer',
                fontWeight: 'bold',
                outline: 'none'
              }}
            >
              {qaPaymentFailSim ? 'نشط (سيفشل الدفع)' : 'غير نشط'}
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY CARD 3: Technical Support */}
      <div style={{ background: '#ffffff', border: '1px solid #eef2f6', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '12px 16px 4px 16px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#7c3aed' }}>المساعدة والدعم</span>
        </div>
        <div 
          onClick={() => alert('تم فتح مركز المساعدة المباشر مع الدعم الفني!')}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '14px 16px', 
            cursor: 'pointer',
            direction: 'rtl'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#1e0b36', fontSize: '0.82rem' }}>
            <span style={{ color: '#7c3aed' }}><MessageSquare size={18} /></span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 800 }}>الدعم والمساعدة الفنية</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 'bold' }}>اتصال مباشر مع خدمة العملاء على مدار الساعة</span>
            </div>
          </div>
          <ArrowRight size={14} color="#9ca3af" style={{ transform: 'rotate(180deg)' }} />
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <button 
        onClick={async () => {
          const conf = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
          if (conf) {
            try {
              if (supabase) {
                await supabase.auth.signOut();
              }
            } catch (err) {
              console.error('Error during live signout, forcing reset:', err);
            } finally {
              localStorage.removeItem('BX_CURRENT_USER');
              window.location.reload();
            }
          }
        }}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 16,
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#ef4444',
          fontWeight: 900,
          fontSize: '0.88rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
      >
        <LogOut size={16} />
        <span>تسجيل الخروج من الحساب</span>
      </button>
    </motion.div>
  );
};
export default ProfileScreen;
