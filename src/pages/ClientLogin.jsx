import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const response = await base44.functions.invoke('loginClient', {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('clientAuth', JSON.stringify(response.data.client));
        window.location.href = createPageUrl('ClientDashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698235382c78cdec3bacea2f/06a1de1f9_DesignTransparentbackground-02.png" 
              alt="Logo" 
              className="h-24 w-auto"
            />
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-[#e8e6de]/50">
            <h1 className="text-3xl font-bold text-[#2d3319] mb-2">Client Login</h1>
            <p className="text-[#6b7055] mb-8">Sign in to your business account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

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
                    placeholder="you@example.com"
                    className="pl-12 h-11 rounded-xl border-[#e8e6de] focus:border-[#a8b88c] focus:ring-[#a8b88c]"
                    required
                  />
                </div>
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
                    className="pl-12 h-11 rounded-xl border-[#e8e6de] focus:border-[#a8b88c] focus:ring-[#a8b88c]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#7a8a5e] to-[#6d7d51] hover:from-[#6d7d51] hover:to-[#5f6f43] text-white rounded-xl font-medium"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-[#6b7055] text-center">
                Don't have an account?{' '}
                <button
                  onClick={() => window.location.href = createPageUrl('ClientSignup')}
                  className="text-[#7a8a5e] hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
              <button
                onClick={() => window.location.href = createPageUrl('Welcome')}
                className="w-full text-sm text-[#7a8a5e] hover:underline"
              >
                ← Back to role selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}