
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TransitionEffect from '@/components/common/TransitionEffect';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Save } from 'lucide-react';
// import { mockServices, addService } from '@/lib/data';
import { Service } from '@/lib/types';
import { toast } from 'sonner';
import { BACKEND_URL, getApiUrl } from '@/config/api';

const Services = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCost, setFormCost] = useState('');
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else {
      setIsAdmin(userIsAdmin);
      // Fetch services from the backend
      fetchServices();
    }
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await fetch(getApiUrl('api/get_services'));
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    }
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = services.filter(
        service => 
          service.name.toLowerCase().includes(term) || 
          service.code.toLowerCase().includes(term)
      );
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);
  
  const handleLogout = () => {
    localStorage.removeItem('autospa_isLoggedIn');
    localStorage.removeItem('autospa_username');
    localStorage.removeItem('autospa_isAdmin');
    navigate('/');
  };
  
  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormCode('');
    setFormDescription('');
    setFormCost('');
  };
  
  const handleAddService = async () => {
    if (!formName || !formPrice || !formCode) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const userType = localStorage.getItem('autospa_username');
      const response = await fetch(getApiUrl('api/add_service'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          price: parseFloat(formPrice),
          code: formCode,
          description: formDescription || undefined,
          user_type: userType,

        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to add service');
      }
  
      const addedService = await response.json();
      setServices([addedService, ...services]);
      
      resetForm();
      setIsAddDialogOpen(false);
      toast.success('Service added successfully');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };
  
  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setFormName(service.name);
    setFormPrice(service.price.toString());
    setFormCode(service.code);
    setFormDescription(service.description || '');
    setFormCost(service.cost?.toString() || '');
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    try {
      const userType = localStorage.getItem('autospa_username');
      const response = await fetch(getApiUrl('api/edit_services'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          price: parseFloat(formPrice),
          code: selectedService.code, // Pass the original service code
          description: formDescription || undefined,
          user_type: userType // Pass the user type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      await fetchServices(); // Refresh the services list
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Service updated successfully');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Services</h1>
                <p className="text-muted-foreground">
                  Manage service offerings for your customers
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-10 w-full sm:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-autospa-red hover:bg-autospa-red/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to add a new service
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter service name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="price">Price (Rs.)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0.00"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="code">Service Code</Label>
                        <Input
                          id="code"
                          placeholder="e.g. S001"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the service"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
               
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-autospa-red hover:bg-autospa-red/90"
                        onClick={handleAddService}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Service
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Service Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                 
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{service.code}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {service.description || '-'}
                            </TableCell>
                            <TableCell className="text-right">Rs.{service.price.toLocaleString()}</TableCell>
                
                            {isAdmin && (
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditClick(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isAdmin ? 6 : 4} className="text-center h-24">
                            No services found.
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
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Make changes to the service details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-name">Service Name</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="edit-price">Price (Rs.)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="edit-code">Service Code</Label>
                <Input
                  id="edit-code"
                  value={formCode}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
        
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-autospa-red hover:bg-autospa-red/90"
                onClick={handleUpdateService}
              >
                <Save className="mr-2 h-4 w-4" />
                Update Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </TransitionEffect>
  );
};

export default Services;
