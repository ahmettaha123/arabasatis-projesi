'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Home, Heart, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

export function FloatingNav() {
  const pathname = usePathname();
  const { showFloatingNav, animations } = useUI();
  const [visible, setVisible] = useState(false);
  
  // Gösterme/gizleme animasyonu için gecikme ekle
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(showFloatingNav);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [showFloatingNav]);

  // Animasyonlar kapalıysa gösterme
  if (animations.reducedMotion) {
    return null;
  }

  const navItems = [
    {
      name: "Ana Sayfa",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Araçlar",
      href: "/araclar",
      icon: <Car className="h-5 w-5" />,
    },
    {
      name: "İlan Ver",
      href: "/ilan-ver",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      name: "Favoriler",
      href: "/favoriler",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      name: "Hesap",
      href: "/hesap",
      icon: <User className="h-5 w-5" />,
    }
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.2 }}
          className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <motion.div 
            className="flex items-center bg-background/80 backdrop-blur-lg shadow-lg rounded-full px-3 py-1.5 border border-border pointer-events-auto"
            layoutId="floatingNav"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 relative",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.div>
                
                <span className="text-[10px] mt-0.5 font-medium opacity-80">
                  {item.name}
                </span>
                
                {pathname === item.href && (
                  <motion.div
                    layoutId="floatingNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 