'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Car, LockKeyhole, Mail, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function GirisSayfasi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const registeredParam = searchParams.get('registered');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Sayfa yüklendiğinde kullanıcı zaten oturum açmış mı kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Kullanıcı zaten giriş yapmışsa, redirect parametresi veya dashboard'a yönlendir
          router.push(redirect);
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Başarıyla giriş yapıldı!');
      
      // Başarılı girişten sonra dashboard sayfasına yönlendir
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      console.error('Giriş hatası:', err);
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (err.message.includes('Invalid login')) {
        errorMessage = 'E-posta veya şifre hatalı';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'Lütfen önce e-posta adresinizi doğrulayın';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          skipBrowserRedirect: false
        }
      });
      
      if (error) throw error;
      
      // Google yönlendiriyor, hata kontrolü yapmaya gerek yok
    } catch (err: any) {
      console.error('Google giriş hatası:', err);
      toast.error('Google ile giriş yapılırken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      setGoogleLoading(false);
    }
  };

  // Sayfa yüklenirken auth kontrolü yapılıyorsa yükleme göster
  if (checkingAuth) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 fade-in border border-slate-100 dark:border-slate-700">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 rounded-full flex items-center justify-center shadow-md">
              <Car className="text-white text-2xl" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-white">Hesabınıza Giriş Yapın</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Araç satışları ve alımları için ArabaSatis'e hoş geldiniz</p>
          
          {registeredParam === 'true' && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg relative mb-6 flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0 h-5 w-5" />
              <span className="block">Kayıt işlemi başarılı! Lütfen e-posta adresinize gelen doğrulama bağlantısına tıklayın.</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative mb-6 flex items-start">
              <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0 h-5 w-5" />
              <span className="block">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-slate-400 dark:text-slate-500 h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockKeyhole className="text-slate-400 dark:text-slate-500 h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Beni Hatırla
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="/sifremi-unuttum" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Giriş Yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="my-6 relative flex items-center justify-center">
            <div className="border-t w-full border-slate-200 dark:border-slate-700"></div>
            <span className="absolute bg-white dark:bg-slate-800 px-2 text-xs text-slate-500 dark:text-slate-400">VEYA</span>
          </div>
          
          <div className="mb-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-2 transition-all"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {googleLoading ? "Bağlanıyor..." : "Google ile devam et"}
            </button>
          </div>
          
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Hemen Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 