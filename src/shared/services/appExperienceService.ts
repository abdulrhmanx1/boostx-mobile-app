import { supabase } from '../supabase/client';
import type { OnboardingScreen } from './onboardingService';
import type { SplashSettings } from './splashService';

export interface LoginSettings {
  id?: string;
  welcome_title_ar: string;
  welcome_desc_ar: string;
  show_google_login: boolean;
  background_style: string;
  show_green_glow: boolean;
  is_active: boolean;
}

export const DEFAULT_LOGIN: LoginSettings = {
  welcome_title_ar: 'سجل دخولك الآن',
  welcome_desc_ar: 'أدخل رقم جوالك للمتابعة، سنقوم بإرسال رمز تحقق سريع إليك لتأمين حسابك.',
  show_google_login: true,
  background_style: 'linear-gradient(135deg, #120b1f 0%, #000000 100%)',
  show_green_glow: true,
  is_active: true
};

export const appExperienceService = {
  async getLoginSettings(): Promise<LoginSettings> {
    try {
      const { data, error } = await supabase
        .from('app_login_settings')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data || DEFAULT_LOGIN;
    } catch (e) {
      console.log('Using local fallback for login settings:', e);
      return DEFAULT_LOGIN;
    }
  },

  async updateLoginSettings(settings: Partial<LoginSettings>, userId?: string): Promise<LoginSettings> {
    const payload = { ...DEFAULT_LOGIN, ...settings, is_active: true };
    const { data, error } = await supabase
      .from('app_login_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;

    // Write to audit log
    if (userId) {
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_LOGIN_SETTINGS',
        user_id: userId,
        details: JSON.stringify(payload),
        created_at: new Date().toISOString()
      });
    }

    return data;
  },

  async getAllExperience(userId?: string) {
    const { data: splash } = await supabase.from('app_splash_settings').select('*');
    const { data: onboarding } = await supabase.from('app_onboarding_screens').select('*').order('display_order', { ascending: true });
    const { data: login } = await supabase.from('app_login_settings').select('*');

    return {
      splash: splash || [],
      onboarding: onboarding || [],
      login: login || []
    };
  }
};

export default appExperienceService;
