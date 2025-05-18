'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type AnimationPreferences = {
  reducedMotion: boolean;
  pageTransitions: boolean;
  enableParticles: boolean;
  useHeavyAnimations: boolean;
};

type UIContextType = {
  isNavigating: boolean;
  previousPath: string | null;
  showFloatingNav: boolean;
  animations: AnimationPreferences;
  toggleReducedMotion: () => void;
  togglePageTransitions: () => void;
  toggleParticles: () => void;
  toggleHeavyAnimations: () => void;
  setIsNavigating: (value: boolean) => void;
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [animations, setAnimations] = useState<AnimationPreferences>(() => {
    // Tarayıcıda çalışıyorsa localStorage'den tercihleri al
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('animation-preferences');
      if (savedPrefs) {
        return JSON.parse(savedPrefs);
      }
    }
    
    return {
      reducedMotion: false,
      pageTransitions: true,
      enableParticles: true,
      useHeavyAnimations: true
    };
  });

  // Sayfa değişikliklerini izle
  useEffect(() => {
    setPreviousPath(pathname);
    setIsNavigating(false);
  }, [pathname]);

  // Scroll pozisyonunu izle
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Kullanıcı 300px'den fazla aşağı kaydırdığında floating nav'ı göster
      setShowFloatingNav(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Animasyon tercihlerini kaydet
  useEffect(() => {
    localStorage.setItem('animation-preferences', JSON.stringify(animations));
  }, [animations]);

  // Reduced motion için medya sorgusunu izle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setAnimations(prev => ({
        ...prev,
        reducedMotion: e.matches
      }));
    };
    
    // İlk değeri ayarla
    setAnimations(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches
    }));
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleReducedMotion = () => {
    setAnimations(prev => ({
      ...prev,
      reducedMotion: !prev.reducedMotion
    }));
  };

  const togglePageTransitions = () => {
    setAnimations(prev => ({
      ...prev,
      pageTransitions: !prev.pageTransitions
    }));
  };

  const toggleParticles = () => {
    setAnimations(prev => ({
      ...prev,
      enableParticles: !prev.enableParticles
    }));
  };

  const toggleHeavyAnimations = () => {
    setAnimations(prev => ({
      ...prev,
      useHeavyAnimations: !prev.useHeavyAnimations
    }));
  };

  return (
    <UIContext.Provider value={{
      isNavigating,
      previousPath,
      showFloatingNav,
      animations,
      toggleReducedMotion,
      togglePageTransitions,
      toggleParticles,
      toggleHeavyAnimations,
      setIsNavigating,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI hook must be used within a UIProvider');
  }
  return context;
}; 