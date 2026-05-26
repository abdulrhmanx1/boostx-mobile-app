import { supabase } from '../supabase/client';
import type { Partner } from '../types/partner.types';

export const homeService = {
  async getStories() {
    // Attempt fetching story campaigns
    try {
      const { data, error } = await supabase.from('ad_campaigns').select('*').eq('status', 'active');
      if (error) throw error;
      return data.map((story: any) => ({
        id: story.id,
        partner: story.business_name || 'بوسط إكس',
        type: 'image',
        media: story.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        label: story.title || 'خصم مميز',
        viewed: false
      }));
    } catch (e) {
      // Offline fallback mock stories
      return [
        { id: 1, partner: 'نيون برجر', type: 'image', media: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', label: 'خصم ٥٠٪ 🔥', viewed: false },
        { id: 2, partner: 'صيدلية نجد', type: 'image', media: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80', label: 'بانادول متاح 💊', viewed: false }
      ];
    }
  },

  async getHeroAds() {
    return [
      { id: 1, title: 'عروض الملقا الكبرى 🍕', subtitle: 'احصل على وجبتين بسعر واحدة من المتاجر المشاركة اليوم فقط', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', color: 'linear-gradient(135deg, #701a75 0%, #1e1b4b 100%)' },
      { id: 2, title: 'خدمات الصيانة الفورية ⚡', subtitle: 'أفضل الحرفيين والسباكين المعتمدين حولك بخدمة مضمونة وضمان ٣٠ يوم', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', color: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }
    ];
  },

  async getNearbyPartners(): Promise<Partner[]> {
    try {
      const { data, error } = await supabase.from('partners').select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      return [
        { id: '1', name: 'مطعم البيك', category: 'مطاعم', rating: 4.9, reviewsCount: 12500, distance: '١.٢ كم', deliveryTime: '١٥-٢٥ دقيقة', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', sponsored: true, city: 'الرياض', district: 'الملقا' },
        { id: '2', name: 'صيدلية النهدي', category: 'صيدليات', rating: 4.8, reviewsCount: 5200, distance: '٢.٥ كم', deliveryTime: '١٠-٢٠ دقيقة', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80', sponsored: false, city: 'الرياض', district: 'الصحافة' }
      ];
    }
  }
};
export default homeService;
