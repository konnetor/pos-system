
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TransitionEffect from '@/components/common/TransitionEffect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockReports } from '@/lib/data';
import { BarChart, LineChart } from '@/components/ui/custom-charts';
import { ShoppingBag, Wrench as Tool, FileText, TrendingUp, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [summaryData, setSummaryData] = useState({
    total_products: 0,
    total_services: 0,
    total_bills: 0,
    low_stock_count: 0
  });
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else {
      setIsAdmin(userIsAdmin);
      fetchSummaryData();
    }
  }, [navigate]);
  
  const fetchSummaryData = async () => {
    try {
      const response = await fetch(getApiUrl('/api/get_summary_data'));
      if (!response.ok) throw new Error('Failed to fetch summary data');
      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      toast.error('Failed to fetch dashboard data');
    }
  };
  
  const handleLogout = () => {
    // Clear localStorage data
    localStorage.removeItem('autospa_isLoggedIn');
    localStorage.removeItem('autospa_username');
    localStorage.removeItem('autospa_isAdmin');
    
    // Navigate to login page
    navigate('/');
  };
  
  // Prepare chart data
  const salesData = mockReports.map(report => ({
    name: format(report.date, 'dd MMM'),
    total: report.totalSales,
    products: report.productSales,
    services: report.serviceSales
  }));
  
  const billCountData = mockReports.map(report => ({
    name: format(report.date, 'dd MMM'),
    count: report.billCount
  }));

  return (
    <TransitionEffect>
      <div className="min-h-screen bg-background">
        <Header 
          isLoggedIn={true} 
          isAdmin={isAdmin}
          onLogout={handleLogout} 
        />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {localStorage.getItem('autospa_username')}!
              </p>
            </div>
            <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-muted-foreground">Create Invoice</p>
                      <h3 className="text-2xl font-bold">New Bill</h3>
                    </div>
                    <Button
                      onClick={() => navigate('/dashboard/billing')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-autospa-red/10 rounded-full">
                      <ShoppingBag className="h-8 w-8 text-autospa-red" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Products</p>
                      <h3 className="text-2xl font-bold">{summaryData.total_products}</h3>
                      {summaryData.low_stock_count > 0 && (
                        <p className="text-xs text-destructive mt-1">
                          {summaryData.low_stock_count} items low on stock
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Tool className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Services</p>
                      <h3 className="text-2xl font-bold">{summaryData.total_services}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <FileText className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Invoices</p>
                      <h3 className="text-2xl font-bold">{summaryData.total_bills}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Calendar className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today</p>
                      <h3 className="text-2xl font-bold">{format(new Date(), 'dd MMM, yyyy')}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Sales Overview
                  </CardTitle>
                  <CardDescription>
                    Daily sales performance for the last week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={salesData}
                    index="name"
                    categories={['total']}
                    colors={['#D60C0C']}
                    yAxisWidth={48}
                    height={300}
                  />
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Invoice Count
                  </CardTitle>
                  <CardDescription>
                    Number of invoices generated per day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={billCountData}
                    index="name"
                    categories={['count']}
                    colors={['#3B82F6']}
                    yAxisWidth={48}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div> */}
            
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-2 hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Recent Invoices
                  </CardTitle>
                  <CardDescription>
                    Latest transactions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBills.slice(0, 3).map(bill => (
                      <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">{bill.customer.name || 'Customer'}</p>
                          <p className="text-sm text-muted-foreground">
                            {bill.customer.vehicleNumber} - {format(bill.date, 'dd MMM, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rs.{bill.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{bill.items.length} items</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Recent Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBills.slice(0, 4).map(bill => (
                      <div key={bill.id} className="flex items-center p-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                          {bill.customer.name ? bill.customer.name.charAt(0) : 'C'}
                        </div>
                        <div>
                          <p className="font-medium">{bill.customer.name || 'Customer'}</p>
                          <p className="text-xs text-muted-foreground">
                            {bill.customer.vehicleNumber}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div> */}
          </div>
        </main>
      </div>
      <Footer />
    </TransitionEffect>
  );
};

export default Dashboard;
