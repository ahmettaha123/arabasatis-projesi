'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, Car, Heart, MessageCircle, BarChart, 
  Mail, Calendar, DollarSign, Eye, Edit, Trash, ChevronRight,
  AlertTriangle, CheckCircle, PlusCircle, Settings, Home, UserCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface DashboardStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

interface AracOzet {
  id: string;
  baslik: string;
  fiyat: number;
  goruntuleme: number;
  favori_sayisi: number;
  created_at: string;
  ana_resim_url?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ozet');
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [araclarim, setAraclarim] = useState<AracOzet[]>([]);
  const [favorilerim, setFavorilerim] = useState<number>(0);
  const [mesajlarim, setMesajlarim] = useState<{ okunmamis: number, toplam: number }>({ okunmamis: 0, toplam: 0 });
  const [yorumlarim, setYorumlarim] = useState<number>(0);
  const [ilanSilmeLoading, setIlanSilmeLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Kullanıcı kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Lütfen giriş yapın');
          router.push('/giris?redirect=/dashboard');
          return;
        }
        
        setUser(user);
        
        // Profil bilgilerini al
        const { data: profileData } = await supabase
          .from('profiller')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setProfile(profileData);
        
        // Ana dashboard verilerini yükle
        await loadDashboardData(user.id);
        
      } catch (error) {
        console.error('Dashboard veri yüklerken hata:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const loadDashboardData = async (userId: string) => {
    try {
      console.log('Dashboard verileri yükleniyor için userId:', userId);
      
      // İlanlarım bilgisi - Güncellenmiş kolon isimleriyle
      const { data: araclar, error: araclarError } = await supabase
        .from('arabalar')
        .select('id, baslik, fiyat, goruntuleme, created_at')
        .eq('sahibi', userId)
        .order('created_at', { ascending: false });
      
      if (araclarError) {
        console.error('Araçlar sorgu hatası:', araclarError);
        throw araclarError;
      }
      
      console.log('Araçlar verileri çekildi, sayı:', araclar?.length || 0);
      
      // Favorileri say - kullanici_id doğru kolon
      const { count: favoriCount, error: favoriError } = await supabase
        .from('favoriler')
        .select('id', { count: 'exact', head: true })
        .eq('kullanici_id', userId);
      
      if (favoriError) {
        console.error('Favoriler sorgu hatası:', favoriError);
      } else {
        console.log('Favori sayısı:', favoriCount || 0);
        setFavorilerim(favoriCount || 0);
      }
      
      // İlanların ana resimlerini ve favori sayılarını al
      const araclarWithDetails = await Promise.all(
        (araclar || []).map(async (arac) => {
          try {
            // Ana resmi bul
            const { data: resim, error: resimError } = await supabase
              .from('resimler')
              .select('url')
              .eq('araba_id', arac.id)
              .eq('ana_resim', true)
              .maybeSingle();
            
            if (resimError) {
              console.error(`Resim sorgu hatası (${arac.id}):`, resimError);
            }
            
            // Favori sayısını al
            const { count: favoriSayisi, error: favoriSayisiError } = await supabase
              .from('favoriler')
              .select('id', { count: 'exact', head: true })
              .eq('araba_id', arac.id);
            
            if (favoriSayisiError) {
              console.error(`Favori sayısı sorgu hatası (${arac.id}):`, favoriSayisiError);
            }
            
            return {
              ...arac,
              ana_resim_url: resim?.url || null,
              favori_sayisi: favoriSayisi || 0,
              goruntuleme: arac.goruntuleme || 0
            };
          } catch (error) {
            console.error(`Araç detayları alınırken hata (${arac.id}):`, error);
            return {
              ...arac,
              ana_resim_url: null,
              favori_sayisi: 0,
              goruntuleme: arac.goruntuleme || 0
            };
          }
        })
      );
      
      setAraclarim(araclarWithDetails);
      
      // İstatistikler
      setStats([
        {
          title: 'İlanlarım',
          value: araclarWithDetails.length,
          icon: <Car className="h-5 w-5" />,
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
        },
        {
          title: 'Favorilerim',
          value: favoriCount || 0,
          icon: <Heart className="h-5 w-5" />,
          color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
        },
        {
          title: 'Toplam Görüntülenme',
          value: araclarWithDetails.reduce((sum, arac) => sum + (arac.goruntuleme || 0), 0),
          icon: <Eye className="h-5 w-5" />,
          color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
        },
        {
          title: 'Toplam Değer',
          value: formatCurrency(araclarWithDetails.reduce((sum, arac) => sum + arac.fiyat, 0)),
          icon: <DollarSign className="h-5 w-5" />,
          color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'
        }
      ]);
      
      console.log("Dashboard verileri yüklendi");
      
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    }
  };

  const handleIlanSil = async (ilanId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setIlanSilmeLoading(ilanId);
      
      // Önce resimlerini sil
      const { data: resimler } = await supabase
        .from('resimler')
        .select('id')
        .eq('araba_id', ilanId);
      
      if (resimler && resimler.length > 0) {
        await supabase
          .from('resimler')
          .delete()
          .eq('araba_id', ilanId);
      }
      
      // Favorileri sil
      await supabase
        .from('favoriler')
        .delete()
        .eq('araba_id', ilanId);
      
      // Sonra ilanı sil
      const { error } = await supabase
        .from('arabalar')
        .delete()
        .eq('id', ilanId);
      
      if (error) throw error;
      
      // Arayüzü güncelle
      setAraclarim(araclarim.filter(arac => arac.id !== ilanId));
      toast.success('İlan başarıyla silindi');
      
    } catch (error) {
      console.error('İlan silinirken hata:', error);
      toast.error('İlan silinirken bir hata oluştu');
    } finally {
      setIlanSilmeLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center border border-slate-100 dark:border-slate-700">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Giriş Yapılmadı</h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
          <Link
            href="/giris?redirect=/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition-colors inline-block dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Sol Sidebar - Geliştirilmiş Tasarım */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden mb-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 dark:from-blue-700 dark:to-indigo-900 p-6 text-white relative overflow-hidden">
              {/* Dekoratif şekiller */}
              <div className="absolute top-0 right-0 opacity-20">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="absolute -bottom-6 -left-6 opacity-10">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="text-white">
                  <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              
              <div className="flex items-center mb-4 relative z-10">
                {profile?.resim_url ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 blur-sm opacity-70 animate-pulse"></div>
                    <Image
                      src={profile.resim_url}
                      alt={profile.ad_soyad || 'Kullanıcı'}
                      width={56}
                      height={56}
                      className="rounded-full border-2 border-white mr-4 h-14 w-14 object-cover relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mr-4 shadow-inner">
                    <UserCircle className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{profile?.ad_soyad || 'Kullanıcı'}</h3>
                  <p className="text-blue-100 text-sm">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-1.5">
                <Link 
                  href="/dashboard" 
                  className={`flex items-center px-3 py-2.5 rounded-lg ${
                    activeTab === 'ozet' 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-indigo-900/20 dark:text-blue-300 shadow-sm' 
                      : 'hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-700/50 dark:text-slate-300'
                  } transition-all duration-300`}
                >
                  <Home className="h-4 w-4 mr-3" />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  href="/hesap" 
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-700/50 dark:text-slate-300 transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-3" />
                  <span>Hesap Bilgilerim</span>
                </Link>
                
                <button 
                  onClick={() => setActiveTab('ilanlarim')}
                  className={`flex w-full items-center px-3 py-2.5 rounded-lg ${
                    activeTab === 'ilanlarim' 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-indigo-900/20 dark:text-blue-300 shadow-sm' 
                      : 'hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-700/50 dark:text-slate-300'
                  } transition-all duration-300`}
                >
                  <Car className="h-4 w-4 mr-3" />
                  <span>İlanlarım</span>
                </button>
                
                <Link 
                  href="/hesap/favoriler" 
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-700/50 dark:text-slate-300 transition-all duration-300"
                >
                  <Heart className="h-4 w-4 mr-3" />
                  <span>Favorilerim</span>
                </Link>
              </div>
              
              <div className="my-4 border-t border-slate-200 dark:border-slate-700/70"></div>
              
              <Link
                href="/ilan-ver"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 w-full transition-all shadow-md hover:shadow-lg"
              >
                <PlusCircle className="h-4 w-4" />
                Yeni İlan Ver
              </Link>
            </div>
          </div>
        </div>
        
        {/* Ana İçerik - Geliştirilmiş Tasarım */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Hesabınızla ilgili özet bilgileri görüntüleyin ve ilanlarınızı yönetin.</p>
          </div>
          
          {/* İstatistik Kartları - Geliştirilmiş Animasyonlu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-md p-5 border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-lg hover:translate-y-[-5px] group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</h3>
                    <p className="text-xl font-bold text-slate-800 dark:text-white animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Ana İçerik Kartı - Geliştirilmiş Tasarım */}
          <div className="bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden mb-8 border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all">
            <div className="flex border-b border-slate-200 dark:border-slate-700/70">
              <button
                onClick={() => setActiveTab('ozet')}
                className={`px-6 py-4 font-medium relative ${
                  activeTab === 'ozet' 
                    ? 'text-blue-600 dark:text-blue-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                } transition-colors`}
              >
                Özet
                {activeTab === 'ozet' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('ilanlarim')}
                className={`px-6 py-4 font-medium relative ${
                  activeTab === 'ilanlarim' 
                    ? 'text-blue-600 dark:text-blue-300' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                } transition-colors`}
              >
                İlanlarım
                {activeTab === 'ilanlarim' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500"></span>
                )}
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'ozet' && (
                <div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Hızlı Erişim</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-animation">
                      <Link
                        href="/ilan-ver"
                        className="p-4 border border-slate-200 dark:border-slate-700/70 rounded-lg flex items-center group hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/40 dark:to-indigo-800/40 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <PlusCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-white">Yeni İlan Ekle</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Yeni bir araç satışa çıkar</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/hesap"
                        className="p-4 border border-slate-200 dark:border-slate-700/70 rounded-lg flex items-center group hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/40 dark:to-pink-800/40 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-white">Profil Bilgilerim</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Kişisel bilgilerini düzenle</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/hesap/favoriler"
                        className="p-4 border border-slate-200 dark:border-slate-700/70 rounded-lg flex items-center group hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-800/40 dark:to-pink-800/40 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-white">Favorilerim</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Favori ilanlarını görüntüle</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  {araclarim.length > 0 ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                          <Car className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                          Son İlanlarım
                        </h3>
                        <button 
                          onClick={() => setActiveTab('ilanlarim')}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center group"
                        >
                          Tümünü Gör
                          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-animation">
                        {araclarim.slice(0, 4).map((arac) => (
                          <div key={arac.id} className="flex border border-slate-200 dark:border-slate-700/70 rounded-lg overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 flex-shrink-0 relative overflow-hidden">
                              {arac.ana_resim_url ? (
                                <Image
                                  src={arac.ana_resim_url}
                                  alt={arac.baslik}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                                  <Car className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-3">
                              <Link 
                                href={`/araclar/${arac.id}`}
                                className="font-medium text-slate-800 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                              >
                                {arac.baslik}
                              </Link>
                              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-1">
                                {formatCurrency(arac.fiyat)}
                              </p>
                              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center mr-3">
                                  <Eye className="h-3 w-3 mr-1 text-slate-400 dark:text-slate-500" />
                                  {arac.goruntuleme || 0}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="h-3 w-3 mr-1 text-red-500 dark:text-red-400" />
                                  {arac.favori_sayisi}
                                </span>
                                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                  <Link href={`/ilan-duzenle/${arac.id}`} className="text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400">
                                    <Edit className="h-3.5 w-3.5" />
                                  </Link>
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleIlanSil(arac.id);
                                    }}
                                    disabled={ilanSilmeLoading === arac.id}
                                    className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                                  >
                                    {ilanSilmeLoading === arac.id ? (
                                      <div className="h-3.5 w-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                    ) : (
                                      <Trash className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-6 text-center border border-blue-100 dark:border-blue-900/30">
                      <Car className="h-12 w-12 text-blue-500 dark:text-blue-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Henüz İlanınız Yok</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">Araç satmak için hemen ilk ilanınızı oluşturun.</p>
                      <Link
                        href="/ilan-ver"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-600 dark:hover:from-blue-600 dark:hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        İlan Oluştur
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'ilanlarim' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">İlanlarım</h3>
                    <Link
                      href="/ilan-ver"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium inline-flex items-center dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Yeni İlan Ekle
                    </Link>
                  </div>
                  
                  {araclarim.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">İlan</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Fiyat</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Eklenme Tarihi</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">İstatistikler</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {araclarim.map((arac) => (
                            <tr key={arac.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                    {arac.ana_resim_url ? (
                                      <Image
                                        src={arac.ana_resim_url}
                                        alt={arac.baslik}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                                        <Car className="h-6 w-6" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <Link href={`/araclar/${arac.id}`} className="font-medium text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                      {arac.baslik}
                                    </Link>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-blue-600 dark:text-blue-400 font-medium">
                                {formatCurrency(arac.fiyat)}
                              </td>
                              <td className="px-4 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                {formatDate(arac.created_at)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                  <span className="flex items-center mr-4">
                                    <Eye className="h-4 w-4 mr-1 text-slate-400 dark:text-slate-500" />
                                    {arac.goruntuleme || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-4 w-4 mr-1 text-red-400" />
                                    {arac.favori_sayisi}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Link
                                    href={`/araclar/${arac.id}`}
                                    className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                    title="Görüntüle"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  
                                  <Link
                                    href={`/ilan-duzenle/${arac.id}`}
                                    className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                    title="Düzenle"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  
                                  <button
                                    onClick={() => handleIlanSil(arac.id)}
                                    disabled={ilanSilmeLoading === arac.id}
                                    className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 disabled:opacity-50"
                                    title="Sil"
                                  >
                                    {ilanSilmeLoading === arac.id ? (
                                      <div className="h-4 w-4 border-2 border-red-600 dark:border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Trash className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center border border-blue-100 dark:border-blue-800">
                      <Car className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Henüz İlanınız Yok</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">Araç satmak için hemen ilk ilanınızı oluşturun.</p>
                      <Link
                        href="/ilan-ver"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium inline-flex items-center dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        İlan Ver
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 