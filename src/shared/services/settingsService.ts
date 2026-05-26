export const settingsService = {
  getLanguage() {
    return localStorage.getItem('BOOSTX_APP_LANGUAGE') || 'ar';
  },

  setLanguage(lang: 'ar' | 'en') {
    localStorage.setItem('BOOSTX_APP_LANGUAGE', lang);
  },

  getPushNotificationsEnabled() {
    const val = localStorage.getItem('BOOSTX_PUSH_NOTIFS_ENABLED');
    return val !== 'false'; // Default to true
  },

  setPushNotificationsEnabled(enabled: boolean) {
    localStorage.setItem('BOOSTX_PUSH_NOTIFS_ENABLED', String(enabled));
  }
};
export default settingsService;
