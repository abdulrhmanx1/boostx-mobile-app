import { supabase } from '../supabase/client';

export const notificationService = {
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [
        { id: 1, type: 'order', title: 'تم قبول طلبك', desc: 'مطعم البيك يقوم بتجهيز طلبك الآن.', time: 'منذ ١٠ دقائق', unread: true },
        { id: 2, type: 'offer', title: 'خصم ٣٠٪ حصري لك!', desc: 'استخدم كود BOOSTX عند طلبك من أي صيدلية اليوم.', time: 'منذ ساعتين', unread: true }
      ];
    }
  },

  async markAsRead(id: string | number) {
    const { data, error } = await supabase.from('notifications').update({ unread: false }).eq('id', id);
    if (error) throw error;
    return data;
  }
};
export default notificationService;
