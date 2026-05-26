import type { Partner, PartnerApplication } from './partner.types';
import type { Product } from './product.types';

export interface SuperAdminStats {
  activePartners: number;
  activeDrivers: number;
  totalSales: number;
  securityAlertsCount: number;
}

export interface AdminStats {
  pendingPartnersCount: number;
  pendingDriversCount: number;
  operationalSuccessRate: number;
}

export interface AdCampaign {
  id: string;
  partnerId: string;
  title: string;
  budget: number;
  status: 'active' | 'paused' | 'ended';
  createdAt: string;
}
export interface LogMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  detail: string;
  timestamp: string;
}
