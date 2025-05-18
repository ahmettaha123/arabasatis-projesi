'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaUser, FaHeart, FaSearch, FaPlus, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';

interface MenuLink {
  href: string;
  label: string;
  icon: JSX.Element;
}

interface ResponsiveMenuProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function ResponsiveMenu({ darkMode = false, onToggleDarkMode }: ResponsiveMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(0);
  
  const menuLinks: MenuLink[] = [
    { href: '/', label: 'Ana Sayfa', icon: <FaSearch className="w-5 h-5" /> },
    { href: '/araclar', label: 'Araçlar', icon: <FaCar className="w-5 h-5" /> },
    { href: '/ilan-ver', label: 'İlan Ver', icon: <FaPlus className="w-5 h-5" /> },
    { href: '/favoriler', label: 'Favoriler', icon: <FaHeart className="w-5 h-5" /> },
    { href: '/profil', label: 'Profil', icon: <FaUser className="w-5 h-5" /> },
  ];

  // Sayfa scroll olduğunda header'ın görünümünü değiştir
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Ekran boyutunu izle
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Ekran genişlediğinde menüyü kapat
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    // Sayfa yüklendiğinde pencere genişliğini al
    setWindowWidth(window.innerWidth);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Menü açıkken sayfa kaydırmayı engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Menü linkleri için animasyon
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <>
      {/* Desktop Menü */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-2 bg-white dark:bg-gray-900 shadow-md'
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                Araba<span className="text-indigo-600 dark:text-indigo-400">Satış</span>
              </span>
            </Link>
            
            {/* Desktop Navigasyon */}
            <nav className="hidden md:flex items-center space-x-6">
              {menuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link flex items-center text-sm font-medium ${
                    pathname === link.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              {/* Tema Değiştirme Butonu */}
              {onToggleDarkMode && (
                <button 
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={darkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
                >
                  {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                </button>
              )}
            </nav>
            
            {/* Mobil Menü Butonu */}
            <div className="md:hidden flex items-center">
              {onToggleDarkMode && (
                <button 
                  onClick={onToggleDarkMode}
                  className="p-2 mr-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                  aria-label={darkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
                >
                  {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                </button>
              )}
              
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none"
                aria-label="Menüyü Aç/Kapat"
              >
                <FaBars className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobil Menü */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-500">
                  Araba<span className="text-indigo-600 dark:text-indigo-400">Satış</span>
                </span>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Menüyü Kapat"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="py-4"
              >
                {menuLinks.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        pathname === link.href
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                      onClick={toggleMenu}
                    >
                      <span className="mr-3 text-blue-600 dark:text-blue-500">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
              
              {/* Mobil Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <Link
                  href="/ilan-ver"
                  className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  onClick={toggleMenu}
                >
                  <FaPlus className="mr-2" />
                  Hemen İlan Ver
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobil alt navigasyon (sabit) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <nav className="flex justify-around py-2">
          {menuLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center p-2 ${
                pathname === link.href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Mobil alt navigasyon için boşluk */}
      <div className="md:hidden h-16"></div>
    </>
  );
} 