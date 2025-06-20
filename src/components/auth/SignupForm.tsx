
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Film, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onToggleMode: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, username);
      // The signup function handles navigation via window.location.href
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-black/40 backdrop-blur-md p-8 rounded-lg border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Film className="h-8 w-8 text-purple-400 mr-2" />
          <span className="text-2xl font-bold text-white">FlickPick</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
