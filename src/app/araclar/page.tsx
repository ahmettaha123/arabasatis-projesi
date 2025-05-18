'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ArabaCard from '@/components/ArabaCard';
import FilterCard from '@/components/ui/FilterCard';
import { supabase } from '@/lib/supabase';
import { ArabaWithResimler } from '@/types/database';
import { Search } from 'lucide-react';

export default function Araclar() {
  const searchParams = useSearchParams();
  const [arabalar, setArabalar] = useState<ArabaWithResimler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  useEffect(() => {
    fetchArabalar();
  }, [searchParams]);
  
  const fetchArabalar = async () => {
    setLoading(true);
    
    try {
      // URL'den tüm parametreleri alalım
      const marka = searchParams.get('marka') || '';
      const model = searchParams.get('model') || '';
      const minFiyat = searchParams.get('min_fiyat') || '';
      const maxFiyat = searchParams.get('max_fiyat') || '';
      const minYil = searchParams.get('min_yil') || '';
      const maxYil = searchParams.get('max_yil') || '';
      const yakit = searchParams.get('yakit_tipi') || '';
      const vites = searchParams.get('vites_tipi') || '';
      const search = searchParams.get('search') || searchTerm;
      
      let query = supabase
        .from('arabalar')
        .select(`
          *,
          resimler!inner(
            id,
            url,
            ana_resim
          )
        `);
      
      // Arama terimi varsa
      if (search) {
        query = query.or(`baslik.ilike.%${search}%,marka.ilike.%${search}%,model.ilike.%${search}%,aciklama.ilike.%${search}%`);
      }
      
      // Filtreleri ekle
      if (marka) query = query.eq('marka', marka);
      if (model) query = query.ilike('model', `%${model}%`);
      if (minFiyat) query = query.gte('fiyat', parseInt(minFiyat));
      if (maxFiyat) query = query.lte('fiyat', parseInt(maxFiyat));
      if (minYil) query = query.gte('yil', parseInt(minYil));
      if (maxYil) query = query.lte('yil', parseInt(maxYil));
      if (yakit) query = query.eq('yakit_tipi', yakit);
      if (vites) query = query.eq('vites_tipi', vites);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setArabalar(data || []);
    } catch (error) {
      console.error('Araçlar alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArabalar();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Satılık Araçlar</h1>
        
        <form onSubmit={handleSearchSubmit} className="w-full mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Marka, model veya anahtar kelime ara..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {arabalar.length} araç bulundu
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Yeni Filtre Kartı Bileşeni */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterCard />
          </div>
        </div>
        
        {/* Araç Listesi */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow animate-pulse h-80"
                >
                  <div className="h-40 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : arabalar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {arabalar.map((araba) => (
                <ArabaCard key={araba.id} araba={araba} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">Araç Bulunamadı</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Arama kriterlerinize uygun araç bulunamadı. Lütfen farklı filtreler kullanarak tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 