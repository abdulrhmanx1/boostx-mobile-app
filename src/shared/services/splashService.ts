import { supabase } from '../supabase/client';

export interface SplashSettings {
  id?: string;
  logo_url: string;
  animation_type: string; // 'electric' | 'pulse' | 'fade' | 'none'
  background_style: string;
  show_green_glow: boolean;
  duration_ms: number;
  is_active: boolean;
}

export const DEFAULT_SPLASH: SplashSettings = {
  logo_url: '',
  animation_type: 'electric',
  background_style: 'linear-gradient(135deg, #120b1f 0%, #000000 100%)',
  show_green_glow: true,
  duration_ms: 2500,
  is_active: true
};

export const splashService = {
  async getSettings(): Promise<SplashSettings> {
    try {
      const { data, error } = await supabase
        .from('app_splash_settings')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data || DEFAULT_SPLASH;
    } catch (e) {
      console.log('Using local fallback for splash settings:', e);
      return DEFAULT_SPLASH;
    }
  },

  async updateSettings(settings: Partial<SplashSettings>, userId?: string): Promise<SplashSettings> {
    const payload = { ...DEFAULT_SPLASH, ...settings, is_active: true };
    const { data, error } = await supabase
      .from('app_splash_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;

    // Write to audit log
    if (userId) {
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_SPLASH_SETTINGS',
        user_id: userId,
        details: JSON.stringify(payload),
        created_at: new Date().toISOString()
      });
    }

    return data;
  }
};

export default splashService;
