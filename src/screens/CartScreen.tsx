import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, CreditCard, CheckCircle2, XCircle, ArrowRight, Trash2, ShieldCheck, Ticket, Gift, Sparkles, Loader2, ShoppingCart
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export const CartScreen = ({ 
  onCheckoutSuccess, 
  onBackClick,
  currentUser,
  onRequireLogin
}: { 
  onCheckoutSuccess?: (orderId: string) => void;
  onBackClick?: () => void;
  currentUser?: any;
  onRequireLogin?: (callback: () => void) => void;
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [cartPaid, setCartPaid] = useState(false);
  const [cartPayFailed, setCartPayFailed] = useState(false);

  // Dynamic Database Cart states
  const [items, setItems] = useState<any[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Checkout inputs
  const [customerName, setCustomerName] = useState(currentUser?.name || 'عبدالعزيز الحربي');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+966501234567');
  const [deliveryLocation, setDeliveryLocation] = useState('حي الملقا، شارع أنس بن مالك، الرياض');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'credit_card' | 'cash'>('apple_pay');

  // Load dynamically from database
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const customerId = currentUser?.id;
      if (!customerId) {
        setItems([]);
        return;
      }
      
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('customer_id', customerId);
        
      if (cartError) throw cartError;
      
      if (cartData && cartData.length > 0) {
        const activeCart = cartData[0];
        setCartId(activeCart.id);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('cart_id', activeCart.id);
          
        if (itemsError) throw itemsError;
        
        if (itemsData) {
          const loaded = itemsData.map((ci: any) => {
            const meta = ci.metadata ? JSON.parse(ci.metadata) : {};
            return {
              id: ci.id, // cart_item row id
              productId: ci.menu_item_id,
              name: meta.name || 'وجبة مميزة',
              partner: meta.partnerName || 'مطعم بوسط إكس',
              desc: meta.extras && meta.extras.length > 0 ? meta.extras.join(' ، ') : (meta.notes || 'وجبة طازجة وساخنة'),
              price: meta.rawPrice || 15,
              qty: ci.quantity,
              image: meta.image_url || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80',
              partnerId: meta.partnerId || 'p1'
            };
          });
          setItems(loaded);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  const updateQty = async (id: string | number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const nextQty = Math.max(1, item.qty + delta);
    
    // Update local state first for fast interactive experience
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: nextQty } : i));
    
    try {
      await supabase
        .from('cart_items')
        .update({ quantity: nextQty })
        .eq('id', id);
    } catch (e) {
      console.error('Error updating quantity in database:', e);
    }
  };

  const removeItem = async (id: string | number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
        
      // Check if cart is now empty, if so delete cart row
      if (items.length <= 1 && cartId) {
        await supabase.from('carts').delete().eq('id', cartId);
        setCartId(null);
      }
    } catch (e) {
      console.error('Error deleting item from database:', e);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 0 ? 12 : 0;
  const discount = appliedPromo ? Math.round(subtotal * 0.2 * 100) / 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'BOOSTX') {
      setAppliedPromo(true);
    }
  };

  const handlePayment = () => {
    const act = async () => {
      setIsPaying(true);
      setCartPayFailed(false);
      
      try {
        // 1. Insert order record into public.orders and let database generate UUID
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: currentUser?.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            partner_id: items[0]?.partnerId || 'p1', // Link partner_id correctly
            driver_id: null,
            driver_name: null,
            driver_phone: null,
            driver_vehicle: null,
            pickup_location: items[0]?.partner || 'مطعم البيك (فرع الصحافة)',
            dropoff_location: deliveryLocation,
            pickup_latitude: 24.7136,
            pickup_longitude: 46.6753,
            dropoff_latitude: 24.7885,
            dropoff_longitude: 46.6582,
            status: 'pending', // English status as per DB CHECK constraint
            total_amount: total,
            tax_amount: Math.round(subtotal * 0.15 * 100) / 100, // 15% VAT
            delivery_fee: deliveryFee,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cash' ? 'unpaid' : 'paid',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (orderError) throw orderError;
        const orderId = insertedOrder.id;

        // 2. Insert order items into public.order_items (letting DB generate UUIDs)
        const orderItemsToInsert = items.map(item => ({
          order_id: orderId,
          menu_item_id: item.productId,
          quantity: item.qty,
          unit_price: item.price,
          created_at: new Date().toISOString()
        }));
        
        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsError) throw itemsError;

        // 3. Clear dynamic customer cart
        if (cartId) {
          await supabase.from('cart_items').delete().eq('cart_id', cartId);
          await supabase.from('carts').delete().eq('id', cartId);
        }

        // Add a notification for new order placed
        await supabase.from('notifications').insert({
          user_id: currentUser?.id,
          type: 'order',
          title: 'تم استلام طلبك بنجاح! 🍗🍕',
          description: `طلبك رقم #${orderId.substring(0, 8)} قيد التجهيز الآن لدى ${items[0]?.partner || 'الشريك'}.`,
          image_url: items[0]?.image || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80',
          created_at: new Date().toISOString(),
          read: false,
          unread: true
        });

        setIsPaying(false);
        setCartPaid(true);
        setTimeout(() => {
          setCartPaid(false);
          if (onCheckoutSuccess) {
            onCheckoutSuccess(orderId);
          }
        }, 1500);
      } catch (err) {
        console.error('Checkout error:', err);
        setIsPaying(false);
        setCartPayFailed(true);
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
        padding: '0 20px 120px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20, 
        textAlign: 'right', 
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

      {/* Floating purple background glow for premium 3D layered feel */}
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)', filter: 'blur(40px)', top: '10%', right: '-50px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)', filter: 'blur(35px)', top: '40%', left: '-50px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top Bar with Back Button & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'calc(env(safe-area-inset-top, 24px) + 12px)', marginBottom: '4px', position: 'relative', zIndex: 1 }}>
        {onBackClick && (
          <button 
            onClick={onBackClick}
            style={{ 
              background: '#ffffff', 
              border: '1px solid #eef2f6', 
              boxShadow: '0 6px 16px rgba(0,0,0,0.03)',
              width: 42, 
              height: 42, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#1e0b36', 
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            <ArrowRight size={20} />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>سلتك المتميزة 🛒</h2>
          <p style={{ fontSize: '0.68rem', color: '#6b7280', margin: '2px 0 0 0', fontWeight: 'bold' }}>راجع طلباتك وأتمم الدفع الآمن بأقل من دقيقة</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
          <Loader2 className="animate-spin" size={32} color="#7c3aed" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6b7280' }}>جاري تحميل منتجات السلة...</span>
        </div>
      ) : items.length === 0 ? (
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
            marginTop: 40,
            zIndex: 1
          }}
        >
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', margin: '0 auto 20px auto', boxShadow: '0 8px 20px rgba(124,58,237,0.1)' }}>
            <ShoppingCart size={32} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e0b36', margin: '0 0 8px 0' }}>السلة فارغة حالياً 🥺</h3>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 24px 0', lineHeight: 1.5, fontWeight: 'bold' }}>لم تضف أي وجبات أو منتجات مميزة لسلتك الرقمية بعد.</p>
          <button 
            onClick={onBackClick}
            className="btn btn-primary" 
            style={{ padding: '12px 28px', fontSize: '0.82rem', fontWeight: 900, borderRadius: '20px', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)', width: 'auto', display: 'inline-block' }}
          >
            تصفح المأكولات والمتاجر 🍕
          </button>
        </motion.div>
      ) : (
        /* Cart Content */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
          
          {/* Cart Items Card */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #eef2f6', 
            borderRadius: 22, 
            padding: 16, 
            boxShadow: '0 10px 28px rgba(0,0,0,0.02)',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 16 }}>
              <span style={{ fontWeight: 900, color: '#1e0b36', fontSize: '0.88rem' }}>{items[0]?.partner}</span>
              <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 800, background: 'rgba(124, 58, 237, 0.05)', padding: '2px 8px', borderRadius: 8 }}>توصيل مباشر</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, borderBottom: '1px solid #f8fafc', paddingBottom: 16, boxSizing: 'border-box' }}>
                  {/* Product Image with depth shadow */}
                  <div style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f1f5f9', boxShadow: '0 6px 14px rgba(0,0,0,0.06)', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', boxSizing: 'border-box' }}>
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e0b36', margin: 0 }}>{item.name}</h4>
                      <p style={{ fontSize: '0.68rem', color: '#6b7280', margin: '2px 0 0 0', fontWeight: 'bold' }}>{item.desc}</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#7c3aed' }}>{item.price * item.qty} ر.س</span>
                      
                      {/* Premium Quantity Controller with glass effect */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: '#f8f9fc', 
                        border: '1px solid #eef2f6',
                        borderRadius: 14, 
                        padding: 3, 
                        gap: 8,
                        boxSizing: 'border-box'
                      }}>
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          style={{ width: 26, height: 26, borderRadius: 10, background: '#ffffff', border: '1px solid #eef2f6', color: '#1e0b36', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, minWidth: 16, textAlign: 'center', color: '#1e0b36' }}>{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          style={{ width: 26, height: 26, borderRadius: 10, background: '#ffffff', border: '1px solid #eef2f6', color: '#1e0b36', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', alignSelf: 'flex-start', padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Details Card */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #eef2f6', 
            borderRadius: 22, 
            padding: 16, 
            display: 'flex', 
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 10px 28px rgba(0,0,0,0.02)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e0b36', borderBottom: '1px solid #f1f5f9', paddingBottom: 10, margin: 0 }}>تفاصيل التوصيل والاستلام 📍</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280' }}>الاسم الكامل</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)}
                style={{ background: '#f8f9fc', border: '1px solid #eef2f6', padding: '10px 14px', borderRadius: 12, outline: 'none', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'Cairo', color: '#1e0b36', textAlign: 'right' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280' }}>رقم الجوال</label>
              <input 
                type="text" 
                value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value)}
                style={{ background: '#f8f9fc', border: '1px solid #eef2f6', padding: '10px 14px', borderRadius: 12, outline: 'none', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'Cairo', color: '#1e0b36', textAlign: 'left', direction: 'ltr' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280' }}>عنوان وموقع التوصيل</label>
              <input 
                type="text" 
                value={deliveryLocation} 
                onChange={e => setDeliveryLocation(e.target.value)}
                style={{ background: '#f8f9fc', border: '1px solid #eef2f6', padding: '10px 14px', borderRadius: 12, outline: 'none', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'Cairo', color: '#1e0b36', textAlign: 'right' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280' }}>ملاحظات للطلب / السائق</label>
              <textarea 
                value={orderNotes} 
                onChange={e => setOrderNotes(e.target.value)}
                rows={2}
                placeholder="مثال: بدون بصل، الطابق الثالث، اترك عند الباب..."
                style={{ background: '#f8f9fc', border: '1px solid #eef2f6', padding: '10px 14px', borderRadius: 12, outline: 'none', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'Cairo', color: '#1e0b36', textAlign: 'right', resize: 'none' }} 
              />
            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #eef2f6', 
            borderRadius: 22, 
            padding: 16, 
            display: 'flex', 
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 10px 28px rgba(0,0,0,0.02)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e0b36', borderBottom: '1px solid #f1f5f9', paddingBottom: 10, margin: 0 }}>طريقة الدفع الآمنة 💳</h3>
            <div style={{ display: 'flex', gap: 10, direction: 'rtl' }}>
              {[
                { id: 'apple_pay', label: 'Apple Pay ' },
                { id: 'credit_card', label: 'بطاقة ائتمان 💳' },
                { id: 'cash', label: 'كاش عند الاستلام 💵' }
              ].map(method => {
                const isSel = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      borderRadius: 12,
                      border: '1px solid ' + (isSel ? '#7c3aed' : '#eef2f6'),
                      background: isSel ? 'rgba(124, 58, 237, 0.05)' : '#ffffff',
                      color: isSel ? '#7c3aed' : '#6b7280',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  >
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Promo Coupon Section */}
          <div style={{ display: 'flex', gap: 10, boxSizing: 'border-box' }}>
            <button 
              onClick={handleApplyPromo}
              disabled={appliedPromo || promoCode.trim().toUpperCase() !== 'BOOSTX'}
              style={{
                background: appliedPromo ? 'rgba(16, 185, 129, 0.12)' : (promoCode.trim().toUpperCase() === 'BOOSTX' ? '#7c3aed' : '#cbd5e1'),
                color: appliedPromo ? '#10b981' : 'white',
                border: 'none',
                padding: '0 20px',
                borderRadius: 18,
                fontWeight: 900,
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: (appliedPromo || promoCode.trim().toUpperCase() !== 'BOOSTX') ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s ease',
                height: 48,
                whiteSpace: 'nowrap'
              }}
            >
              {appliedPromo ? 'تم التطبيق' : 'تطبيق الكوبون'}
            </button>
            <div style={{ 
              flex: 1, 
              background: '#ffffff', 
              border: '1px solid #eef2f6', 
              padding: '0 16px', 
              borderRadius: 18, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              height: 48,
              boxSizing: 'border-box'
            }}>
              <Ticket size={16} color="#7c3aed" />
              <input 
                type="text" 
                placeholder="كود الخصم (BOOSTX)" 
                value={promoCode} 
                onChange={e => setPromoCode(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#1e0b36', outline: 'none', flex: 1, textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold' }} 
              />
            </div>
          </div>

          {/* Premium Animated Totals Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #fcfaff 100%)', 
            border: '1px solid #eef2f6', 
            borderRadius: 24, 
            padding: 18, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12,
            boxShadow: '0 10px 30px rgba(124,58,237,0.02)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280', fontWeight: 'bold' }}>
              <span>مجموع المنتجات</span>
              <span style={{ color: '#1e0b36', fontWeight: 800 }}>{subtotal} ر.س</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280', fontWeight: 'bold' }}>
              <span>رسوم الخدمة والتوصيل</span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>{deliveryFee > 0 ? `${deliveryFee} ر.س` : 'مجاني'}</span>
            </div>
            
            <AnimatePresence>
              {appliedPromo && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#10b981', fontWeight: 800, overflow: 'hidden' }}
                >
                  <span>خصم كوبون الفخامة (٢٠٪) 🏷️</span>
                  <span>-{discount} ر.س</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', fontWeight: 900, color: '#1e0b36', borderTop: '1px dashed #eef2f6', paddingTop: 12, marginTop: 4 }}>
              <span>الإجمالي شامل الضريبة</span>
              <span style={{ color: '#7c3aed', fontSize: '1.1rem' }}>{total} ر.س</span>
            </div>
          </div>

          {/* Secure & Premium Checkout CTA */}
          <motion.button 
            onClick={handlePayment}
            disabled={isPaying || total === 0}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '16px',
              borderRadius: 24,
              fontWeight: 900,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 10px 24px rgba(124,58,237,0.35)',
              outline: 'none',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Liquid shine effect */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', top: 0, left: '-100%', width: '200%', height: '100%', animation: 'electric-pulse 2s infinite', pointerEvents: 'none' }} />
            <CreditCard size={18} />
            <span>تأكيد ودفع بلمسة واحدة الآمنة</span>
          </motion.button>

        </div>
      )}

      {/* SECURE PAYMENT OVERLAYS */}
      <AnimatePresence>
        {isPaying && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(18, 9, 36, 0.96)', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid rgba(168,85,247,0.1)', borderTopColor: '#c084fc' }}
            ></motion.div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 900, marginBottom: 8 }}>جاري معالجة الدفع الآمن</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>تشفير وحماية البيانات البنكية عبر معايير PCI-DSS</p>
            </div>
          </motion.div>
        )}

        {cartPaid && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(18, 9, 36, 0.96)', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <CheckCircle2 size={72} color="#10b981" style={{ filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.4))' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 900, marginBottom: 6 }}>تم الدفع بنجاح!</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>جاري الانتقال لتتبع خط سير المندوب على الخريطة</p>
            </div>
          </motion.div>
        )}

        {cartPayFailed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(18, 9, 36, 0.96)', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}
          >
            <XCircle size={72} color="#ef4444" style={{ filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.4))' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 900, marginBottom: 6 }}>فشل عملية الدفع</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>حدث خطأ أثناء الاتصال بالبنك المصدر للبطاقة. الرجاء التحقق من الرصيد أو المحاولة مرة أخرى.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button className="btn btn-primary" onClick={handlePayment} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>إعادة المحاولة</button>
              <button className="btn btn-secondary" onClick={() => setCartPayFailed(false)} style={{ padding: '10px 20px', fontSize: '0.85rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>إلغاء</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default CartScreen;
