import { supabase } from '../supabase/client';

export interface OnboardingScreen {
  id?: string;
  title_ar: string;
  subtitle_ar: string;
  image_url?: string;
  animation_type: string;
  display_order: number;
  is_active: boolean;
}

export const DEFAULT_ONBOARDING_SCREENS: OnboardingScreen[] = [
  {
    title_ar: 'كل خدماتك اليومية في تطبيق واحد',
    subtitle_ar: 'اطلب من المطاعم، الصيدليات، السوبر ماركت، أو احجز صنايعي لصيانة منزلك بضغطة زر واحدة.',
    animation_type: 'electric-sparks',
    display_order: 1,
    is_active: true
  },
  {
    title_ar: 'اطلب، تابع، واستلم بسهولة',
    subtitle_ar: 'تتبع خط سير المندوب بشكل حي ومباشر على الخريطة وتواصل معه بنظام المحادثة الآمن.',
    animation_type: 'floating-glow',
    display_order: 2,
    is_active: true
  },
  {
    title_ar: 'عروض ونقاط ومكافآت يومية',
    subtitle_ar: 'اجمع نقاط الولاء مع كل طلب واستبدلها بكوبونات خصم أو كاش باك مباشر في محفظتك الرقمية.',
    animation_type: 'glossy-motion',
    display_order: 3,
    is_active: true
  }
];

export const onboardingService = {
  async getActiveScreens(): Promise<OnboardingScreen[]> {
    try {
      const { data, error } = await supabase
        .from('app_onboarding_screens')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data && data.length > 0 ? data : DEFAULT_ONBOARDING_SCREENS;
    } catch (e) {
      console.log('Using local fallback for onboarding screens:', e);
      return DEFAULT_ONBOARDING_SCREENS;
    }
  },

  async updateScreen(screen: OnboardingScreen, userId?: string): Promise<OnboardingScreen> {
    const { data, error } = await supabase
      .from('app_onboarding_screens')
      .upsert(screen)
      .select()
      .single();

    if (error) throw error;

    // Write to audit log
    if (userId) {
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_ONBOARDING_SCREEN',
        user_id: userId,
        details: JSON.stringify(screen),
        created_at: new Date().toISOString()
      });
    }

    return data;
  }
};

export default onboardingService;
