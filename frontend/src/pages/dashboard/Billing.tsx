import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import TransitionEffect from '@/components/common/TransitionEffect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Printer, FileText, Car, DollarSign, Wrench } from 'lucide-react';
import { generateBill } from '@/lib/data';
import { Product, Service, BillItem, Bill } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BACKEND_URL, getApiUrl } from '@/config/api';

const Billing = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<Product | Service>>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  
  // Custom service dialog state
  const [isCustomServiceDialogOpen, setIsCustomServiceDialogOpen] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServiceDescription, setCustomServiceDescription] = useState('');
  
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [totalDiscount, setTotalDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else {
      setIsAdmin(userIsAdmin);
    }
  }, [navigate]);
  
  const [allData, setAllData] = useState<{ products: Product[], services: Service[] }>({ products: [], services: [] });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(getApiUrl('api/get_all_data'));
        const data = await response.json();
        setAllData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    let results: Array<Product | Service> = [];
    
    if (selectedTab === 'all' || selectedTab === 'products') {
      const productResults = allData.products.filter(
        product => 
          product.name.toLowerCase().includes(term) || 
          product.code.toLowerCase().includes(term)
      );
      results = [...results, ...productResults];
    }
    
    if (selectedTab === 'all' || selectedTab === 'services') {
      const serviceResults = allData.services.filter(
        service => 
          service.name.toLowerCase().includes(term) || 
          service.code.toLowerCase().includes(term)
      );
      results = [...results, ...serviceResults];
    }
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchTerm, selectedTab]);
  
  const handleLogout = () => {
    localStorage.removeItem('autospa_isLoggedIn');
    localStorage.removeItem('autospa_username');
    localStorage.removeItem('autospa_isAdmin');
    navigate('/');
  };
  
  const handleAddItem = (item: Product | Service) => {
    const itemType = 'quantity' in item ? 'product' : 'service';
    
    const existingItemIndex = billItems.findIndex(
      billItem => billItem.id === item.id && billItem.type === itemType
    );
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...billItems];
      const existingItem = updatedItems[existingItemIndex];
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
        total: (existingItem.quantity + 1) * (existingItem.price * (1 - existingItem.discount / 100))
      };
      
      setBillItems(updatedItems);
    } else {
      const newBillItem: BillItem = {
        id: item.id,
        type: itemType,
        name: item.name,
        code: item.code,
        price: item.price,
        quantity: 1,
        discount: 'discount' in item && item.discount ? item.discount : 0,
        total: item.price
      };
      
      setBillItems([...billItems, newBillItem]);
    }
    
    setSearchTerm('');
    setShowSearchResults(false);
    toast.success(`Added ${item.name} to bill`);
  };

  // Handle adding a custom service to the bill
  const handleAddCustomService = () => {
    if (!customServiceName || !customServicePrice) {
      toast.error('Please provide both name and price for the custom service');
      return;
    }

    const price = parseFloat(customServicePrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Generate a unique ID for the custom service
    const customId = `0`;
    
    // Create a new bill item for the custom service
    const newBillItem: BillItem = {
      id: customId,
      type: 'service',
      name: customServiceName,
      code: 'CUSTOM',
      price: price,
      quantity: 1,
      discount: 0,
      total: price
    };
    
    setBillItems([...billItems, newBillItem]);
    
    // Reset the form fields
    setCustomServiceName('');
    setCustomServicePrice('');
    setCustomServiceDescription('');
    setIsCustomServiceDialogOpen(false);
    
    toast.success(`Added custom service: ${customServiceName}`);
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedItems = billItems.filter((_, i) => i !== index);
    setBillItems(updatedItems);
  };
  
  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...billItems];
    const item = updatedItems[index];
    
    if (item.type === 'product') {
      const product = allData.products.find(p => p.id === item.id);
      if (product && quantity > product.quantity) {
        toast.error(`Only ${product.quantity} units available in stock`);
        return;
      }
    }
    
    updatedItems[index] = {
      ...item,
      quantity,
      total: quantity * (item.price * (1 - item.discount / 100))
    };
    
    setBillItems(updatedItems);
  };
  
  const handleItemDiscountChange = (index: number, discount: number) => {
    if (discount < 0 || discount > 100) return;
    
    const updatedItems = [...billItems];
    const item = updatedItems[index];
    
    updatedItems[index] = {
      ...item,
      discount,
      total: item.quantity * (item.price * (1 - discount / 100))
    };
    
    setBillItems(updatedItems);
  };
  
  const calculateSubTotal = () => {
    return billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTotalBeforeDiscount = () => {
    return billItems.reduce((sum, item) => sum + item.total, 0);
  };
  
  const calculateFinalTotal = () => {
    const totalBeforeDiscount = calculateTotalBeforeDiscount();
    const overallDiscountValue = parseFloat(totalDiscount) || 0;
    
    return totalBeforeDiscount * (1 - overallDiscountValue / 100);
  };
  
  const handleGenerateBill = () => {
    if (billItems.length === 0) {
      toast.error('Add at least one item to generate a bill');
      return;
    }
    
    if (!vehicleNumber) {
      toast.error('Vehicle number is required');
      return;
    }
    
    const newBill: Omit<Bill, 'id'> = {
      date: new Date(),
      customer: {
        name: customerName || undefined,
        mobile: mobileNumber || undefined,
        vehicleNumber,
        company: companyName || undefined
      },
      items: billItems,
      subTotal: calculateSubTotal(),
      discount: parseFloat(totalDiscount) || 0,
      total: calculateFinalTotal(),
      paymentMethod,
      notes: notes || undefined
    };
    
    const generatedBillWithId = generateBill(newBill);
    setGeneratedBill(generatedBillWithId);
    setIsPrintDialogOpen(true);
    
    toast.success('Bill generated successfully');
  };
  
const handlePrintBill = async () => {
  try {
    if (!generatedBill) {
      toast.error('No bill to submit');
      return;
    }
    
    // Ensure all required customer fields are present (even if empty strings)
    const customerData = {
      name: generatedBill.customer.name || "",
      mobile: generatedBill.customer.mobile || "",
      vehicleNumber: generatedBill.customer.vehicleNumber,
      company: generatedBill.customer.company || ""
    };

    // Submit bill to backend
    const response = await fetch(getApiUrl('api/submit_bill'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: generatedBill.date,
        customer: customerData,
        items: generatedBill.items,
        subTotal: generatedBill.subTotal,
        discount: generatedBill.discount,
        total: generatedBill.total,
        paymentMethod: generatedBill.paymentMethod,
        notes: generatedBill.notes
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit bill');
    }

    // Create a new window for printing instead of modifying the current page
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('Failed to open print window. Please check your popup blocker settings.');
      return;
    }
    
    // Create print-specific styles
    const printStyles = `
      @page { margin: 15mm; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
      .print-content { max-width: 800px; margin: 0 auto; padding: 20px; }
      .print-header { text-align: center; margin-bottom: 25px; }
      .logo { max-width: 120px; height: auto; margin-bottom: 12px; }
      .company-name { font-size: 24px; font-weight: bold; margin: 5px 0; color: #1a1a1a; }
      .company-subtitle { font-size: 16px; color: #4a4a4a; margin-bottom: 8px; }
      
      .invoice-info { display: flex; justify-content: space-between; margin-bottom: 25px; }
      .bill-to, .invoice-details { width: 48%; }
      .bill-to div, .invoice-details div { margin-bottom: 4px; }
      .invoice-details { text-align: right; }
      
      table { width: 100%; border-collapse: collapse; margin: 25px 0; }
      th { background-color: #f8f9fa; color: #1a1a1a; font-weight: 600; padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; }
      td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #dee2e6; }
      th.text-right, td.text-right { text-align: right; }
      
      .item-code { font-size: 12px; color: #666; margin-top: 3px; }
      
      .total-section { margin-top: 20px; text-align: right; padding: 15px 0; border-top: 2px solid #dee2e6; }
      .total-section div { margin: 5px 0; }
      .total-section strong { font-size: 18px; color: #1a1a1a; }
      
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
      .footer p { margin: 4px 0; font-size: 12px; color: #4a4a4a; }

      .footer1 { text-align: center; margin-top: 10px; padding-top: 20px; border-top: 1px solid #dee2e6; }
      .footer1 p { margin: 4px 0; font-size: 9px; color: #4a4a4a; }
    `;
    
    // Set the content of the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AutoSpa Invoice - ${generatedBill.customer.vehicleNumber}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-content">
            <div class="print-header">
              <img src="/lovable-uploads/9e4813d3-fe57-41e4-a643-bee06a651855.png" alt="AutoSpa Logo" class="logo" />
              <div class="company-name">AutoSpa Pvt Ltd</div>
              <div class="company-subtitle">Vehicle Spare Parts & Service Center</div>
            </div>
            
            <div class="invoice-info">
              <div class="bill-to">
                <div style="margin-bottom: 5px;">Bill To:</div>
                <div><strong>${generatedBill.customer.name || 'Customer'}</strong></div>
                <div>${generatedBill.customer.mobile || '-'}</div>
                <div>${generatedBill.customer.company || '-'}</div>
                <div>Vehicle: <strong>${generatedBill.customer.vehicleNumber}</strong></div>
              </div>
              
              <div class="invoice-details">
                <div style="margin-bottom: 5px;">Invoice Details:</div>
                <div>Invoice #: INV-${generatedBill.id.substring(0, 8)}</div>
                <div>Date: ${format(new Date(generatedBill.date), 'dd/MM/yyyy')}</div>
                <div>Payment: ${
                  generatedBill.paymentMethod === 'cash' ? 'Cash' :
                  generatedBill.paymentMethod === 'card' ? 'Card' : 'UPI'
                }</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Disc.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${generatedBill.items.map(item => `
                  <tr>
                    <td>
                      <div>${item.name}</div>
                      <div class="item-code">${item.code}</div>
                    </td>
                    <td class="text-right">Rs.${item.price.toLocaleString()}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${item.discount}%</td>
                    <td class="text-right">Rs.${item.total.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div>Subtotal: Rs.${generatedBill.subTotal.toLocaleString()}</div>
              ${generatedBill.discount > 0 ? `
                <div>Discount (${generatedBill.discount}%): -Rs.${((generatedBill.subTotal - generatedBill.total)).toLocaleString()}</div>
              ` : ''}
              <div><strong>Total: Rs.${generatedBill.total.toLocaleString()}</strong></div>
            </div>
            
            ${generatedBill.notes ? `
              <div style="margin-top: 15px;">
                <div>Notes:</div>
                <div>${generatedBill.notes}</div>
              </div>
            ` : ''}
            
            <div class="footer text-center text-xs text-muted-foreground pt-2 border-t">
              <p class="mb-1">AutoSpa PVT LTD</p>
              <p class="mb-1">Kandy Road, Molagoda, Kegalle<br/>(Next to Millangoda Filling Station)</p>
              <p class="mb-1">Contact Us:<br/>0715197759 | 0761752556</p>
              <p class="font-semibold mb-1">The pioneer of all kinds of vehicle repairing, maintenance, & car refreshening services</p>
            </div>
            <div class="footer1 text-center text-xs text-muted-foreground pt-2 border-t">
              <p class="mb-1">Powered by Konnetor Digital Solutions | konnetor.com | +94 74 177 0447 </p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    // Finish writing to the document and print it
    printWindow.document.close();
    
    // Wait a moment for content to load before printing
    setTimeout(() => {
      printWindow.print();
      
      // Close the print window after printing (or when print dialog is closed)
      printWindow.onafterprint = () => {
        printWindow.close();
        
        // Show success toast only after print is complete
        toast.success('Invoice sent to printer and saved successfully');
        
        // Only reset the form if the user explicitly completes the printing process
        if (confirm('Would you like to create a new bill?')) {
          // Reset form after successful submission and printing
          setBillItems([]);
          setVehicleNumber('');
          setCustomerName('');
          setMobileNumber('');
          setCompanyName('');
          setTotalDiscount('');
          setPaymentMethod('cash');
          setNotes('');
          setGeneratedBill(null);
          setIsPrintDialogOpen(false);
        } else {
          // Just close the dialog but keep the form data
          setIsPrintDialogOpen(false);
        }
      };
    }, 500);
  } catch (error) {
    console.error('Error submitting bill:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to submit bill');
  }
};
  return (
    <TransitionEffect>
      <div className="min-h-screen bg-background">
        <Header 
          isLoggedIn={true} 
          isAdmin={isAdmin}
          onLogout={handleLogout} 
        />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
              <p className="text-muted-foreground">
                Create and manage customer invoices
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Car className="mr-2 h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-number">
                          Vehicle Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="vehicle-number"
                          placeholder="e.g. KA01AB1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input
                          id="customer-name"
                          placeholder="Enter customer name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile-number">Mobile Number</Label>
                        <Input
                          id="mobile-number"
                          placeholder="e.g. 9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company (Optional)</Label>
                        <Input
                          id="company-name"
                          placeholder="Enter company name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Bill Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products or services..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      
                      {showSearchResults && (
                        <div className="absolute w-full mt-1 z-50 bg-popover shadow-lg rounded-md border border-border overflow-hidden">
                          <div className="p-2 max-h-64 overflow-y-auto">
                            {searchResults.map((item) => {
                              const itemType = 'quantity' in item ? 'product' : 'service';
                              const isAvailable = itemType === 'service' || (itemType === 'product' && (item as Product).quantity > 0);
                              
                              return (
                                <div
                                  key={item.id}
                                  className={`p-2 flex items-center justify-between hover:bg-accent rounded-md cursor-pointer ${
                                    !isAvailable ? 'opacity-50' : ''
                                  }`}
                                  onClick={() => isAvailable && handleAddItem(item)}
                                >
                                  <div>
                                    <div className="flex items-center">
                                      <div className="badge-chip mr-2">
                                        {itemType === 'product' ? 'Product' : 'Service'}
                                      </div>
                                      <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.code} - Rs.{item.price.toLocaleString()}
                                      {itemType === 'product' && (
                                        <span className="ml-2">
                                          (Stock: {(item as Product).quantity})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    disabled={!isAvailable}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isAvailable) handleAddItem(item);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                            
                            {searchResults.length === 0 && (
                              <div className="p-2 text-center text-muted-foreground">
                                No results found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <div className="text-sm text-muted-foreground">Or add a custom service</div>
                      <Button 
                        onClick={() => setIsCustomServiceDialogOpen(true)}
                        className="bg-autospa-red hover:bg-autospa-red/90"
                        size="sm"
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Add Custom Service
                      </Button>
                    </div>
                    
                    <Dialog open={isCustomServiceDialogOpen} onOpenChange={setIsCustomServiceDialogOpen}>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add Custom Service</DialogTitle>
                          <DialogDescription>
                            Add a custom service with a specific price that isn't in the predefined list.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-service-name">Service Name</Label>
                            <Input
                              id="custom-service-name"
                              placeholder="Enter service name"
                              value={customServiceName}
                              onChange={(e) => setCustomServiceName(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="custom-service-price">Price (Rs)</Label>
                            <Input
                              id="custom-service-price"
                              placeholder="Enter price"
                              type="number"
                              min="0"
                              value={customServicePrice}
                              onChange={(e) => setCustomServicePrice(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="custom-service-description">Description (Optional)</Label>
                            <Input
                              id="custom-service-description"
                              placeholder="Enter description"
                              value={customServiceDescription}
                              onChange={(e) => setCustomServiceDescription(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCustomServiceDialogOpen(false)}>Cancel</Button>
                          <Button 
                            className="bg-autospa-red hover:bg-autospa-red/90"
                            onClick={handleAddCustomService}
                          >
                            Add to Bill
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {billItems.length > 0 ? (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="text-center">Quantity</TableHead>
                              <TableHead className="text-center">Discount</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {billItems.map((item, index) => (
                              <TableRow key={`${item.id}-${index}`}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <div className="badge-chip mr-2 text-[10px]">
                                        {item.type === 'product' ? 'Product' : 'Service'}
                                      </div>
                                      {item.code}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>Rs.{item.price.toLocaleString()}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 rounded-r-none"
                                      onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                    >
                                      -
                                    </Button>
                                    <Input
                                      className="h-6 w-12 text-center rounded-none"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) handleQuantityChange(index, val);
                                      }}
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 rounded-l-none"
                                      onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                    >
                                      +
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="relative flex items-center justify-center">
                                    <Input
                                      className="h-6 w-16 text-center mx-auto pr-5"
                                      value={item.discount}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) handleItemDiscountChange(index, val);
                                      }}
                                    />
                                    <span className="absolute right-2 text-muted-foreground">%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                Rs.{item.total.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium">
                                Subtotal
                              </TableCell>
                              <TableCell colSpan={3} className="text-right font-medium">
                              Rs.{calculateSubTotal().toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium">
                                Item Discounts
                              </TableCell>
                              <TableCell colSpan={3} className="text-right font-medium">
                              Rs.{(calculateSubTotal() - calculateTotalBeforeDiscount()).toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium">
                                Total After Item Discounts
                              </TableCell>
                              <TableCell colSpan={3} className="text-right font-medium">
                              Rs.{calculateTotalBeforeDiscount().toLocaleString()}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-lg">
                        <div className="mx-auto h-12 w-12 text-muted-foreground flex items-center justify-center rounded-full bg-muted mb-2">
                          <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-foreground">No items added</h3>
                        <p className="text-sm text-muted-foreground">
                          Search for products or services to add them to the bill
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-discount">Overall Discount (%)</Label>
                      <Input
                        id="total-discount"
                        placeholder="0"
                        value={totalDiscount}
                        onChange={(e) => setTotalDiscount(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                          className={paymentMethod === 'cash' ? 'bg-autospa-red hover:bg-autospa-red/90' : ''}
                          onClick={() => setPaymentMethod('cash')}
                        >
                          Cash
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === 'card' ? 'default' : 'outline'}
                          className={paymentMethod === 'card' ? 'bg-autospa-red hover:bg-autospa-red/90' : ''}
                          onClick={() => setPaymentMethod('card')}
                        >
                          Card
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                          className={paymentMethod === 'upi' ? 'bg-autospa-red hover:bg-autospa-red/90' : ''}
                          onClick={() => setPaymentMethod('upi')}
                        >
                          UPI
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Add any notes here"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between py-2">
                        <span className="text-sm">Subtotal</span>
                        <span>Rs.{calculateSubTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm">Item Discounts</span>
                        <span>-Rs.{(calculateSubTotal() - calculateTotalBeforeDiscount()).toLocaleString()}</span>
                      </div>
                      {totalDiscount && parseFloat(totalDiscount) > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm">Overall Discount ({totalDiscount}%)</span>
                          <span>-Rs.{(calculateTotalBeforeDiscount() * (parseFloat(totalDiscount) / 100)).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-t border-border">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-lg">Rs.{calculateFinalTotal().toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-autospa-red hover:bg-autospa-red/90 button-hover"
                      onClick={handleGenerateBill}
                      disabled={billItems.length === 0}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Generate Bill
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        
        {/* Dialog component with accessibility fixes */}
<Dialog 
  open={isPrintDialogOpen} 
  onOpenChange={(open) => {
    // Only handle the closing case here
    if (!open) {
      setIsPrintDialogOpen(false);
      // Don't reset form data when dialog is closed
    }
  }}
>
  <DialogContent 
    className="sm:max-w-[500px] max-h-[100vh] overflow-y-auto"
  >
    <DialogHeader>
      <DialogTitle>Invoice Preview</DialogTitle>
      <DialogDescription>
        Review the invoice before printing
      </DialogDescription>
    </DialogHeader>
    {generatedBill && (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <img src="/lovable-uploads/9e4813d3-fe57-41e4-a643-bee06a651855.png" alt="AutoSpa Logo" className="h-16 mx-auto" />
          <h2 className="text-xl font-bold">AutoSpa Pvt Ltd</h2>
          <p className="text-sm text-muted-foreground">Vehicle Spare Parts & Service Center</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Bill To:</p>
            <p className="font-medium">{generatedBill.customer.name || 'Customer'}</p>
            <p>{generatedBill.customer.mobile || '-'}</p>
            <p>{generatedBill.customer.company || '-'}</p>
            <p>Vehicle: <span className="font-medium">{generatedBill.customer.vehicleNumber}</span></p>
          </div>
          <div className="text-right">
            <p className="font-medium">Invoice Details:</p>
            <p>Invoice #: INV-{generatedBill.id.substring(0, 8)}</p>
            <p>Date: {format(new Date(generatedBill.date), 'dd/MM/yyyy')}</p>
            <p>Payment: {paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'UPI'}</p>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Disc.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generatedBill.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.code}</div>
                  </TableCell>
                  <TableCell className="text-right">Rs.{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.discount}%</TableCell>
                  <TableCell className="text-right">Rs.{item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="text-right space-y-1">
          <p>Subtotal: Rs.{generatedBill.subTotal.toLocaleString()}</p>
          {generatedBill.discount > 0 && (
            <p>Discount ({generatedBill.discount}%): -Rs.{(generatedBill.subTotal - generatedBill.total).toLocaleString()}</p>
          )}
          <p className="font-bold">Total: Rs.{generatedBill.total.toLocaleString()}</p>
        </div>
        
        {generatedBill.notes && (
          <div className="text-sm">
            <p className="font-medium">Notes:</p>
            <p>{generatedBill.notes}</p>
          </div>
        )}
        
        <div className="footer text-center text-xs text-muted-foreground pt-2 border-t">
          <p className="mb-1">AutoSpa PVT LTD</p>
          <p className="mb-1">Kandy Road, Molagoda, Kegalle<br/>(Next to Millangoda Filling Station)</p>
          <p className="mb-1">Contact Us:<br/>0715197759 | 0761752556</p>
          <p className="font-semibold mb-1">The pioneer of all kinds of vehicle repairing, maintenance, & car refreshening services</p>
        </div>
      </div>
    )}
    <DialogFooter className="flex justify-between">
      <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
        Back to Edit
      </Button>
      <Button onClick={handlePrintBill}>
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </TransitionEffect>
  );
};

export default Billing;


const handlePrintBill = () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Add print-specific styles
  const printStyles = `
    @media print {
      @page { margin: 15mm; size: A4; }
      body { font-family: Arial, sans-serif; padding: 20px; }
      .no-print { display: none; }
      img { max-width: 100px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f8f9fa; }
      .invoice-header { text-align: center; margin-bottom: 30px; }
      .customer-details { margin: 20px 0; }
      .total-section { margin-top: 30px; text-align: right; }
    }
  `;

  // Get customer and billing details
  const customerDetails = document.querySelector('.customer-details')?.cloneNode(true);
  const invoiceContent = document.querySelector('.py-4.space-y-6')?.cloneNode(true);
  if (!invoiceContent || !customerDetails) return;

  // Set up the print window content with enhanced structure
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AutoSpa Invoice</title>
        <style>${printStyles}</style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>AutoSpa Invoice</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        ${customerDetails.outerHTML}
        ${invoiceContent.outerHTML}
      </body>
    </html>
  `);

  // Wait for content to load before printing
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  }, 500);
};
