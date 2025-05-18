'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type User = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
};

type UserProfile = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  interests?: string[];
};

type FavoriteCar = {
  id: string;
  car_id: string;
  user_id: string;
  created_at: string;
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    image_url?: string;
  };
};

type ViewedCar = {
  id: string;
  car_id: string;
  user_id: string;
  viewed_at: string;
  car: {
    id: string;
    brand: string; 
    model: string;
    year: number;
    price: number;
    image_url?: string;
  };
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  favorites: FavoriteCar[];
  viewedCars: ViewedCar[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  addToFavorites: (car_id: string) => Promise<void>;
  removeFromFavorites: (car_id: string) => Promise<void>;
  recordCarView: (car_id: string) => Promise<void>;
  updateInterests: (interests: string[]) => Promise<void>;
  checkIsFavorite: (car_id: string) => boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteCar[]>([]);
  const [viewedCars, setViewedCars] = useState<ViewedCar[]>([]);

  // Profil bilgilerini getir
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profil alma hatası:', error);
    }
  };

  // Favori arabaları getir
  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id, 
          car_id, 
          user_id, 
          created_at,
          car:cars(id, brand, model, year, price, image_url)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      setFavorites(data || []);
    } catch (error) {
      console.error('Favorileri alma hatası:', error);
    }
  };

  // Görüntülenen arabaları getir
  const fetchViewedCars = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('viewed_cars')
        .select(`
          id, 
          car_id, 
          user_id, 
          viewed_at,
          car:cars(id, brand, model, year, price, image_url)
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setViewedCars(data || []);
    } catch (error) {
      console.error('Görüntülenen arabaları alma hatası:', error);
    }
  };

  // Kullanıcı durumunu takip et
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await fetchProfile(user.id);
          await fetchFavorites(user.id);
          await fetchViewedCars(user.id);
        }
      } catch (error) {
        console.error('Kullanıcı kontrol hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Auth state dinleyicisi
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
        await fetchFavorites(session.user.id);
        await fetchViewedCars(session.user.id);
      } else {
        setProfile(null);
        setFavorites([]);
        setViewedCars([]);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Kayıt ol
  const signUp = async (email: string, password: string, full_name: string) => {
    try {
      setLoading(true);
      
      // Kullanıcı kaydı oluştur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Profil kaydı oluştur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              full_name,
              created_at: new Date().toISOString(),
            },
          ]);
          
        if (profileError) throw profileError;
        
        toast.success('Kayıt başarılı! Email adresinizi onaylayın.');
        router.push('/giris');
      }
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Giriş yap
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
        await fetchFavorites(data.user.id);
        await fetchViewedCars(data.user.id);
        toast.success('Başarıyla giriş yapıldı');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      toast.error(error.message || 'Giriş yaparken bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setFavorites([]);
      setViewedCars([]);
      toast.success('Çıkış yapıldı');
      router.refresh();
    } catch (error: any) {
      console.error('Çıkış hatası:', error);
      toast.error(error.message || 'Çıkış yaparken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Profil güncelleme
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      if (!user) throw new Error('Kullanıcı oturum açmamış');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Profil bilgilerini yeniden yükle
      await fetchProfile(user.id);
      
      toast.success('Profil başarıyla güncellendi');
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      toast.error(error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Favorilere ekle
  const addToFavorites = async (car_id: string) => {
    try {
      if (!user) {
        toast.error('Favorilere eklemek için giriş yapmalısınız');
        return;
      }
      
      const { error } = await supabase
        .from('favorites')
        .insert([
          { user_id: user.id, car_id },
        ]);
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Bu araba zaten favorilerinizde');
          return;
        }
        throw error;
      }
      
      // Favorileri yeniden yükle
      await fetchFavorites(user.id);
      
      toast.success('Araba favorilere eklendi');
    } catch (error) {
      console.error('Favorilere ekleme hatası:', error);
      toast.error('Favorilere eklenirken bir hata oluştu');
    }
  };

  // Favorilerden çıkar
  const removeFromFavorites = async (car_id: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('car_id', car_id);
      
      if (error) throw error;
      
      // Favori listesini güncelle
      setFavorites(favorites.filter(fav => fav.car_id !== car_id));
      
      toast.success('Araba favorilerden çıkarıldı');
    } catch (error) {
      console.error('Favorilerden çıkarma hatası:', error);
      toast.error('Favorilerden çıkarılırken bir hata oluştu');
    }
  };

  // Araba görüntüleme kaydı
  const recordCarView = async (car_id: string) => {
    try {
      if (!user) return; // Kullanıcı giriş yapmamışsa kaydetme
      
      const { error } = await supabase
        .from('viewed_cars')
        .upsert([
          { 
            user_id: user.id, 
            car_id, 
            viewed_at: new Date().toISOString() 
          },
        ], { onConflict: 'user_id, car_id' });
      
      if (error) throw error;
      
      // Görüntülenen arabaları yeniden yükle
      await fetchViewedCars(user.id);
    } catch (error) {
      console.error('Araba görüntüleme kaydı hatası:', error);
    }
  };

  // İlgi alanlarını güncelle
  const updateInterests = async (interests: string[]) => {
    try {
      if (!user) return;
      
      await updateProfile({ interests });
      
      toast.success('İlgi alanlarınız güncellendi');
    } catch (error) {
      console.error('İlgi alanları güncelleme hatası:', error);
    }
  };

  // Favorilerde olup olmadığını kontrol et
  const checkIsFavorite = (car_id: string): boolean => {
    return favorites.some(fav => fav.car_id === car_id);
  };

  // Kullanıcı bilgilerini yenile
  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchProfile(user.id);
        await fetchFavorites(user.id);
        await fetchViewedCars(user.id);
      }
    } catch (error) {
      console.error('Kullanıcı yenileme hatası:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      favorites,
      viewedCars,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshUser,
      addToFavorites,
      removeFromFavorites,
      recordCarView,
      updateInterests,
      checkIsFavorite
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser hook must be used within a UserProvider');
  }
  return context;
}; 