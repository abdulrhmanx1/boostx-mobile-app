export interface Partner {
  id: string;
  name: string;
  category: 'مطاعم' | 'صيدليات' | 'سوبرماركت' | 'مطابع' | 'ورد وهدايا' | 'صنايعية' | 'خدمات منزلية';
  rating: number;
  reviewsCount: number;
  distance: string;
  deliveryTime: string;
  image: string;
  coverImage?: string;
  sponsored: boolean;
  city: string;
  district: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface PartnerApplication {
  id: string;
  ownerId: string;
  bizType: string;
  businessName: string;
  commercialName: string;
  phoneNumber: string;
  email: string;
  city: string;
  district: string;
  crDocumentUrl: string;
  ownerIdUrl: string;
  vatCertificateUrl: string;
  municipalLicenseUrl: string;
  status: 'pending' | 'pending_verification' | 'verified' | 'rejected';
  createdAt: string;
}
