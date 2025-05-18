"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, User, LogOut, Settings, Home, Heart, MessageCircle, PlusCircle, Info, Mail, Menu } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useUI } from "@/context/UIContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useUser();
  const { animations, setIsNavigating } = useUI();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Dışarı tıklanınca menüleri kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current && 
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sayfa değişiminde menüleri kapat
  useEffect(() => {
    setIsMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Çıkış yap
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  // Sayfa geçişlerinde animasyon için
  const handleNavigate = () => {
    setIsNavigating(true);
  };

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
      name: "Hakkımızda",
      href: "/hakkimizda",
      icon: <Info className="h-5 w-5" />,
    },
    {
      name: "İletişim",
      href: "/iletisim",
      icon: <Mail className="h-5 w-5" />,
    }
  ];

  // Animasyon ayarları 
  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: animations.reducedMotion ? "tween" : "spring",
        stiffness: animations.reducedMotion ? undefined : 350,
        damping: animations.reducedMotion ? undefined : 25
      }
    }
  };

  return (
    <motion.nav 
      className="sticky top-0 z-50 bg-background/80 shadow-sm backdrop-blur-lg h-16 border-b transition-all duration-300"
      initial="hidden"
      animate="visible"
      variants={animations.reducedMotion ? {} : navVariants}
    >
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 group" onClick={handleNavigate}>
            <motion.div
              whileHover={animations.reducedMotion ? {} : { scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Car className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-bold text-xl group-hover:text-primary transition-colors duration-200">ArabaSatış</span>
          </Link>
          
          {/* Masaüstü Menü */}
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <motion.div key={item.href} variants={animations.reducedMotion ? {} : itemVariants}>
                <Link
                  href={item.href}
                  onClick={handleNavigate}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 relative group ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <motion.span 
                    className={cn("transition-colors duration-200", pathname === item.href && 'text-primary')}
                    whileHover={animations.reducedMotion ? {} : { y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="group-hover:text-primary transition-colors">{item.name}</span>
                  {pathname === item.href && (
                    <motion.span 
                      className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full" 
                      layoutId={animations.reducedMotion ? undefined : "activeNavIndicator"}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tema değiştirici */}
          <ThemeToggle />
          
          {/* Favoriler butonu */}
          <Link
            href="/favoriler"
            onClick={handleNavigate}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors duration-200"
          >
            <motion.div 
              whileHover={animations.reducedMotion ? {} : { scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Heart className="h-5 w-5" />
            </motion.div>
            <span className="hidden lg:inline-block">Favoriler</span>
          </Link>
          
          {/* Kullanıcı Menüsü */}
          {!loading && user && (
            <div className="relative group flex items-center">
              <motion.button 
                ref={menuButtonRef}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={animations.reducedMotion ? {} : { scale: 1.03 }}
                whileTap={animations.reducedMotion ? {} : { scale: 0.97 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline-block">Hesabım</span>
              </motion.button>
              
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    ref={menuRef} 
                    className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-background shadow-xl py-1 ring-1 ring-black/5 dark:ring-white/10 z-50"
                    initial={animations.reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    animate={animations.reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={animations.reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/hesap" 
                        onClick={handleNavigate}
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted transition-colors group"
                      >
                        <User className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">Profilim</span>
                      </Link>
                      <Link 
                        href="/dashboard" 
                        onClick={handleNavigate}
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted transition-colors group"
                      >
                        <Settings className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">Dashboard</span>
                      </Link>
                      <Link 
                        href="/ilanlarim" 
                        onClick={handleNavigate}
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted transition-colors group"
                      >
                        <Car className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">İlanlarım</span>
                      </Link>
                      <Link 
                        href="/favoriler" 
                        onClick={handleNavigate}
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted transition-colors group"
                      >
                        <Heart className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">Favorilerim</span>
                      </Link>
                      <Link 
                        href="/mesajlar" 
                        onClick={handleNavigate}
                        className="flex items-center px-4 py-2 text-sm hover:bg-muted transition-colors group"
                      >
                        <MessageCircle className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">Mesajlarım</span>
                      </Link>
                    </div>
                    <div className="py-1 border-t">
                      <button 
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Giriş/Kayıt Butonu */}
          {!loading && !user && (
            <Link
              href="/giris"
              onClick={handleNavigate}
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              <motion.div 
                whileHover={animations.reducedMotion ? {} : { scale: 1.05 }}
                whileTap={animations.reducedMotion ? {} : { scale: 0.95 }}
                className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <User className="h-4 w-4" />
              </motion.div>
              <span className="hidden sm:inline-block">Hesap</span>
            </Link>
          )}
          
          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden flex items-center justify-center p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobil Menü */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-background border-b shadow-lg"
            initial={animations.reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            animate={animations.reducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={animations.reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mx-auto py-3 px-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigate}
                  className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  } transition-colors duration-200`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {!user && !loading && (
                <Link
                  href="/giris"
                  onClick={handleNavigate}
                  className="flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Giriş / Hesap</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 