'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FaSearch, FaCarSide, FaCalendarAlt, FaTachometerAlt, 
  FaGasPump, FaCog, FaMoneyBillWave, FaSlidersH, FaChevronDown 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const FilterCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filtre durumları
  const [marka, setMarka] = useState(searchParams?.get('marka') || '');
  const [model, setModel] = useState(searchParams?.get('model') || '');
  const [minFiyat, setMinFiyat] = useState(searchParams?.get('min_fiyat') || '');
  const [maxFiyat, setMaxFiyat] = useState(searchParams?.get('max_fiyat') || '');
  const [minYil, setMinYil] = useState(searchParams?.get('min_yil') || '');
  const [maxYil, setMaxYil] = useState(searchParams?.get('max_yil') || '');
  const [maxKm, setMaxKm] = useState(searchParams?.get('max_km') || '');
  const [yakitTipi, setYakitTipi] = useState(searchParams?.get('yakit_tipi') || '');
  const [vitesTipi, setVitesTipi] = useState(searchParams?.get('vites_tipi') || '');
  const [expanded, setExpanded] = useState(false);
  
  // Statik veriler
  const markalar = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Renault'];
  const yakitTipleri = ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'];
  const vitesTipleri = ['Manuel', 'Otomatik', 'Yarı Otomatik'];
  
  // Yıl seçenekleri için dinamik veri
  const yillar = () => {
    const suankiYil = new Date().getFullYear();
    const sonYillar = [];
    for (let i = suankiYil; i >= suankiYil - 30; i--) {
      sonYillar.push(i);
    }
    return sonYillar;
  };

  // Filtre formunun gönderilmesini yönet
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (marka) params.set('marka', marka);
    if (model) params.set('model', model);
    if (minFiyat) params.set('min_fiyat', minFiyat);
    if (maxFiyat) params.set('max_fiyat', maxFiyat);
    if (minYil) params.set('min_yil', minYil);
    if (maxYil) params.set('max_yil', maxYil);
    if (maxKm) params.set('max_km', maxKm);
    if (yakitTipi) params.set('yakit_tipi', yakitTipi);
    if (vitesTipi) params.set('vites_tipi', vitesTipi);
    
    // URL'yi güncelle
    router.push(`/araclar?${params.toString()}`);
  };

  // Filtreleri sıfırla
  const handleReset = () => {
    setMarka('');
    setModel('');
    setMinFiyat('');
    setMaxFiyat('');
    setMinYil('');
    setMaxYil('');
    setMaxKm('');
    setYakitTipi('');
    setVitesTipi('');
    
    router.push('/araclar');
  };

  // Genişlet/Daralt
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <FaSlidersH className="mr-2" />
          <h2 className="font-bold">Araç Filtreleri</h2>
        </div>
        <button 
          onClick={toggleExpanded}
          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          aria-label={expanded ? "Filtreleri Daralt" : "Filtreleri Genişlet"}
        >
          <FaChevronDown className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              <FaCarSide className="inline mr-1" /> Marka
            </label>
            <select 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={marka}
              onChange={(e) => setMarka(e.target.value)}
            >
              <option value="">Tüm Markalar</option>
              {markalar.map((m) => (
                <option key={m} value={m.toLowerCase()}>{m}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              <FaMoneyBillWave className="inline mr-1" /> Min. Fiyat
            </label>
            <input 
              type="number" 
              placeholder="TL" 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={minFiyat}
              onChange={(e) => setMinFiyat(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              <FaMoneyBillWave className="inline mr-1" /> Max. Fiyat
            </label>
            <input 
              type="number" 
              placeholder="TL" 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={maxFiyat}
              onChange={(e) => setMaxFiyat(e.target.value)}
            />
          </div>
          
          {/* Genişletilmiş filtreler */}
          <motion.div 
            className={`col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 ${expanded ? 'block' : 'hidden'}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: expanded ? 'auto' : 0,
              opacity: expanded ? 1 : 0,
              display: expanded ? 'grid' : 'none'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                <FaCalendarAlt className="inline mr-1" /> Min. Yıl
              </label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={minYil}
                onChange={(e) => setMinYil(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {yillar().map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                <FaCalendarAlt className="inline mr-1" /> Max. Yıl
              </label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={maxYil}
                onChange={(e) => setMaxYil(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {yillar().map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                <FaTachometerAlt className="inline mr-1" /> Max. Kilometre
              </label>
              <input 
                type="number" 
                placeholder="km" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                <FaGasPump className="inline mr-1" /> Yakıt Tipi
              </label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={yakitTipi}
                onChange={(e) => setYakitTipi(e.target.value)}
              >
                <option value="">Tümü</option>
                {yakitTipleri.map((yt) => (
                  <option key={yt} value={yt.toLowerCase()}>{yt}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                <FaCog className="inline mr-1" /> Vites Tipi
              </label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={vitesTipi}
                onChange={(e) => setVitesTipi(e.target.value)}
              >
                <option value="">Tümü</option>
                {vitesTipleri.map((vt) => (
                  <option key={vt} value={vt.toLowerCase()}>{vt}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                Model
              </label>
              <input 
                type="text" 
                placeholder="Model adı giriniz" 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
        
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
          >
            Filtreleri Temizle
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors"
          >
            <FaSearch className="inline mr-1" /> Araçları Filtrele
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterCard; 