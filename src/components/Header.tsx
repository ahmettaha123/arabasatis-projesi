'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Car, PlusCircle, User, Menu, X, Search, Info, Mail, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from './ui/theme-toggle';
import { toast } from 'react-hot-toast';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Kullanıcı oturum durumunu kontrol et
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    checkUser();
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Scroll durumunu izle
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${
      'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-3'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 relative group">
            <div className="absolute -inset-2 scale-0 rounded-full bg-blue-100 dark:bg-blue-900/30 transition-all duration-300 group-hover:scale-100"></div>
            <Car className="w-8 h-8 relative z-10 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold relative z-10 text-gray-900 dark:text-white">ArabaSatış</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: '/', label: 'Ana Sayfa', icon: Home },
              { href: '/araclar', label: 'Araçlar', icon: Car },
              { href: '/ilan-ver', label: 'İlan Ver', icon: PlusCircle },
              { href: '/hakkimizda', label: 'Hakkımızda', icon: Info },
              { href: '/iletisim', label: 'İletişim', icon: Mail }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium group text-gray-700 dark:text-gray-300 flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Auth, Theme toggle & Mobile menu button */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {!loading && !user && (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Link 
                  href="/giris"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Giriş Yap</span>
                </Link>
                <Link 
                  href="/kayit"
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>Kayıt Ol</span>
                </Link>
              </div>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              {[
                { href: '/', label: 'Ana Sayfa', icon: Home },
                { href: '/araclar', label: 'Araçlar', icon: Car },
                { href: '/ilan-ver', label: 'İlan Ver', icon: PlusCircle },
                { href: '/hakkimizda', label: 'Hakkımızda', icon: Info },
                { href: '/iletisim', label: 'İletişim', icon: Mail }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              
              {!user && (
                <div className="flex flex-col gap-2 mt-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Link
                    href="/giris" 
                    className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg"
                  >
                    <LogIn className="h-4 w-4" />
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit"
                    className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium bg-primary text-white rounded-lg"
                  >
                    <User className="h-4 w-4" />
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 