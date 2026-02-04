import React, { useEffect } from 'react';
import { createPageUrl } from '../components/utils';

export default function Home() {
  useEffect(() => {
    // Always redirect to Welcome page
    window.location.href = createPageUrl('Welcome');
  }, []);

  return null;