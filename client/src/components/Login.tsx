
import { useState } from 'react';
import { Car, User, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface LoginProps {
  onLogin: (userData: { id: number; email: string; username: string; points: number }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userData = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      onLogin(userData);
      toast({
        title: "Welcome back!",
        description: `Logged in successfully. You have ${userData.points} points!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userData = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password, points: 100 }),
      });
      
      onLogin(userData);
      toast({
        title: "Account created!",
        description: `Welcome to Fairfare! You start with ${userData.points} points.`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "User might already exist. Try logging in instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-2xl">
              <Car className="h-12 w-12 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Fairfare
            </span>
          </h1>
          <p className="text-gray-300">Compare cab prices, save money</p>
        </div>

        {/* Auth Form */}
        <Card className="bg-black border-yellow-500 shadow-2xl">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-white text-center">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-300 text-center">
              {isRegistering ? "Join Fairfare today" : "Sign in to your account"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-yellow-500">Username</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-500">Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-yellow-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-yellow-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              >
                {isLoading 
                  ? (isRegistering ? "Creating account..." : "Signing in...") 
                  : (isRegistering ? "Create Account" : "Sign In")
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-yellow-500 hover:text-yellow-400 font-medium"
                >
                  {isRegistering ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
