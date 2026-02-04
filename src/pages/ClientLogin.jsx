import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, MessageSquare, FileText } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function ClientLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          // Redirect based on role
          if (user.user_role === 'client') {
            window.location.href = createPageUrl('ClientDashboard');
          } else {
            window.location.href = createPageUrl('Dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('ClientDashboard'));
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-[32rem] h-[32rem] bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-[#c8d4a8] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698235382c78cdec3bacea2f/06a1de1f9_DesignTransparentbackground-02.png" 
              alt="Logo" 
              className="h-24 md:h-32 w-auto"
            />
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[4rem_4rem_4rem_2rem] p-12 md:p-16 shadow-2xl border border-[#e8e6de]/50 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#a8b88c]/5 rounded-full -ml-32 -mt-32" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#7a8a5e]/5 rounded-full -mr-24 -mb-24" />
            
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4e0b3]/30 to-[#a8b88c]/30 px-5 py-2.5 rounded-full mb-6 border border-[#a8b88c]/30">
                <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
                <span className="text-xs font-bold text-[#7a8a5e] uppercase tracking-wider">Business Client Portal</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl font-bold text-[#2d3319] mb-4 leading-tight">
                Track Your Business Growth 📈
              </h1>
              <p className="text-lg text-[#6b7055] mb-10 leading-relaxed">
                View your performance metrics, review responses, and content pipeline all in one place.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#f5f3ed] rounded-[1.5rem_0.5rem_1.5rem_1.5rem] p-5 border border-[#e8e6de]/50">
                  <div className="w-12 h-12 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center mb-3 shadow-md">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-[#2d3319] mb-1">Performance Dashboard</h3>
                  <p className="text-xs text-[#6b7055]">Real-time insights & analytics</p>
                </div>

                <div className="bg-[#f5f3ed] rounded-[0.5rem_1.5rem_1.5rem_1.5rem] p-5 border border-[#e8e6de]/50">
                  <div className="w-12 h-12 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br from-[#8a9a6e] to-[#a8b88c] flex items-center justify-center mb-3 shadow-md">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-[#2d3319] mb-1">Review Management</h3>
                  <p className="text-xs text-[#6b7055]">See customer feedback & responses</p>
                </div>

                <div className="bg-[#f5f3ed] rounded-[1.5rem_1.5rem_0.5rem_1.5rem] p-5 border border-[#e8e6de]/50">
                  <div className="w-12 h-12 rounded-[1rem_1rem_1rem_0.3rem] bg-gradient-to-br from-[#7a8a5e] to-[#6d7d51] flex items-center justify-center mb-3 shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-[#2d3319] mb-1">Content Pipeline</h3>
                  <p className="text-xs text-[#6b7055]">Preview upcoming posts & campaigns</p>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                onClick={handleLogin}
                size="lg"
                className="w-full bg-gradient-to-r from-[#a8b88c] via-[#8a9a6e] to-[#7a8a5e] hover:from-[#8a9a6e] hover:via-[#7a8a5e] hover:to-[#6d7d51] text-white shadow-xl text-lg py-7 rounded-[2rem_2rem_2rem_0.5rem] font-bold group"
              >
                <span>Access Your Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Media Specialist Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-[#9ca38a] mb-2">Media Specialist?</p>
                <a 
                  href={createPageUrl('MediaLogin')}
                  className="text-sm font-bold text-[#7a8a5e] hover:text-[#6d7d51] underline underline-offset-4"
                >
                  Access Media Portal →
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-[#9ca38a]">
              © 2026 Social Media Management Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}