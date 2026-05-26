import { supabase } from '../supabase/client';
import type { PartnerApplication } from '../types/partner.types';

export const partnerService = {
  async submitApplication(payload: Omit<PartnerApplication, 'id' | 'createdAt'>) {
    const { data, error } = await supabase.from('partner_applications').insert({
      ...payload,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    return data;
  },

  async getApplications(): Promise<PartnerApplication[]> {
    const { data, error } = await supabase.from('partner_applications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async approveApplication(id: string) {
    const { data, error } = await supabase.from('partner_applications').update({ status: 'verified' }).eq('id', id);
    if (error) throw error;
    return data;
  },

  async rejectApplication(id: string) {
    const { data, error } = await supabase.from('partner_applications').update({ status: 'rejected' }).eq('id', id);
    if (error) throw error;
    return data;
  }
};
export default partnerService;
