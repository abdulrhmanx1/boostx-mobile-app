export interface UserProfile {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
  role: 'customer' | 'partner' | 'driver' | 'technician' | 'admin' | 'superadmin';
  membershipTier: 'bronze' | 'silver' | 'gold' | 'vip';
  walletBalance: number;
  loyaltyPoints: number;
  createdAt: string;
}

export interface UserSession {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}
