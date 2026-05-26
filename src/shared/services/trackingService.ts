import { supabase } from '../supabase/client';
import type { DriverLocation } from '../types/order.types';

export const trackingService = {
  async getDriverLocation(orderId: string): Promise<DriverLocation | null> {
    try {
      const { data, error } = await supabase.from('driver_locations').select('*').eq('order_id', orderId).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  },

  async updateDriverLocation(location: Omit<DriverLocation, 'updatedAt'>) {
    const { data, error } = await supabase.from('driver_locations').upsert({
      ...location,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    return data;
  },

  subscribeToLiveTracking(orderId: string, onChange: (loc: DriverLocation) => void) {
    return supabase
      .channel(`live-tracking:${orderId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_locations', filter: `order_id=eq.${orderId}` },
        payload => {
          if (payload.new) {
            onChange(payload.new as DriverLocation);
          }
        }
      )
      .subscribe();
  }
};
export default trackingService;
