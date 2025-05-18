'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { animations, isNavigating, setIsNavigating } = useUI();

  // Sayfa değişimlerinde animasyon durumunu güncelle
  useEffect(() => {
    if (isNavigating) {
      // Sayfa değişim animasyonu tamamlandığında state'i güncelle
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [isNavigating, setIsNavigating]);

  // Kullanıcı animasyonları kapatmışsa veya reduced motion tercihi varsa
  if (animations.reducedMotion || !animations.pageTransitions) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          type: "spring", 
          stiffness: 350, 
          damping: 30,
          duration: 0.3
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 