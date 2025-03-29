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
import { mockReports } from '@/lib/data';
import { DailyReport } from '@/lib/types';
import { BarChart, LineChart, PieChart } from '@/components/ui/custom-charts';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const Reports = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DailyReport[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else if (!userIsAdmin) {
      navigate('/dashboard');
    } else {
      setIsAdmin(true);
      setReports(mockReports);
      setFilteredReports(mockReports);
    }
  }, [navigate]);
  
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = reports.filter(report => 
        isAfter(report.date, subDays(startDate, 1)) && 
        isBefore(report.date, subDays(endDate, -1))
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [startDate, endDate, reports]);
  
  const handleLogout = () => {
    localStorage.removeItem('autospa_isLoggedIn');
    localStorage.removeItem('autospa_username');
    localStorage.removeItem('autospa_isAdmin');
    navigate('/');
  };
  
  const handleExport = () => {
    toast.success('Report exported successfully');
  };
  
  const totalSales = filteredReports.reduce((sum, report) => sum + report.totalSales, 0);
  const totalProductSales = filteredReports.reduce((sum, report) => sum + report.productSales, 0);
  const totalServiceSales = filteredReports.reduce((sum, report) => sum + report.serviceSales, 0);
  const totalProfit = filteredReports.reduce((sum, report) => sum + report.profit, 0);
  const totalBills = filteredReports.reduce((sum, report) => sum + report.billCount, 0);
  
  const salesChartData = filteredReports.map(report => ({
    name: format(report.date, 'dd MMM'),
    products: report.productSales,
    services: report.serviceSales,
    total: report.totalSales
  }));
  
  const profitChartData = filteredReports.map(report => ({
    name: format(report.date, 'dd MMM'),
    profit: report.profit
  }));
  
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
                  Analyze sales and performance metrics
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd MMM, yyyy') : 'Select date'}
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
                </div>
                
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd MMM, yyyy') : 'Select date'}
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
                </div>
                
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                      <h3 className="text-2xl font-bold">₹{totalSales.toLocaleString()}</h3>
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
                      <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                      <h3 className="text-2xl font-bold">₹{totalProfit.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <DollarSign className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Product Sales</p>
                      <h3 className="text-2xl font-bold">₹{totalProductSales.toLocaleString()}</h3>
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
                      <h3 className="text-2xl font-bold">₹{totalServiceSales.toLocaleString()}</h3>
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
              <TabsList className="grid grid-cols-3 sm:w-[400px]">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Sales Overview
                      </CardTitle>
                      <CardDescription>
                        Sales breakdown for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={salesChartData}
                        index="name"
                        categories={['products', 'services']}
                        colors={['#3B82F6', '#8B5CF6']}
                        yAxisWidth={48}
                        height={350}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <PieChartIcon className="mr-2 h-5 w-5" />
                        Sales Distribution
                      </CardTitle>
                      <CardDescription>
                        Products vs Services sales breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <PieChart
                        data={salesBreakdownData}
                        index="name"
                        valueFormatter={(value) => `₹${value.toLocaleString()}`}
                        category="value"
                        colors={['#3B82F6', '#8B5CF6']}
                        height={300}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Summary Report
                    </CardTitle>
                    <CardDescription>
                      All key metrics for the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Sales Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Sales</span>
                            <span className="font-medium">₹{totalSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Product Sales</span>
                            <span className="font-medium">₹{totalProductSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Service Sales</span>
                            <span className="font-medium">₹{totalServiceSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">Average Daily Sales</span>
                            <span className="font-medium">
                              ₹{(totalSales / (filteredReports.length || 1)).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Profit & Performance</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Profit</span>
                            <span className="font-medium">₹{totalProfit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Profit Margin</span>
                            <span className="font-medium">
                              {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">Average Daily Profit</span>
                            <span className="font-medium">
                              ₹{(totalProfit / (filteredReports.length || 1)).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Business Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Invoices</span>
                            <span className="font-medium">{totalBills}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg. Invoice Value</span>
                            <span className="font-medium">
                              ₹{totalBills > 0 ? (totalSales / totalBills).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }) : 0}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">Days in Period</span>
                            <span className="font-medium">{filteredReports.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Sales Trend
                      </CardTitle>
                      <CardDescription>
                        Daily sales breakdown during selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={salesChartData}
                        index="name"
                        categories={['products', 'services']}
                        colors={['#3B82F6', '#8B5CF6']}
                        yAxisWidth={48}
                        height={400}
                        stack
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Profit Trend
                      </CardTitle>
                      <CardDescription>
                        Daily profit during selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart
                        data={profitChartData}
                        index="name"
                        categories={['profit']}
                        colors={['#10B981']}
                        yAxisWidth={48}
                        height={400}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <PieChartIcon className="mr-2 h-5 w-5" />
                        Sales Distribution
                      </CardTitle>
                      <CardDescription>
                        Products vs Services sales breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <PieChart
                        data={salesBreakdownData}
                        index="name"
                        valueFormatter={(value) => `₹${value.toLocaleString()}`}
                        category="value"
                        colors={['#3B82F6', '#8B5CF6']}
                        height={400}
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
                      Detailed Report
                    </CardTitle>
                    <CardDescription>
                      Day-by-day breakdown of all metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Total Sales</TableHead>
                            <TableHead className="text-right">Product Sales</TableHead>
                            <TableHead className="text-right">Service Sales</TableHead>
                            <TableHead className="text-right">Bill Count</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                            <TableHead className="text-right">Margin %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                              <TableRow key={report.date.toString()}>
                                <TableCell>{format(report.date, 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="text-right">₹{report.totalSales.toLocaleString()}</TableCell>
                                <TableCell className="text-right">₹{report.productSales.toLocaleString()}</TableCell>
                                <TableCell className="text-right">₹{report.serviceSales.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{report.billCount}</TableCell>
                                <TableCell className="text-right">₹{report.profit.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                  {((report.profit / report.totalSales) * 100).toFixed(2)}%
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center h-24">
                                No data available for the selected period.
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
