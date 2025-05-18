import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';

// Supabase bağlantı bilgileri
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khdmurgshrmjbxufuovu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZG11cmdzaHJtamJ4dWZ1b3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODM3NjQsImV4cCI6MjA2MzA1OTc2NH0.JqEWucaQXDm-WvFPPSSfcj1xODGlskxiCkCVLN7DbKE';

// Supabase istemcisini oluştur
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Bağlantı test fonksiyonu
export const testSupabaseConnection = async () => {
  try {
    console.log('Supabase bağlantı testi başlıyor');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Anahtar:', supabaseAnonKey.substring(0, 10) + '...');
    
    // Basit bir query ile test et
    const { data, error } = await supabase.from('araclar').select('id', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase bağlantı hatası:', error);
      return { success: false, error: error.message, details: error };
    }
    
    console.log('Bağlantı başarılı, veri sayısı:', data);
    return { success: true, data };
  } catch (e) {
    console.error('Supabase bağlantı testi sırasında hata:', e);
    return { 
      success: false, 
      error: e instanceof Error ? e.message : 'Bilinmeyen hata',
      details: e
    };
  }
};

// Araba listesi al
export const getCarListings = async (filters?: Record<string, any>) => {
  try {
    console.log('Araç listesi çekiliyor...', filters ? 'Filtrelerle' : 'Tümü');
    
    let query = supabase
      .from('araclar')
      .select(`
        id,
        marka,
        model,
        model_yili,
        kilometre,
        fiyat,
        yakit_tipi,
        vites_tipi,
        konum,
        renk,
        goruntuleme_sayisi,
        fotograf_urls,
        created_at,
        kullanici_id,
        durum
      `)
      .order('created_at', { ascending: false });
    
    // Filtreler varsa uygula
    if (filters) {
      if (filters.marka) {
        query = query.eq('marka', filters.marka);
      }
      
      if (filters.model) {
        query = query.ilike('model', `%${filters.model}%`);
      }
      
      if (filters.min_fiyat) {
        query = query.gte('fiyat', filters.min_fiyat);
      }
      
      if (filters.max_fiyat) {
        query = query.lte('fiyat', filters.max_fiyat);
      }
      
      if (filters.min_yil) {
        query = query.gte('model_yili', filters.min_yil);
      }
      
      if (filters.max_yil) {
        query = query.lte('model_yili', filters.max_yil);
      }
      
      if (filters.yakit_tipi) {
        query = query.eq('yakit_tipi', filters.yakit_tipi);
      }
      
      if (filters.vites_tipi) {
        query = query.eq('vites_tipi', filters.vites_tipi);
      }
      
      if (filters.konum) {
        query = query.ilike('konum', `%${filters.konum}%`);
      }
      
      if (filters.max_kilometre) {
        query = query.lte('kilometre', filters.max_kilometre);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Araç listesi çekme hatası:', error);
      throw error;
    }
    
    console.log(`${data?.length || 0} araç verisi başarıyla çekildi`);
    return data || [];
  } catch (error) {
    console.error('Araçlar alınırken hata oluştu:', error);
    return [];
  }
};

// ID'ye göre araba detayları
export const getCarById = async (id: string) => {
  try {
    console.log(`Araç detayı çekiliyor... (ID: ${id})`);
    const { data, error } = await supabase
      .from('araclar')
      .select(`
        id,
        marka,
        model,
        model_yili,
        kilometre,
        fiyat,
        yakit_tipi,
        vites_tipi,
        kasa_tipi,
        konum,
        renk,
        motor_hacmi,
        motor_gucu,
        aciklama,
        durum,
        ozellikler,
        fotograf_urls,
        goruntuleme_sayisi,
        created_at,
        updated_at,
        kullanici:kullanici_id (
          id, 
          isim, 
          telefon, 
          email, 
          profil_resmi,
          created_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Araç detayları alınırken hata (ID: ${id}):`, error);
      throw error;
    }
    
    // Görüntülenme sayısını artır
    await incrementViewCount(id);
    
    console.log(`Araç detayları başarıyla alındı (ID: ${id})`);
    return data;
  } catch (error) {
    console.error(`Araç (${id}) alınırken hata:`, error);
    return null;
  }
};

