import React from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function Welcome() {
    const [isAdmin, setIsAdmin] = React.useState(null);

    React.useEffect(() => {
      const checkAuth = async () => {
        try {
          const user = await base44.auth.me();
          if (user?.role === 'admin') {
            setIsAdmin(true);
            // Redirect admin to dashboard
            window.location.href = createPageUrl('Dashboard');
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      };
      checkAuth();
    }, []);

    if (isAdmin === null) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f3ed]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a8b88c]"></div>
        </div>
      );
    }

    const handleRoleSelect = (role) => {
      localStorage.setItem('selectedRole', role);
      if (role === 'employee') {
        window.location.href = createPageUrl('EmployeeLogin');
      } else {
        window.location.href = createPageUrl('ClientLogin');
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ed] via-[#ebe9dd] to-[#f5f3ed] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#d4e0b3] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-[#a8b88c] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#c8d4a8] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698235382c78cdec3bacea2f/06a1de1f9_DesignTransparentbackground-02.png" 
              alt="Logo" 
              className="h-28 md:h-36 w-auto"
            />
          </div>

          {/* Main Content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#a8b88c]/20 to-[#8a9a6e]/20 px-6 py-3 rounded-full mb-6 border border-[#a8b88c]/30">
              <div className="w-2 h-2 bg-[#a8b88c] rounded-full animate-pulse" />
              <span className="text-sm font-bold text-[#7a8a5e] uppercase tracking-wider">Welcome</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-[#2d3319] mb-4 leading-tight">
              Welcome to Kailahil
            </h1>
            <p className="text-xl text-[#6b7055] max-w-2xl mx-auto">
              Choose how you're signing in
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Kailahil Employee */}
            <button
              onClick={() => handleRoleSelect('employee')}
              className="group text-left"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem_2.5rem_2.5rem_1rem] p-8 shadow-xl border border-[#e8e6de]/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-48 h-48 bg-[#7a8a5e]/5 rounded-full -ml-24 -mt-24" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-gradient-to-br from-[#7a8a5e] to-[#6d7d51] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[#2d3319] mb-2">Kailahil Employee</h2>
                  <p className="text-[#6b7055] mb-6 leading-relaxed">
                    Staff, media specialists, admins
                  </p>
                  
                  <div className="flex items-center gap-2 text-[#7a8a5e] font-bold group-hover:gap-3 transition-all">
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </button>

            {/* Business Client */}
            <button
              onClick={() => handleRoleSelect('client')}
              className="group text-left"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem_2.5rem_2.5rem_1rem] p-8 shadow-xl border border-[#e8e6de]/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#a8b88c]/5 rounded-full -mr-24 -mt-24" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-gradient-to-br from-[#a8b88c] to-[#7a8a5e] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[#2d3319] mb-2">Client</h2>
                  <p className="text-[#6b7055] mb-6 leading-relaxed">
                    Business owners & stakeholders
                  </p>
                  
                  <div className="flex items-center gap-2 text-[#7a8a5e] font-bold group-hover:gap-3 transition-all">
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-sm text-[#9ca38a]">
              Need help? Contact support at{' '}
              <a href="mailto:support@kailahil.com" className="text-[#7a8a5e] hover:underline font-medium">
                support@kailahil.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}