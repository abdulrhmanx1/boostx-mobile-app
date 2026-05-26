import { supabase } from '../supabase/client';
import type { Product } from '../types/product.types';

export const productService = {
  async getProducts(partnerId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('partner_id', partnerId);
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [
        { id: 101, partnerId, name: 'وجبة دجاج البيك ٤ قطع', desc: 'وجبة دجاج مقرمش شهيرة تقدم مع البطاطا المقلية وصلصة الثوم والخبز.', price: '٢٢ ر.س', rawPrice: 22, time: '١٥ دقيقة', category: 'best', images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80'], active: true },
        { id: 102, partnerId, name: 'ساندوتش فيليه سمك حراق', desc: 'فيليه سمك مقرمش مع الخس والمايونيز والصلصة الحارة الفاخرة.', price: '١٤ ر.س', rawPrice: 14, time: '١٢ دقيقة', category: 'meals', images: ['https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&q=80'], active: true }
      ];
    }
  },

  async addProduct(product: Omit<Product, 'id'>) {
    const { data, error } = await supabase.from('products').insert(product);
    if (error) throw error;
    return data;
  },

  async toggleProductAvailability(id: string | number, active: boolean) {
    const { data, error } = await supabase.from('products').update({ active }).eq('id', id);
    if (error) throw error;
    return data;
  }
};
export default productService;
