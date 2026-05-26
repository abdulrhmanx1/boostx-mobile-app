export interface Product {
  id: number | string;
  partnerId: string;
  name: string;
  desc: string;
  price: string;
  rawPrice: number;
  time?: string;
  category: 'best' | 'meals' | 'sides' | 'drinks' | string;
  images: string[];
  active: boolean;
}

export interface CartItem {
  id: number | string;
  name: string;
  price: string;
  rawPrice: number;
  qty: number;
  extras?: string[];
  partnerName: string;
}
