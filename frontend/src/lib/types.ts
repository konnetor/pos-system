
export interface Product {
  id: string;
  name: string;
  price: number;
  code: string;
  quantity: number;
  discount?: number;
  cost?: number; // For profit calculation (admin only)
}

export interface Service {
  id: string;
  name: string;
  price: number;
  code: string;
  description?: string;
  cost?: number; // For profit calculation (admin only)
}

export interface Customer {
  id: string;
  name?: string;
  mobile?: string;
  vehicleNumber: string;
  company?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: Date;
}

export interface BillItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  code: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Bill {
  id: string;
  date: Date;
  customer: {
    name?: string;
    mobile?: string;
    vehicleNumber: string;
    company?: string;
  };
  items: BillItem[];
  subTotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  notes?: string;
}

export interface DailyReport {
  date: Date;
  totalSales: number;
  productSales: number;
  serviceSales: number;
  billCount: number;
  profit: number;
}
