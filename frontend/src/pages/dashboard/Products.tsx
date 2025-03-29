
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TransitionEffect from '@/components/common/TransitionEffect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, X, Save, AlertTriangle } from 'lucide-react';
import { mockProducts, addProduct } from '@/lib/data';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/api';

const Products = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formCost, setFormCost] = useState('');
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const userIsAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (!isLoggedIn) {
      navigate('/');
    } else {
      setIsAdmin(userIsAdmin);
      // Fetch products from the backend
      fetch(getApiUrl('/api/get_products'))
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      })
        .catch(error => {
          console.error('Error fetching products:', error);
          toast.error('Failed to fetch products');
        });
    }
  }, [navigate]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(
        product => 
          product.name.toLowerCase().includes(term) || 
          product.code.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);
  
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
    setFormQuantity('');
    setFormDiscount('');
    setFormCost('');
  };
  
  const handleAddProduct = async () => {
    if (!formName || !formPrice || !formCode || !formQuantity) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const userType = localStorage.getItem('autospa_username');
      
      const productData = {
        name: formName,
        price: parseFloat(formPrice),
        code: formCode,
        quantity: parseInt(formQuantity),
        discount: formDiscount ? parseFloat(formDiscount) : 0,
        user_type: userType
      };
      
      const response = await fetch(getApiUrl('/api/add_products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      
      const addedProduct = await response.json();
      setProducts([addedProduct, ...products]);
      
      resetForm();
      setIsAddDialogOpen(false);
      toast.success('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please try again.');
    }
  };
  
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormCode(product.code);
    setFormQuantity(product.quantity.toString());
    setFormDiscount(product.discount?.toString() || '');
    setFormCost(product.cost?.toString() || '');
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const updatedProduct = {
        ...selectedProduct,
        name: formName,
        price: parseFloat(formPrice),
        code: formCode,
        quantity: parseInt(formQuantity),
        discount: formDiscount ? parseFloat(formDiscount) : 0,
        cost: isAdmin && formCost ? parseFloat(formCost) : undefined,
        edited_by: localStorage.getItem('autospa_username')
      };

      const response = await fetch(getApiUrl('/api/edit_products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const result = await response.json();
      
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? result : p
      );
      
      setProducts(updatedProducts);
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
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
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">
                  Manage your spare parts inventory
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 w-full sm:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-autospa-red hover:bg-autospa-red/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to add a new product to inventory
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter product name"
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
                        <Label htmlFor="code">Product Code</Label>
                        <Input
                          id="code"
                          placeholder="e.g. P001"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="discount">Discount %</Label>
                        <Input
                          id="discount"
                          type="number"
                          placeholder="0"
                          value={formDiscount}
                          onChange={(e) => setFormDiscount(e.target.value)}
                        />
                      </div>
                      

                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-autospa-red hover:bg-autospa-red/90"
                        onClick={handleAddProduct}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Product
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
                        <TableHead>Product Code</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        {isAdmin && <TableHead className="text-right">Cost</TableHead>}
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.code}</TableCell>
                            <TableCell className="text-right">Rs.{product.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <span className={product.quantity < 10 ? "text-destructive font-medium" : ""}>
                                {product.quantity}
                                {product.quantity < 10 && (
                                  <AlertTriangle className="inline ml-1 h-4 w-4" />
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {product.discount ? `${product.discount}%` : '-'}
                            </TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                {product.cost ? `Rs.${product.cost.toLocaleString()}` : '-'}
                              </TableCell>
                            )}
                            {isAdmin && (
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditClick(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isAdmin ? 7 : 5} className="text-center h-24">
                            No products found.
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
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to the product details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-name">Product Name</Label>
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
                <Label htmlFor="edit-code">Product Code</Label>
                <Input
                  id="edit-code"
                  value={formCode}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="edit-discount">Discount %</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                />
              </div>
              
              {isAdmin && (
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="edit-cost">Cost Price (Rs.) (Admin Only)</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-autospa-red hover:bg-autospa-red/90"
                onClick={handleUpdateProduct}
              >
                <Save className="mr-2 h-4 w-4" />
                Update Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </TransitionEffect>
  );
};

export default Products;
