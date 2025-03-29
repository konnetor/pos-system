
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { User, LockKeyhole, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string, password: string, isAdmin: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo: User role: user/user, Admin role: admin/admin
      if ((username === 'user' && password === 'user') || 
          (username === 'admin' && password === 'admin')) {
        const isAdminUser = username === 'admin' && password === 'admin';
        setIsAdmin(isAdminUser);
        toast.success(`Welcome back, ${username}!`);
        onLogin(username, password, isAdminUser);
      } else {
        setError('Invalid username or password');
        toast.error('Login failed. Please check your credentials.');
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-scale-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the AutoSpa  system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                className="pl-10 input-focus-ring"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Demo: Use "user" or "admin"
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10 input-focus-ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Demo: Use "user" or "admin" (same as username)
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-autospa-red hover:bg-autospa-red/90 button-hover" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          By continuing, you agree to AutoSpa's Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
