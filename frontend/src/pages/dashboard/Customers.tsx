import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import TransitionEffect from '@/components/common/TransitionEffect';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Users, Car, FileText } from 'lucide-react';
import { mockBills } from '@/lib/data';
import { Customer, Bill } from '@/lib/types';
import { format } from 'date-fns';
import axios from 'axios';
import { BACKEND_URL, getApiUrl } from '@/config/api';

interface RawCustomerData {
  id: number;
  name: string | null;
  mobile_no: string | null;
  vehicel_no: string;
  company: string | null;
  payment: number | null;
  payment_date: string | null;
}

const Customers = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBills, setCustomerBills] = useState<Bill[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is logged in and admin
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else if (!userIsAdmin) {
      // This page is for admins only
      navigate('/dashboard');
    } else {
      setIsAdmin(true);
      fetchCustomers();
    }
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<RawCustomerData[]>(getApiUrl('/api/get_customers'));
      const customersData = response.data.map((customer: RawCustomerData) => ({
        id: customer.id.toString(),
        name: customer.name || 'Unknown',
        mobile: customer.mobile_no || undefined,
        vehicleNumber: customer.vehicel_no,
        company: customer.company || undefined,
        totalSpent: customer.payment || 0,
        visitCount: 1, // You might want to calculate this from actual data
        lastVisit: new Date(customer.payment_date || Date.now())
      }));
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter(
        customer => 
          (customer.name && customer.name.toLowerCase().includes(term)) || 
          (customer.mobile && customer.mobile.includes(term)) ||
          customer.vehicleNumber.toLowerCase().includes(term)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);
  
  const handleLogout = () => {
    localStorage.removeItem('autospa_isLoggedIn');
    localStorage.removeItem('autospa_username');
    localStorage.removeItem('autospa_isAdmin');
    navigate('/');
  };
  
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    
    // Find all bills for this customer by vehicle number
    const bills = mockBills.filter(
      bill => bill.customer.vehicleNumber === customer.vehicleNumber
    );
    
    setCustomerBills(bills);
    setIsViewDialogOpen(true);
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground">
                  Manage and view customer information
                </p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile or vehicle..."
                  className="pl-10 w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle Number</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Visit Count</TableHead>
                        <TableHead className="text-right">Last Visit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Loading customers...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24 text-red-500">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  {customer.name ? customer.name.charAt(0) : 'C'}
                                </div>
                                <div>
                                  <div className="font-medium">{customer.name || 'Unknown'}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {customer.mobile || 'No mobile number'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{customer.vehicleNumber}</TableCell>
                            <TableCell>{customer.company || '-'}</TableCell>
                            <TableCell className="text-right">Rs.{customer.totalSpent.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{customer.visitCount}</TableCell>
                            <TableCell className="text-right">{format(customer.lastVisit, 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewCustomer(customer)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            No customers found matching your search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Customer Details
              </DialogTitle>
              <DialogDescription>
                View complete information about this customer
              </DialogDescription>
            </DialogHeader>
            
            {selectedCustomer && (
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                        {selectedCustomer.name ? selectedCustomer.name.charAt(0) : 'C'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {selectedCustomer.name || 'Unknown Customer'}
                        </h3>
                        {selectedCustomer.company && (
                          <p className="text-muted-foreground">{selectedCustomer.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Vehicle Number:</span>
                        <span className="ml-2 font-medium">{selectedCustomer.vehicleNumber}</span>
                      </div>
                      
                      {selectedCustomer.mobile && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-muted-foreground">Mobile:</span>
                          <span className="ml-2 font-medium">{selectedCustomer.mobile}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold mt-1">Rs.{selectedCustomer.totalSpent.toLocaleString()}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Visit Count</p>
                      <p className="text-2xl font-bold mt-1">{selectedCustomer.visitCount}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Last Visit</p>
                      <p className="text-lg font-bold mt-1">{format(selectedCustomer.lastVisit, 'dd MMM, yyyy')}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">First Visit</p>
                      <p className="text-lg font-bold mt-1">
                        {/* For demo, we're assuming first visit is 6 months before last visit */}
                        {format(new Date(selectedCustomer.lastVisit.getTime() - 1000 * 60 * 60 * 24 * 180), 'dd MMM, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Billing History
                  </h3>
                  
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerBills.length > 0 ? (
                          customerBills.map((bill) => (
                            <TableRow key={bill.id}>
                              <TableCell>{format(bill.date, 'dd/MM/yyyy')}</TableCell>
                              <TableCell>INV-{bill.id.substring(0, 8)}</TableCell>
                              <TableCell>{bill.items.length} items</TableCell>
                              <TableCell className="text-right font-medium">
                              Rs.{bill.total.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              No billing history available for this customer.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TransitionEffect>
  );
};

export default Customers;
