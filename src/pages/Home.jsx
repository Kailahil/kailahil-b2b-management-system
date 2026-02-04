import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../components/utils';

export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = await base44.auth.me();
        
        // User is authenticated - route based on email domain
        if (user.email.endsWith('@kailahil.com')) {
          window.location.href = createPageUrl('Dashboard');
        } else {
          window.location.href = createPageUrl('ClientDashboard');
        }
      } catch (error) {
        // User is not authenticated - go to Welcome
        window.location.href = createPageUrl('Welcome');
      }
    };

    checkAuthAndRedirect();
  }, []);

  return null;
}