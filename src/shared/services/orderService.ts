import { supabase } from '../supabase/client';
import type { Order } from '../types/order.types';

export const orderService = {
  async getOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [
        { id: 'order-101', partnerName: 'مطعم البيك', category: 'مطاعم', status: 'delivering', price: '٦١.٠٠ ر.س', items: 'وجبة مسحب حراق + حمّص مميّز', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80', eta: '١٥-٢٠ دقيقة', createdAt: new Date().toISOString() }
      ];
    }
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    const { data, error } = await supabase.from('orders').insert({
      ...order,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    return data;
  }
};
export default orderService;
