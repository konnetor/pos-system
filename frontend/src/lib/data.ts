
import { Product, Service, Customer, Bill, DailyReport } from './types';

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Products
export const mockProducts: Product[] = [
  {
    id: generateId(),
    name: 'Engine Oil Filter',
    price: 450,
    code: 'P001',
    quantity: 45,
    discount: 0,
    cost: 320
  },
  {
    id: generateId(),
    name: 'Brake Pad Set',
    price: 1200,
    code: 'P002',
    quantity: 28,
    discount: 5,
    cost: 850
  },
  {
    id: generateId(),
    name: 'Spark Plug',
    price: 180,
    code: 'P003',
    quantity: 120,
    discount: 0,
    cost: 110
  },
  {
    id: generateId(),
    name: 'Air Filter',
    price: 350,
    code: 'P004',
    quantity: 56,
    discount: 0,
    cost: 220
  },
  {
    id: generateId(),
    name: 'Wiper Blade Set',
    price: 550,
    code: 'P005',
    quantity: 34,
    discount: 10,
    cost: 320
  },
  {
    id: generateId(),
    name: 'Headlight Bulb',
    price: 260,
    code: 'P006',
    quantity: 85,
    discount: 0,
    cost: 150
  },
  {
    id: generateId(),
    name: 'Radiator Coolant',
    price: 420,
    code: 'P007',
    quantity: 42,
    discount: 0,
    cost: 280
  },
  {
    id: generateId(),
    name: 'Fuel Filter',
    price: 380,
    code: 'P008',
    quantity: 38,
    discount: 0,
    cost: 240
  }
];

// Mock Services
export const mockServices: Service[] = [
  {
    id: generateId(),
    name: 'Oil Change',
    price: 800,
    code: 'S001',
    description: 'Complete oil change service with new filter',
    cost: 350
  },
  {
    id: generateId(),
    name: 'Tire Rotation',
    price: 500,
    code: 'S002',
    description: 'Rotate tires to ensure even wear',
    cost: 200
  },
  {
    id: generateId(),
    name: 'Brake Inspection',
    price: 400,
    code: 'S003',
    description: 'Comprehensive brake system inspection',
    cost: 150
  },
  {
    id: generateId(),
    name: 'AC Service',
    price: 1800,
    code: 'S004',
    description: 'Air conditioning system check and regas',
    cost: 900
  },
  {
    id: generateId(),
    name: 'Battery Replacement',
    price: 600,
    code: 'S005',
    description: 'Battery testing and replacement if needed',
    cost: 200
  },
  {
    id: generateId(),
    name: 'Interior Detailing',
    price: 2500,
    code: 'S006',
    description: 'Complete interior cleaning and detailing',
    cost: 800
  },
  {
    id: generateId(),
    name: 'Exterior Detailing',
    price: 3000,
    code: 'S007',
    description: 'Complete exterior cleaning, waxing and polishing',
    cost: 1000
  }
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: generateId(),
    name: 'Rahul Sharma',
    mobile: '9876543210',
    vehicleNumber: 'KA01AB1234',
    company: 'ABC Industries',
    totalSpent: 15600,
    visitCount: 5,
    lastVisit: new Date('2023-12-10')
  },
  {
    id: generateId(),
    name: 'Priya Patel',
    mobile: '8765432109',
    vehicleNumber: 'MH02CD5678',
    totalSpent: 8200,
    visitCount: 3,
    lastVisit: new Date('2023-12-15')
  },
  {
    id: generateId(),
    name: 'Arjun Singh',
    mobile: '7654321098',
    vehicleNumber: 'DL03EF9012',
    company: 'XYZ Corp',
    totalSpent: 22400,
    visitCount: 7,
    lastVisit: new Date('2023-12-20')
  },
  {
    id: generateId(),
    name: 'Nisha Verma',
    mobile: '6543210987',
    vehicleNumber: 'TN04GH3456',
    totalSpent: 4500,
    visitCount: 2,
    lastVisit: new Date('2023-12-25')
  },
  {
    id: generateId(),
    name: 'Vikram Malhotra',
    mobile: '5432109876',
    vehicleNumber: 'UP05IJ7890',
    company: 'PQR Limited',
    totalSpent: 31800,
    visitCount: 9,
    lastVisit: new Date('2023-12-30')
  }
];

