
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/components/auth/LoginForm';
import TransitionEffect from '@/components/common/TransitionEffect';

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('autospa_isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('autospa_isAdmin') === 'true';
    
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      setIsLoaded(true);
    }
  }, [navigate]);
  
  const handleLogin = (username: string, password: string, isAdmin: boolean) => {
    // Store login information in localStorage (in a real app, you'd use secure cookies or JWT)
    localStorage.setItem('autospa_isLoggedIn', 'true');
    localStorage.setItem('autospa_username', username);
    localStorage.setItem('autospa_isAdmin', isAdmin ? 'true' : 'false');
    
    // Navigate to dashboard
    navigate('/dashboard');
  };
  
  if (!isLoaded) {
    return null;
  }

  return (
    <TransitionEffect>
      <div className="min-h-screen bg-gradient-to-b from-autospa-light to-white">
        <Header />
        
        <main className="pt-28 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col space-y-6">
                <div>
                  <div className="badge-chip mb-3">Vehicle Service </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-autospa-dark">
                    AutoSpa PVT LTD
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    A complete solution for vehicle spare parts and service center management.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-white shadow-sm border border-border">
                    <h3 className="font-medium text-autospa-dark">Products</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your spare parts inventory efficiently
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white shadow-sm border border-border">
                    <h3 className="font-medium text-autospa-dark">Services</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track service offerings and pricing
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white shadow-sm border border-border">
                    <h3 className="font-medium text-autospa-dark">Billing</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate invoices with discounts
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white shadow-sm border border-border">
                    <h3 className="font-medium text-autospa-dark">Reports</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyze sales and track performance
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="order-first md:order-last">
                <LoginForm onLogin={handleLogin} />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </TransitionEffect>
  );
};

export default Index;
