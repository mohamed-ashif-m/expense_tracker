import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { api } from '@/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.auth.login(loginData.username, loginData.password);
      
      if (result.success) {
        toast({
          title: "Login successful!",
          description: "Welcome back to ExpenseTracker.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.auth.register(registerData.username, registerData.email, registerData.password);
      
      if (result.success) {
        toast({
          title: "Registration successful!",
          description: "Welcome to ExpenseTracker.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium">
          <Wallet className="h-8 w-8 text-primary-foreground" />
        </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">ExpenseTracker</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </div>

      {/* Authentication Card */}
      <Card className="shadow-strong border-0 bg-card">
        <Tabs defaultValue="login" className="w-full">
        <CardHeader className="pb-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Register
          </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent>
          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-foreground">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="login-username" className="text-foreground">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
              id="login-username"
              type="text"
              placeholder="your_username"
              value={loginData.username}
              onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
              className="pl-9 bg-background border-border"
              required
              />
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="login-password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="pl-9 bg-background border-border"
              required
              />
            </div>
            </div>

            <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:bg-primary text-primary-foreground shadow-soft transition-smooth"
            disabled={isLoading}
            >
            {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-foreground">Create account</CardTitle>
            <CardDescription>Sign up to start tracking your expenses</CardDescription>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="register-username" className="text-foreground">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
              id="register-username"
              type="text"
              placeholder="your_username"
              value={registerData.username}
              onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
              className="pl-9 bg-background border-border"
              required
              />
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="register-email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
              id="register-email"
              type="email"
              placeholder="your@email.com"
              value={registerData.email}
              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
              className="pl-9 bg-background border-border"
              required
              />
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="register-password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
              className="pl-9 bg-background border-border"
              required
              />
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="register-confirm-password" className="text-foreground">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
              id="register-confirm-password"
              type="password"
              placeholder="••••••••"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="pl-9 bg-background border-border"
              required
              />
            </div>
            </div>

            <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:bg-primary text-primary-foreground shadow-soft transition-smooth"
            disabled={isLoading}
            >
            {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          </TabsContent>
        </CardContent>
        </Tabs>
      </Card>
      </div>
    </div>
  );
};

export default Login;