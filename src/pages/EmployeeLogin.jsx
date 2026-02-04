import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ArrowLeft, Mail } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function EmployeeLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user && user.email.endsWith('@kailahil.com')) {
          window.location.href = createPageUrl('Dashboard');
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    };
    checkAuth();
  }, []);

  const validateEmail = (email) => {
    return email.endsWith('@kailahil.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Only @kailahil.com email addresses are allowed for employee access');
      return;
    }

    // Redirect to Base44 authentication with next URL
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#7a8a5e] rounded-full opacity-5 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-[#a8b88c] rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => window.location.href = createPageUrl('Welcome')}
            className="flex items-center gap-2 text-[#7a8a5e] hover:text-[#6d7d51] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portal selection</span>
          </button>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem_2.5rem_2.5rem_1rem] p-8 shadow-xl border border-[#e8e6de]/50">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-gradient-to-br from-[#7a8a5e] to-[#6d7d51] flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#2d3319] text-center mb-2">
              Employee Portal
            </h1>
            <p className="text-[#6b7055] text-center mb-8">
              Enter your @kailahil.com email to continue
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3319] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a8b88c]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@kailahil.com"
                    className="pl-12 h-12 rounded-xl border-[#e8e6de] focus:border-[#a8b88c] focus:ring-[#a8b88c]"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-[#9ca38a]">
                  Must be a @kailahil.com email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d3319] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a8b88c]" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 h-12 rounded-xl border-[#e8e6de] focus:border-[#a8b88c] focus:ring-[#a8b88c]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] hover:from-[#6d7d51] hover:to-[#5f6e47] text-white rounded-xl font-medium shadow-lg"
              >
                Continue to Sign In
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-[#9ca38a]">
              Need help? Contact IT support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}