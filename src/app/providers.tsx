'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/context/UserContext';
import { UIProvider } from '@/context/UIContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // hydration için render etme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UIProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </UIProvider>
    </ThemeProvider>
  );
} 