// Mock Bills
export const mockBills: Bill[] = [
  {
    id: generateId(),
    date: new Date('2023-12-10'),
    customer: {
      name: 'Rahul Sharma',
      mobile: '9876543210',
      vehicleNumber: 'KA01AB1234',
      company: 'ABC Industries'
    },
    items: [
      {
        id: generateId(),
        type: 'service',
        name: 'Oil Change',
        code: 'S001',
        price: 800,
        quantity: 1,
        discount: 0,
        total: 800
      },
      {
        id: generateId(),
        type: 'product',
        name: 'Engine Oil Filter',
        code: 'P001',
        price: 450,
        quantity: 1,
        discount: 0,
        total: 450
      }
    ],
    subTotal: 1250,
    discount: 0,
    total: 1250,
    paymentMethod: 'cash'
  },
  {
    id: generateId(),
    date: new Date('2023-12-15'),
    customer: {
      name: 'Priya Patel',
      mobile: '8765432109',
      vehicleNumber: 'MH02CD5678'
    },
    items: [
      {
        id: generateId(),
        type: 'service',
        name: 'Tire Rotation',
        code: 'S002',
        price: 500,
        quantity: 1,
        discount: 0,
        total: 500
      }
    ],
    subTotal: 500,
    discount: 0,
    total: 500,
    paymentMethod: 'card'
  },
  {
    id: generateId(),
    date: new Date('2023-12-20'),
    customer: {
      name: 'Arjun Singh',
      mobile: '7654321098',
      vehicleNumber: 'DL03EF9012',
      company: 'XYZ Corp'
    },
    items: [
      {
        id: generateId(),
        type: 'service',
        name: 'AC Service',
        code: 'S004',
        price: 1800,
        quantity: 1,
        discount: 200,
        total: 1600
      },
      {
        id: generateId(),
        type: 'product',
        name: 'Radiator Coolant',
        code: 'P007',
        price: 420,
        quantity: 2,
        discount: 40,
        total: 800
      }
    ],
    subTotal: 2640,
    discount: 240,
    total: 2400,
    paymentMethod: 'upi',
    notes: 'Customer complained about AC performance'
  }
];

// Mock Reports
export const mockReports: DailyReport[] = [
  {
    date: new Date('2023-12-01'),
    totalSales: 6800,
    productSales: 2300,
    serviceSales: 4500,
    billCount: 4,
    profit: 3100
  },
  {
    date: new Date('2023-12-02'),
    totalSales: 5200,
    productSales: 1800,
    serviceSales: 3400,
    billCount: 3,
    profit: 2300
  },
  {
    date: new Date('2023-12-03'),
    totalSales: 9500,
    productSales: 3500,
    serviceSales: 6000,
    billCount: 6,
    profit: 4200
  },
  {
    date: new Date('2023-12-04'),
    totalSales: 7200,
    productSales: 2700,
    serviceSales: 4500,
    billCount: 5,
    profit: 3400
  },
  {
    date: new Date('2023-12-05'),
    totalSales: 8400,
    productSales: 3600,
    serviceSales: 4800,
    billCount: 7,
    profit: 3800
  },
  {
    date: new Date('2023-12-06'),
    totalSales: 6300,
    productSales: 2100,
    serviceSales: 4200,
    billCount: 4,
    profit: 2900
  },
  {
    date: new Date('2023-12-07'),
    totalSales: 7800,
    productSales: 3200,
    serviceSales: 4600,
    billCount: 6,
    profit: 3500
  }
];

// Helper functions for data manipulation
export const addProduct = (product: Omit<Product, 'id'>) => {
  const newProduct = { ...product, id: generateId() };
  // In a real app, this would be an API call
  return newProduct;
};

export const addService = (service: Omit<Service, 'id'>) => {
  const newService = { ...service, id: generateId() };
  // In a real app, this would be an API call
  return newService;
};

export const generateBill = (bill: Omit<Bill, 'id'>) => {
  const newBill = { ...bill, id: generateId() };
  // In a real app, this would be an API call and would also update inventory
  return newBill;
};
