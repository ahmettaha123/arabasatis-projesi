'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaCar, FaArrowRight, FaCalendarAlt, FaTachometerAlt, FaGasPump, FaCog, FaStar, FaUsers, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';

export default function Hero() {
  // useRouter hook'u
  const router = useRouter();
  
  // useRef hook'u
  const heroRef = useRef(null);
  
  // useState hook'ları
  const [marka, setMarka] = useState('');
  const [minFiyat, setMinFiyat] = useState('');
  const [maxFiyat, setMaxFiyat] = useState('');
  const [yil, setYil] = useState('');
  const [kilometre, setKilometre] = useState('');
  const [yakitTipi, setYakitTipi] = useState('');
  const [vitestipi, setVitesTipi] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // useEffect hook'ları
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (marka) params.append('marka', marka);
    if (minFiyat) params.append('min_fiyat', minFiyat);
    if (maxFiyat) params.append('max_fiyat', maxFiyat);
    if (yil) params.append('yil', yil);
    if (kilometre) params.append('kilometre', kilometre);
    if (yakitTipi) params.append('yakit_tipi', yakitTipi);
    if (vitestipi) params.append('vites_tipi', vitestipi);
    
    router.push(`/araclar?${params.toString()}`);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const markalar = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Renault'];
  const yakitTipleri = ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit'];
  const vitesTipleri = ['Manuel', 'Otomatik', 'Yarı Otomatik'];

  const yillar = () => {
    const suankiYil = new Date().getFullYear();
    const sonYillar = [];
    for (let i = suankiYil; i >= suankiYil - 30; i--) {
      sonYillar.push(i);
    }
    return sonYillar;
  };

  if (!isMounted) {
    return (
      <div 
        id="hero-bg"
        className="relative min-h-[700px] bg-cover bg-center bg-fixed overflow-hidden transition-all duration-1000 ease-in-out" 
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 backdrop-blur-sm"></div>
      </div>
    );
  }

  return (
    <div 
      id="hero-bg"
      className="relative min-h-[700px] bg-cover bg-center bg-fixed overflow-hidden transition-all duration-1000 ease-in-out" 
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80)'
      }}
      ref={heroRef}
    >
      {/* Sabit arka plan katmanları */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 backdrop-blur-sm"></div>
      
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
      
      {/* Animasyonlu boyama efekti */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
      
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
      
      {/* Hareketli parçacıklar - daha az parçacık kullanarak performans artışı */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative container mx-auto h-full flex flex-col justify-center items-start text-white px-4 pt-20 pb-32 fade-in stagger-animation">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="block animate-pulse-glow">
            Hayalinizdeki <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Araca</span>
          </span>
          <span className="block float-animation">
            Kavuşmanın Zamanı
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-2xl text-blue-100 fade-in animation-delay-200">
          Türkiye'nin en güvenilir araç alım satım platformunda binlerce aracı keşfedin.
        </p>
        
        <div className="w-full max-w-6xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-10 border border-white/20 dark:border-slate-700/30 hover-lift">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center relative overflow-hidden">
            <div className="flex items-center">
              <div className="text-white/80 mr-3 text-xl animate-pulse">
                <FaCar />
              </div>
              <h2 className="font-bold text-lg">Detaylı Araç Arama</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm hidden md:block">
                <span className="font-semibold animate-subtle-pulse">
                  25.000+
                </span> araç listelendi
              </div>
              <button 
                onClick={toggleExpanded}
                className="md:hidden bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <div className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                  {expanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
            
            {/* Süslemeli arka plan efekti - basitleştirildi */}
            <div className="absolute -right-10 -top-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          </div>
          
          <form onSubmit={handleSearch} className="p-6 relative overflow-hidden">
            {/* Süslemeli arka plan şekilleri - azaltıldı */}
            <div className="absolute -right-10 bottom-40 w-20 h-20 bg-blue-400/5 dark:bg-blue-400/10 rounded-full blur-md"></div>
            
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ${expanded ? 'block' : 'hidden md:grid'}`}>
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="marka" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marka</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCar className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="marka"
                    value={marka}
                    onChange={(e) => setMarka(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Tüm Markalar</option>
                    {markalar.map((m) => (
                      <option key={m} value={m.toLowerCase()}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="minFiyat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Fiyat</label>
                <input
                  type="text"
                  id="minFiyat"
                  value={minFiyat}
                  onChange={(e) => setMinFiyat(e.target.value)}
                  placeholder="Min. TL"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="maxFiyat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max. Fiyat</label>
                <input
                  type="text"
                  id="maxFiyat"
                  value={maxFiyat}
                  onChange={(e) => setMaxFiyat(e.target.value)}
                  placeholder="Max. TL"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="yil" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yıl</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="yil"
                    value={yil}
                    onChange={(e) => setYil(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Tüm Yıllar</option>
                    {yillar().map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="kilometre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max. KM</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTachometerAlt className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="kilometre"
                    value={kilometre}
                    onChange={(e) => setKilometre(e.target.value)}
                    placeholder="Max. KM"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="yakitTipi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yakıt Tipi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGasPump className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="yakitTipi"
                    value={yakitTipi}
                    onChange={(e) => setYakitTipi(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Tüm Yakıt Tipleri</option>
                    {yakitTipleri.map((yt) => (
                      <option key={yt} value={yt.toLowerCase()}>{yt}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="vitestipi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vites Tipi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCog className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="vitestipi"
                    value={vitestipi}
                    onChange={(e) => setVitesTipi(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Tüm Vites Tipleri</option>
                    {vitesTipleri.map((vt) => (
                      <option key={vt} value={vt.toLowerCase()}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-between items-center">
              <button 
                type="button" 
                onClick={toggleExpanded}
                className="md:hidden text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {expanded ? 'Daralt' : 'Gelişmiş Arama'}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                type="submit"
                className="w-full sm:w-auto py-2.5 px-6 text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <FaSearch className="h-4 w-4" />
                <span>Araçları Bul</span>
                <FaArrowRight className="h-3.5 w-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="absolute -bottom-16 left-0 right-0 px-4 transition-all duration-700">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl transform hover:-translate-y-2 transition-all duration-300 flex items-center group border border-blue-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div 
                className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform animate-pulse text-blue-600 dark:text-blue-400"
              >
                <FaCar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Toplam Araç</p>
                <p className="text-gray-900 dark:text-white font-bold text-xl">25.000+</p>
              </div>
            </div>
            
            <div 
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl transform hover:-translate-y-2 transition-all duration-300 flex items-center group border border-green-100 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700"
            >
              <div 
                className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform animate-pulse text-green-600 dark:text-green-400"
              >
                <FaUsers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Aktif Kullanıcı</p>
                <p className="text-gray-900 dark:text-white font-bold text-xl">10.000+</p>
              </div>
            </div>
            
            <div 
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl transform hover:-translate-y-2 transition-all duration-300 flex items-center group border border-purple-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700"
            >
              <div 
                className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform animate-pulse text-purple-600 dark:text-purple-400"
              >
                <FaMapMarkerAlt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">İl Kapsamı</p>
                <p className="text-gray-900 dark:text-white font-bold text-xl">81 İl</p>
              </div>
            </div>
            
            <div 
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl transform hover:-translate-y-2 transition-all duration-300 flex items-center group border border-amber-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700"
            >
              <div 
                className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform animate-pulse text-amber-600 dark:text-amber-400"
              >
                <FaStar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Müşteri Memnuniyeti</p>
                <p className="text-gray-900 dark:text-white font-bold text-xl">4.8/5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 