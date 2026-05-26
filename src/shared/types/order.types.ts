export interface Order {
  id: string;
  partnerName: string;
  category: string;
  status: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  price: string;
  items: string;
  image: string;
  eta?: string;
  createdAt: string;
}

export interface DriverLocation {
  id: string;
  driverId: string;
  orderId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  updatedAt: string;
}
export interface TimelineStep {
  id: string;
  label: string;
  desc: string;
  active: boolean;
}
