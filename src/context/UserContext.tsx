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
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Kullanıcı durumunu takip et
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await fetchProfile(user.id);
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
      } else {
        setProfile(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  // Kullanıcı bilgilerini yenile
  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchProfile(user.id);
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
      signIn, 
      signOut, 
      updateProfile,
      refreshUser
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