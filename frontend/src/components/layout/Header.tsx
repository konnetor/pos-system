
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isLoggedIn = false, 
  isAdmin = false,
  onLogout = () => {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", admin: false },
    { name: "Products", path: "/dashboard/products", admin: false },
    { name: "Services", path: "/dashboard/services", admin: false },
    { name: "Billing", path: "/dashboard/billing", admin: false },
    { name: "Customers", path: "/dashboard/customers", admin: true },
    { name: "Reports", path: "/dashboard/reports", admin: true },
  ];
  
  const visibleNavItems = isAdmin 
    ? navItems 
    : navItems.filter(item => !item.admin);
  
  const renderNavigation = () => (
    <nav className="flex items-center space-x-6">
      {visibleNavItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className={cn(
            "font-medium transition-all duration-200",
            location.pathname === item.path 
              ? "text-autospa-red" 
              : "text-foreground hover:text-autospa-red"
          )}
          onClick={() => navigate(item.path)}
        >
          {item.name}
        </Button>
      ))}
    </nav>
  );
  
  const renderMobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] bg-background">
        <div className="flex flex-col mt-8 space-y-4">
          {visibleNavItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start font-medium",
                location.pathname === item.path 
                  ? "text-autospa-red bg-autospa-red/10" 
                  : "text-foreground hover:text-autospa-red"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </Button>
          ))}
          {isLoggedIn && (
            <Button 
              variant="ghost" 
              className="w-full justify-start mt-4 text-destructive" 
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 autospa-glass py-3 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/9e4813d3-fe57-41e4-a643-bee06a651855.png" 
            alt="AutoSpa Logo" 
            className="h-12 object-contain mr-4"
          />
          {isLoggedIn && !isMobile && renderNavigation()}
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              {isMobile ? (
                renderMobileNavigation()
              ) : (
                <Button 
                  variant="ghost" 
                  className="text-destructive" 
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
              <div className="badge-chip ml-2">
                {isAdmin ? "Admin" : "User"}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
