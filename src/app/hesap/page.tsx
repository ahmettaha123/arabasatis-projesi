'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, Mail, Phone, MapPin, Edit2, Save, LogOut, Camera, Heart, 
  Car, AlertTriangle, CheckCircle, ChevronRight, ShieldCheck, Settings, Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Profile {
  id: string;
  ad_soyad: string;
  email: string;
  telefon: string;
  adres: string;
  resim_url: string;
}

export default function HesapSayfasi() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    adres: ''
  });

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Lütfen giriş yapın');
          router.push('/giris?redirect=/hesap');
          return;
        }
        
        setUser(user);
        
        // Retry mekanizması
        const fetchProfileWithRetry = async (retries = 3) => {
          try {
            // Profil bilgilerini getir
            const { data, error } = await supabase
              .from('profiller')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (error) {
              if (error.code === 'PGRST116') {
                console.log('Profil bulunamadı, yeni oluşturuluyor...');
                // Profil bulunamadı, yeni oluştur
                const { data: newProfile, error: createError } = await supabase
                  .from('profiller')
                  .insert({
                    id: user.id,
                    ad_soyad: '',
                    email: user.email,
                    telefon: '',
                    adres: '',
                    resim_url: ''
                  })
                  .select()
                  .single();
                  
                if (createError) throw createError;
                
                setProfile(newProfile);
                setFormData({
                  ad_soyad: '',
                  telefon: '',
                  adres: ''
                });
                
                toast.success('Profiliniz oluşturuldu, lütfen bilgilerinizi tamamlayın');
              } else if (retries > 0) {
                console.log(`Profil bilgileri alınamadı, ${retries} deneme kaldı.`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchProfileWithRetry(retries - 1);
              } else {
                throw error;
              }
            } else {
              setProfile(data);
              setFormData({
                ad_soyad: data.ad_soyad || '',
                telefon: data.telefon || '',
                adres: data.adres || ''
              });
            }
          } catch (retryError) {
            if (retries > 0) {
              console.log(`Hata oluştu, ${retries} deneme kaldı:`, retryError);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchProfileWithRetry(retries - 1);
            }
            throw retryError;
          }
        };
        
        await fetchProfileWithRetry();
      } catch (error) {
        console.error('Profil bilgileri alınamadı:', error);
        toast.error('Profil bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, [router]);

  // Profil resmi yükle
  const uploadProfileImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    try {
      setUploading(true);
      
      const file = event.target.files[0];
      
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('users')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('users')
        .getPublicUrl(filePath);
      
      // Profil güncelle
      const { error: updateError } = await supabase
        .from('profiller')
        .update({ resim_url: urlData.publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Profil state'ini güncelle
      setProfile(prev => prev ? { ...prev, resim_url: urlData.publicUrl } : null);
      toast.success('Profil resmi güncellendi');
      
    } catch (error) {
      console.error('Profil resmi yüklenemedi:', error);
      toast.error('Profil resmi yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Profil bilgilerini güncelle
  const updateProfile = async () => {
    try {
      if (!formData.ad_soyad.trim()) {
        toast.error('Lütfen adınızı ve soyadınızı girin');
        return;
      }
      
      const { error } = await supabase
        .from('profiller')
        .update({
          ad_soyad: formData.ad_soyad,
          telefon: formData.telefon,
          adres: formData.adres
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Profil state'ini güncelle
      setProfile(prev => prev ? { 
        ...prev, 
        ad_soyad: formData.ad_soyad,
        telefon: formData.telefon,
        adres: formData.adres
      } : null);
      
      setEditing(false);
      toast.success('Profil bilgileriniz başarıyla güncellendi');
      
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      toast.error('Profil güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Çıkış yap
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.success('Başarıyla çıkış yapıldı');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center border border-slate-100 dark:border-slate-700">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Oturum açılmamış</h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
          <Link
            href="/giris?redirect=/hesap"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mr-2">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 mx-1" />
          <span className="text-slate-800 dark:text-white font-medium">Hesap Bilgilerim</span>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="lg:flex">
            {/* Profil Sol Tarafı - Resim ve Ana Bilgiler */}
            <div className="lg:w-1/3 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white p-8">
              <div className="flex flex-col items-center">
                <div className="relative mb-6 group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white dark:border-slate-200 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    {profile.resim_url ? (
                      <Image
                        src={profile.resim_url}
                        alt={profile.ad_soyad}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <User className="text-slate-400 dark:text-slate-500 h-12 w-12" />
                      </div>
                    )}
                  </div>
                  
                  <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full p-2 cursor-pointer shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                    <Camera className="h-5 w-5" />
                    <input 
                      type="file" 
                      id="profileImage" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={uploadProfileImage}
                      disabled={uploading}
                    />
                  </label>
                </div>
                
                <h1 className="text-xl font-bold mb-2">{profile.ad_soyad}</h1>
                <p className="text-blue-100 flex items-center mb-6">
                  <Mail className="mr-2 h-4 w-4" />
                  {profile.email}
                </p>
                
                <div className="mt-6 w-full space-y-3">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-blue-700/60 hover:bg-blue-700/80 transition-colors w-full"
                  >
                    <span className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  
                  <Link 
                    href="/hesap/favoriler" 
                    className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-blue-700/60 hover:bg-blue-700/80 transition-colors w-full"
                  >
                    <span className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorilerim
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  
                  <Link 
                    href="/ilan-ver" 
                    className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-green-600/80 hover:bg-green-600 transition-colors w-full"
                  >
                    <span className="flex items-center">
                      <Car className="mr-2 h-4 w-4" />
                      Yeni İlan Ver
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors w-full mt-6"
                  >
                    <span className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Profil Sağ Tarafı - Form ve Bilgiler */}
            <div className="lg:w-2/3 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {editing ? 'Profil Bilgilerini Düzenle' : 'Profil Bilgileri'}
                </h2>
                <button
                  onClick={() => editing ? updateProfile() : setEditing(true)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    editing 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 dark:text-blue-400'
                  }`}
                >
                  {editing ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Kaydet
                    </>
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Düzenle
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="border dark:border-slate-700 rounded-lg divide-y dark:divide-slate-700">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center">
                    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <User className="h-4 w-4 mr-2" />
                        <span>Ad Soyad</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-2/3">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.ad_soyad}
                          onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Ad Soyad"
                        />
                      ) : (
                        <p className="text-slate-800 dark:text-white">{profile.ad_soyad || 'Belirtilmemiş'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center">
                    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>E-posta</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-2/3">
                      <p className="text-slate-800 dark:text-white">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center">
                    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>Telefon</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-2/3">
                      {editing ? (
                        <input
                          type="text"
                          value={formData.telefon}
                          onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Telefon numarası"
                        />
                      ) : (
                        <p className="text-slate-800 dark:text-white">{profile.telefon || 'Belirtilmemiş'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col sm:flex-row sm:items-start">
                    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Adres</span>
                      </div>
                    </div>
                    <div className="w-full sm:w-2/3">
                      {editing ? (
                        <textarea
                          value={formData.adres}
                          onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                          placeholder="Adres"
                          rows={4}
                        />
                      ) : (
                        <p className="text-slate-800 dark:text-white whitespace-pre-line">{profile.adres || 'Belirtilmemiş'}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start">
                  <ShieldCheck className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-white mb-1">Hesap Güvenliği</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirmenizi ve iki faktörlü doğrulamayı etkinleştirmenizi öneririz.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 