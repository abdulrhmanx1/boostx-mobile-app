import { supabase } from '../supabase/client';
import type { UserProfile } from '../types/user.types';

export const authService = {
  async signInWithOtp(phone: string) {
    const fullPhone = phone.startsWith('+') ? phone : '+966' + phone;
    const { data, error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) throw error;
    return data;
  },

  async verifyOtp(phone: string, token: string) {
    const fullPhone = phone.startsWith('+') ? phone : '+966' + phone;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token,
      type: 'sms'
    });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return {
      id: user.id,
      phone: user.phone || '',
      email: user.email || '',
      role: (user.user_metadata?.role as any) || 'customer',
      membershipTier: (user.user_metadata?.membershipTier as any) || 'bronze',
      walletBalance: (user.user_metadata?.walletBalance as any) || 0,
      loyaltyPoints: (user.user_metadata?.loyaltyPoints as any) || 0,
      createdAt: user.created_at
    };
  }
};
export default authService;
