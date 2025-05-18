'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUser, FaCar, FaComment, FaBell, FaEnvelope, FaTrash, 
  FaEdit, FaEye, FaCheck, FaTimes, FaChartBar,
  FaStar
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  ad_soyad: string;
  email: string;
  resim_url?: string;
  created_at: string;
}

interface Arac {
  profiller: any;
  id: string;
  baslik: string;
  fiyat: number;
  marka: string;
  model: string;
  yil: number;
  user_id: string;
  created_at: string;
  onaylandi: boolean;
}

export default function AdminPaneli() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [aracOnaylaniyor, setAracOnaylaniyor] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalReviews: 0,
    totalMessages: 0,
    recentUsers: 0,
    recentCars: 0
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Kullanıcı kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/giris?redirect=/admin');
          return;
        }
        
        setAdminUser(user);
        
        // Admin kontrolü (gerçek uygulamada roller tablosundan kontrol edilebilir)
        const { data: adminData, error: adminError } = await supabase
          .from('adminler')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (adminError || !adminData) {
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
        await loadDashboardData();
        
      } catch (error) {
        console.error('Admin kontrolü yapılırken hata:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Kullanıcı sayısı
      const { count: userCount } = await supabase
        .from('profiller')
        .select('*', { count: 'exact', head: true });
      
      // Araç sayısı
      const { count: carCount } = await supabase
        .from('arabalar')
        .select('*', { count: 'exact', head: true });
      
      // Yorum sayısı
      const { count: reviewCount } = await supabase
        .from('yorumlar')
        .select('*', { count: 'exact', head: true });
      
      // Mesaj sayısı
      const { count: messageCount } = await supabase
        .from('mesajlar')
        .select('*', { count: 'exact', head: true });
      
      // Son 7 günde eklenen kullanıcılar
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentUserCount } = await supabase
        .from('profiller')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());
      
      // Son 7 günde eklenen araçlar
      const { count: recentCarCount } = await supabase
        .from('arabalar')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());
      
      setStats({
        totalUsers: userCount || 0,
        totalCars: carCount || 0,
        totalReviews: reviewCount || 0,
        totalMessages: messageCount || 0,
        recentUsers: recentUserCount || 0,
        recentCars: recentCarCount || 0
      });
      
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiller')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const loadAraclar = async () => {
    try {
      let query = supabase
        .from('arabalar')
        .select('*, profiller!inner(ad_soyad)');
      
      if (filterStatus !== 'all') {
        query = query.eq('onaylandi', filterStatus === 'approved');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setAraclar(data || []);
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
    }
  };

  const loadYorumlar = async () => {
    try {
      const { data, error } = await supabase
        .from('yorumlar')
        .select(`
          *,
          profiller:user_id(ad_soyad),
          arabalar:arac_id(baslik)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setYorumlar(data || []);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'users':
        loadUsers();
        break;
      case 'araclar':
        loadAraclar();
        break;
      case 'yorumlar':
        loadYorumlar();
        break;
      case 'dashboard':
        loadDashboardData();
        break;
    }
  };

  const toggleAracOnayi = async (aracId: string, onaylandi: boolean) => {
    try {
      setAracOnaylaniyor(aracId);
      
      const { error } = await supabase
        .from('arabalar')
        .update({ onaylandi })
        .eq('id', aracId);
      
      if (error) throw error;
      
      // Araçları yeniden yükle
      await loadAraclar();
      
    } catch (error) {
      console.error('Araç onaylanırken hata:', error);
    } finally {
      setAracOnaylaniyor(null);
    }
  };

  const deleteYorum = async (yorumId: string) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    
    try {
      const { error } = await supabase
        .from('yorumlar')
        .delete()
        .eq('id', yorumId);
      
      if (error) throw error;
      
      // Yorumları yeniden yükle
      await loadYorumlar();
      
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Router zaten yönlendirme yapacak
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sol Menü */}
        <div className="w-64 bg-blue-800 text-white min-h-screen flex flex-col">
          <div className="p-4 border-b border-blue-700">
            <h1 className="text-xl font-bold">Admin Paneli</h1>
          </div>
          
          <nav className="flex-1 py-4">
            <button 
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center px-4 py-3 ${
                activeTab === 'dashboard' ? 'bg-blue-900' : 'hover:bg-blue-700'
              }`}
            >
              <FaChartBar className="mr-3" />
              Dashboard
            </button>
            
            <button 
              onClick={() => handleTabChange('users')}
              className={`w-full flex items-center px-4 py-3 ${
                activeTab === 'users' ? 'bg-blue-900' : 'hover:bg-blue-700'
              }`}
            >
              <FaUser className="mr-3" />
              Kullanıcılar
            </button>
            
            <button 
              onClick={() => handleTabChange('araclar')}
              className={`w-full flex items-center px-4 py-3 ${
                activeTab === 'araclar' ? 'bg-blue-900' : 'hover:bg-blue-700'
              }`}
            >
              <FaCar className="mr-3" />
              Araçlar
            </button>
            
            <button 
              onClick={() => handleTabChange('yorumlar')}
              className={`w-full flex items-center px-4 py-3 ${
                activeTab === 'yorumlar' ? 'bg-blue-900' : 'hover:bg-blue-700'
              }`}
            >
              <FaComment className="mr-3" />
              Yorumlar
            </button>
          </nav>
          
          <div className="p-4 border-t border-blue-700">
            <Link 
              href="/"
              className="w-full block text-center py-2 bg-blue-700 rounded hover:bg-blue-600 transition-colors"
            >
              Siteye Dön
            </Link>
          </div>
        </div>
        
        {/* Ana İçerik */}
        <div className="flex-1 p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                      <FaUser className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm">Toplam Kullanıcı</h3>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <span className="text-green-500 font-semibold">+{stats.recentUsers}</span> son 7 günde
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
                      <FaCar className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm">Toplam Araç</h3>
                      <p className="text-2xl font-bold">{stats.totalCars}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <span className="text-green-500 font-semibold">+{stats.recentCars}</span> son 7 günde
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-4">
                      <FaComment className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm">Toplam Yorum</h3>
                      <p className="text-2xl font-bold">{stats.totalReviews}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                      <FaEnvelope className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm">Toplam Mesaj</h3>
                      <p className="text-2xl font-bold">{stats.totalMessages}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-4">Hızlı İşlemler</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleTabChange('araclar')}
                    className="p-4 border rounded-lg flex items-center text-left hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                      <FaCar />
                    </div>
                    <div>
                      <h4 className="font-medium">Araçları Yönet</h4>
                      <p className="text-sm text-gray-500">İlanları onayla veya reddet</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('yorumlar')}
                    className="p-4 border rounded-lg flex items-center text-left hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                      <FaComment />
                    </div>
                    <div>
                      <h4 className="font-medium">Yorumları Yönet</h4>
                      <p className="text-sm text-gray-500">Yorumları incele ve moderasyon yap</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('users')}
                    className="p-4 border rounded-lg flex items-center text-left hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                      <FaUser />
                    </div>
                    <div>
                      <h4 className="font-medium">Kullanıcıları Yönet</h4>
                      <p className="text-sm text-gray-500">Kullanıcı listesini görüntüle</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Kullanıcılar */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Kullanıcılar</h2>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-posta
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                              {user.resim_url ? (
                                <Image 
                                  src={user.resim_url} 
                                  alt={user.ad_soyad}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaUser className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.ad_soyad}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(user.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <FaEye />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Araçlar */}
          {activeTab === 'araclar' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Araçlar</h2>
              
              <div className="mb-6 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded ${
                      filterStatus === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    Tümü
                  </button>
                  <button 
                    onClick={() => setFilterStatus('approved')}
                    className={`px-4 py-2 rounded ${
                      filterStatus === 'approved' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    Onaylananlar
                  </button>
                  <button 
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded ${
                      filterStatus === 'pending' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    Bekleyenler
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Araç
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satıcı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eklenme Tarihi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {araclar.map((arac) => (
                      <tr key={arac.id} className={aracOnaylaniyor === arac.id ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{arac.baslik}</div>
                          <div className="text-sm text-gray-500">
                            {arac.marka} {arac.model} ({arac.yil})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{arac.profiller.ad_soyad}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {arac.fiyat.toLocaleString('tr-TR')} TL
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(arac.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {arac.onaylandi ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Onaylandı
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Bekliyor
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/araclar/${arac.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            target="_blank"
                          >
                            <FaEye />
                          </Link>
                          
                          {aracOnaylaniyor === arac.id ? (
                            <span className="text-gray-400 mr-3">
                              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                            </span>
                          ) : arac.onaylandi ? (
                            <button 
                              onClick={() => toggleAracOnayi(arac.id, false)}
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                              title="Onayı Kaldır"
                            >
                              <FaTimes />
                            </button>
                          ) : (
                            <button 
                              onClick={() => toggleAracOnayi(arac.id, true)}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Onayla"
                            >
                              <FaCheck />
                            </button>
                          )}
                          
                          <button className="text-red-600 hover:text-red-900">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Yorumlar */}
          {activeTab === 'yorumlar' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Yorumlar</h2>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y">
                  {yorumlar.map((yorum) => (
                    <div key={yorum.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="mr-4 flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar 
                                key={star}
                                className={star <= yorum.puan ? 'text-yellow-400' : 'text-gray-300'} 
                              />
                            ))}
                          </div>
                          <h3 className="font-semibold">{yorum.konu}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => deleteYorum(yorum.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{yorum.yorum}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaUser className="mr-1" />
                          <span>{yorum.profiller.ad_soyad}</span>
                          <span className="mx-2">•</span>
                          <span>Araç: {yorum.arabalar.baslik}</span>
                        </div>
                        <div>{formatDate(yorum.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 