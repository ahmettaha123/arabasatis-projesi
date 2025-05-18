'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUserPlus } from 'react-icons/fa';
import { User, Mail, LockKeyhole, AlertCircle, CheckCircle, Shield, Car, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function KayitSayfasi() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Sayfa yüklendiğinde oturum kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Şifre gücünü değerlendir
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Uzunluk kontrolü
    if (password.length >= 8) strength += 1;
    
    // Karakter çeşitliliği
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!terms) {
      setError('Devam etmek için kullanım koşullarını kabul etmelisiniz');
      toast.error('Kullanım koşullarını kabul etmelisiniz');
      return;
    }
    
    // Şifre doğrulama kontrolü
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor');
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    // Şifre gücü kontrolü
    if (passwordStrength < 3) {
      setError('Lütfen daha güçlü bir şifre belirleyin (büyük harf, rakam ve özel karakter içermeli)');
      toast.error('Daha güçlü bir şifre gerekli');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/onay`
        },
      });
      
      if (signUpError) {
        if (signUpError.message.includes('email')) {
          throw new Error('Bu e-posta adresi zaten kullanılıyor veya geçersiz.');
        } else if (signUpError.message.includes('password')) {
          throw new Error('Şifre kriterleri karşılanmıyor. En az 6 karakter olmalı.');
        } else {
          throw signUpError;
        }
      }
      
      if (data?.user) {
        // Profil bilgilerini ekle
        const { error: profileError } = await supabase
          .from('profiller')
          .insert({
            id: data.user.id,
            ad_soyad: name,
            email: email,
            telefon: '',
            adres: '',
            resim_url: ''
          });
        
        if (profileError) {
          console.error('Profil oluşturma hatası:', profileError);
          // Profil oluşturma hatası user experience'ı bozmaz
        }
        
        toast.success('Kayıt başarılı! Lütfen e-posta adresinize gelen doğrulama bağlantısına tıklayın.');
        router.push('/giris?registered=true');
      }
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Kayıt olurken bir hata oluştu');
      toast.error(err.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklenirken auth kontrolü yapılıyorsa yükleme göster
  if (checkingAuth) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Car className="text-white text-2xl" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-white">Yeni Hesap Oluşturun</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">ArabaSatis'e üye olarak araç alım-satım işlemlerinizi kolayca yapabilirsiniz</p>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative mb-6 flex items-start">
              <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0 h-5 w-5" />
              <span className="block">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-slate-400 dark:text-slate-500 h-5 w-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input pl-10"
                  placeholder="Ad Soyad"
                />
              </div>
            </div>
            
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
                  className="input pl-10"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input pl-10 pr-10"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="text-slate-400 dark:text-slate-500 h-5 w-5" /> : 
                    <Eye className="text-slate-400 dark:text-slate-500 h-5 w-5" />
                  }
                </button>
              </div>
              
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === 0 ? 'bg-red-500 w-[10%]' : 
                        passwordStrength === 1 ? 'bg-red-500 w-[25%]' : 
                        passwordStrength === 2 ? 'bg-yellow-500 w-[50%]' : 
                        passwordStrength === 3 ? 'bg-green-500 w-[75%]' : 
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <div className="flex items-center mt-1.5">
                    <Shield className={`h-3.5 w-3.5 mr-1.5 ${
                      passwordStrength < 2 ? 'text-red-500' :
                      passwordStrength === 2 ? 'text-yellow-500' : 
                      'text-green-500'
                    }`} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {passwordStrength < 2 && 'Zayıf şifre - Büyük/küçük harf, rakam ve özel karakter ekleyin'}
                      {passwordStrength === 2 && 'Orta güçte şifre - Daha güçlü bir şifre için özel karakter ekleyin'}
                      {passwordStrength > 2 && 'Güçlü şifre - Harika iş!'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockKeyhole className="text-slate-400 dark:text-slate-500 h-5 w-5" />
                </div>
                <input
                  id="passwordConfirm"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="input pl-10"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
              {passwordConfirm && password !== passwordConfirm && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  Şifreler eşleşmiyor
                </p>
              )}
              {passwordConfirm && password === passwordConfirm && passwordConfirm.length > 0 && (
                <p className="mt-1.5 text-xs text-green-500 flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Şifreler eşleşiyor
                </p>
              )}
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                />
              </div>
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                <span>
                  <Link href="/kullanim-kosullari" className="text-blue-600 dark:text-blue-400 hover:underline">Kullanım Koşullarını</Link>{' '}
                  ve{' '}
                  <Link href="/gizlilik-politikasi" className="text-blue-600 dark:text-blue-400 hover:underline">Gizlilik Politikasını</Link>{' '}
                  okudum ve kabul ediyorum.
                </span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Kayıt Yapılıyor...
                </>
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </form>
          
          <div className="my-6 relative flex items-center justify-center">
            <div className="border-t w-full border-slate-200 dark:border-slate-700"></div>
            <span className="absolute bg-white dark:bg-slate-800 px-2 text-xs text-slate-500 dark:text-slate-400">VEYA</span>
          </div>
          
          <div className="mb-4">
            <button className="w-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg p-2.5 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5 text-slate-700 dark:text-slate-300">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile devam et
            </button>
          </div>
          
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/giris" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 