// Görüntülenme sayısını artır
export const incrementViewCount = async (carId: string) => {
  try {
    const { data: currentCar } = await supabase
      .from('araclar')
      .select('goruntuleme_sayisi')
      .eq('id', carId)
      .single();
    
    const currentViews = currentCar?.goruntuleme_sayisi || 0;
    
    const { error } = await supabase
      .from('araclar')
      .update({ goruntuleme_sayisi: currentViews + 1 })
      .eq('id', carId);
    
    if (error) {
      console.error('Görüntülenme sayısı güncelleme hatası:', error);
    }
  } catch (error) {
    console.error('Görüntülenme sayısı artırılırken hata:', error);
  }
};

// Araba oluştur
export const createCar = async (carData: any) => {
  try {
    const { data, error } = await supabase
      .from('araclar')
      .insert(carData)
      .select()
      .single();
    
    if (error) {
      console.error('Araç oluşturma hatası:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Araç oluşturulurken hata:', error);
    throw error;
  }
};

// Araba güncelle
export const updateCar = async (id: string, carData: any) => {
  try {
    const { data, error } = await supabase
      .from('araclar')
      .update(carData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Araç güncelleme hatası (ID: ${id}):`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Araç güncellenirken hata (ID: ${id}):`, error);
    throw error;
  }
};

// Araba sil
export const deleteCar = async (id: string) => {
  try {
    const { error } = await supabase
      .from('araclar')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Araç silme hatası (ID: ${id}):`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Araç silinirken hata (ID: ${id}):`, error);
    throw error;
  }
};

// Kullanıcı favorilerini al
export const getUserFavorites = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favoriler')
      .select(`
        id,
        arac_id,
        created_at,
        arac:arac_id (
          id,
          marka,
          model,
          model_yili,
          fiyat,
          fotograf_urls
        )
      `)
      .eq('kullanici_id', userId);
    
    if (error) {
      console.error('Favoriler alınırken hata:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Kullanıcı favorileri alınırken hata:', error);
    return [];
  }
};

// Favori ekle/çıkar
export const toggleFavorite = async (userId: string, carId: string, isFavorite: boolean) => {
  try {
    if (isFavorite) {
      // Favorilerden çıkar
      const { error } = await supabase
        .from('favoriler')
        .delete()
        .eq('kullanici_id', userId)
        .eq('arac_id', carId);
      
      if (error) {
        console.error('Favoriden çıkartma hatası:', error);
        throw error;
      }
      
      return false;
    } else {
      // Favorilere ekle
      const { error } = await supabase
        .from('favoriler')
        .insert({
          kullanici_id: userId,
          arac_id: carId
        });
      
      if (error) {
        console.error('Favoriye ekleme hatası:', error);
        throw error;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Favori işlemi sırasında hata:', error);
    throw error;
  }
};

// Kullanıcı profili getir
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('kullanicilar')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Kullanıcı profili getirme hatası:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Kullanıcı profili alınırken hata:', error);
    return null;
  }
};

// Kullanıcı profili güncelle
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('kullanicilar')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Kullanıcı profili güncelleme hatası:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Kullanıcı profili güncellenirken hata:', error);
    throw error;
  }
};

// Benzer araçları getir
export const getSimilarCars = async (
  carId: string, 
  marka: string, 
  model: string, 
  limit: number = 4
) => {
  try {
    // Öncelikle aynı model ve markadaki araçları bul
    let { data: similarCars, error } = await supabase
      .from('araclar')
      .select('*')
      .eq('marka', marka)
      .eq('model', model)
      .neq('id', carId)
      .limit(limit);
    
    if (error) {
      console.error('Benzer araçlar alınırken hata:', error);
      throw error;
    }
    
    // Eğer yeterli sayıda benzer araç bulunamazsa, sadece aynı markadaki araçları getir
    if (!similarCars || similarCars.length < limit) {
      const additionalLimit = limit - (similarCars?.length || 0);
      
      if (additionalLimit > 0) {
        const { data: brandCars, error: brandError } = await supabase
          .from('araclar')
          .select('*')
          .eq('marka', marka)
          .neq('model', model) // Farklı model
          .neq('id', carId)
          .limit(additionalLimit);
        
        if (brandError) {
          console.error('Aynı marka araçlar alınırken hata:', brandError);
        } else if (brandCars) {
          similarCars = [...(similarCars || []), ...brandCars];
        }
      }
    }
    
    return similarCars || [];
  } catch (error) {
    console.error('Benzer araçlar alınırken hata:', error);
    return [];
  }
}; 