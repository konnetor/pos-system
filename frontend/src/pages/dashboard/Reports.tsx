import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TransitionEffect from '@/components/common/TransitionEffect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, FileText, PieChart as PieChartIcon, TrendingUp, Download, DollarSign } from 'lucide-react';
import { DailyReport } from '@/lib/types';
import { BarChart, LineChart, PieChart } from '@/components/ui/custom-charts';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import axios from 'axios';
import { BACKEND_URL, getApiUrl } from '@/config/api';

interface DailyReportData {
  totalSales: number;
  totalBills: number;
  bills: Array<{
    id: number;
    customer_id: number;
    vehicle_no: string;
    payment_method: string;
    sub_total: number;
    total: number;
    payment_date: string;
    product_sales: number;
    service_sales: number;
    items: Array<{
      id: number;
      type: string;
      name: string;
      code: string;
      price: number;
      quantity: number;
      total: number;
    }>;
  }>;
  dateRange?: {
    start: string;
    end: string;
    type: string;
  };
}

const Reports = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReportData | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else if (!userIsAdmin) {
      navigate('/dashboard');
    } else {
      setIsAdmin(true);
      // Initial fetch with daily report type
      fetchReportWithType('daily');
    }
  }, [navigate]);

  // Function to directly fetch with a specific type
  const fetchReportWithType = async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      setIsLoading(true);
      setError(null);

      const url = getApiUrl('/api/get_report');
      const params = new URLSearchParams();
      
      // Use the type parameter directly instead of state
      params.append('report_type', type);
      
      console.log(`Fetching report with type: ${type}`);
      const response = await axios.get<DailyReportData>(`${url}?${params.toString()}`);
      
      // Update report type and data after successful fetch
      setReportType(type);
      setDailyReport(response.data);
      setIsCustomRange(false);
      setStartDate(undefined);
      setEndDate(undefined);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  // Function for custom date range
  const fetchReportWithDateRange = async (start: Date, end: Date) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = getApiUrl('/api/get_report');
      const params = new URLSearchParams();
      
      params.append('start_date', format(start, 'yyyy-MM-dd'));
      params.append('end_date', format(end, 'yyyy-MM-dd'));
      
      console.log(`Fetching report with date range: ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`);
      const response = await axios.get<DailyReportData>(`${url}?${params.toString()}`);
      
      setDailyReport(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeSubmit = () => {
    if (startDate && endDate) {
      fetchReportWithDateRange(startDate, endDate);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('autospa_isLoggedIn');
    localStorage.removeItem('autospa_username');
    localStorage.removeItem('autospa_isAdmin');
    navigate('/');
  };
  
  const handleExport = () => {
    toast.success('Report exported successfully');
  };
  
  if (isLoading) {
    return (
      <TransitionEffect>
        <div className="min-h-screen bg-background">
          <Header isLoggedIn={true} isAdmin={isAdmin} onLogout={handleLogout} />
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto text-center">
              Loading report data...
            </div>
          </main>
        </div>
      </TransitionEffect>
    );
  }

  if (error) {
    return (
      <TransitionEffect>
        <div className="min-h-screen bg-background">
          <Header isLoggedIn={true} isAdmin={isAdmin} onLogout={handleLogout} />
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto text-center text-red-500">
              {error}
            </div>
          </main>
        </div>
      </TransitionEffect>
    );
  }

  const totalSales = dailyReport?.totalSales || 0;
  const totalBills = dailyReport?.totalBills || 0;
  const totalProductSales = dailyReport?.bills.reduce((sum, bill) => sum + bill.product_sales, 0) || 0;
  const totalServiceSales = dailyReport?.bills.reduce((sum, bill) => sum + bill.service_sales, 0) || 0;
  
  const salesBreakdownData = [
    { name: 'Products', value: totalProductSales },
    { name: 'Services', value: totalServiceSales }
  ];

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
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">
                  Sales and performance metrics
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="px-3 py-2 rounded-md border"
                  value={isCustomRange ? 'custom' : reportType}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Select value changed to:', value);
                    if (value === 'custom') {
                      setIsCustomRange(true);
                    } else {
                      // Call the direct fetch function with the selected type
                      fetchReportWithType(value as 'daily' | 'weekly' | 'monthly');
                    }
                  }}
                >
                  <option value="daily">Daily Report</option>
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="custom">Custom Range</option>
                </select>

                {isCustomRange && (
                  <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'dd MMM, yyyy') : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'dd MMM, yyyy') : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                    <Button 
                      onClick={handleDateRangeSubmit}
                      disabled={!startDate || !endDate}
                    >
                      Apply Range
                    </Button>
                  </>
                )}
                
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Date range display */}
            {dailyReport?.dateRange && (
              <div className="text-sm text-muted-foreground">
                Showing data for: {format(new Date(dailyReport.dateRange.start), 'dd MMM, yyyy')}
                {' - '}
                {format(new Date(dailyReport.dateRange.end), 'dd MMM, yyyy')}
                {' '}
                ({dailyReport.dateRange.type})
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                      <h3 className="text-2xl font-bold">Rs.{totalSales.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-autospa-red/10 rounded-full">
                      <TrendingUp className="h-8 w-8 text-autospa-red" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Bills</p>
                      <h3 className="text-2xl font-bold">{totalBills}</h3>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <FileText className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Product Sales</p>
                      <h3 className="text-2xl font-bold">Rs.{totalProductSales.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Service Sales</p>
                      <h3 className="text-2xl font-bold">Rs.{totalServiceSales.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-violet-100 rounded-full">
                      <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs
              defaultValue="summary"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-2 sm:w-[400px]">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <PieChartIcon className="mr-2 h-5 w-5" />
                        Sales Breakdown
                      </CardTitle>
                      <CardDescription>
                        Distribution of product and service sales
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PieChart
                        data={salesBreakdownData}
                        index="name"
                        category="value"
                        colors={['#3B82F6', '#8B5CF6']}
                        valueFormatter={(value) => `Rs.${value.toLocaleString()}`}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Billing Details
                    </CardTitle>
                    <CardDescription>
                      Detailed list of today's bills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bill ID</TableHead>
                            <TableHead>Vehicle No</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead className="text-right">Product Sales</TableHead>
                            <TableHead className="text-right">Service Sales</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyReport?.bills.map((bill) => (
                            <TableRow key={bill.id}>
                              <TableCell>{bill.id}</TableCell>
                              <TableCell>{bill.vehicle_no}</TableCell>
                              <TableCell className="capitalize">{bill.payment_method}</TableCell>
                              <TableCell className="text-right">Rs.{bill.product_sales.toLocaleString()}</TableCell>
                              <TableCell className="text-right">Rs.{bill.service_sales.toLocaleString()}</TableCell>
                              <TableCell className="text-right">Rs.{bill.total.toLocaleString()}</TableCell>
                              </TableRow>
                          ))}
                          {(!dailyReport?.bills || dailyReport.bills.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center h-24">
                                No bills found for today
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </TransitionEffect>
  );
};

export default Reports;
