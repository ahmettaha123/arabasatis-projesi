'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCarSide, FaCalendarAlt, FaTachometerAlt, FaGasPump, FaCog, FaPalette, FaMoneyBillWave, FaTrashAlt, FaPlus, FaArrowsAltH } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ArabaWithResimler } from '@/types/database';

interface CarComparisonProps {
  initialCars?: ArabaWithResimler[];
  onClose?: () => void;
}

export default function CarComparison({ initialCars = [], onClose }: CarComparisonProps) {
  const [selectedCars, setSelectedCars] = useState<ArabaWithResimler[]>(initialCars);
  const [isOpen, setIsOpen] = useState(false);
  const [availableCars, setAvailableCars] = useState<ArabaWithResimler[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Karşılaştırılacak araçlar için boş slotlar (2 adet)
  const maxCars = 2;

  useEffect(() => {
    if (initialCars.length > 0) {
      setIsOpen(true);
    }
  }, [initialCars]);

  // Veritabanından araç verilerini çek (normalde API ile yapılacak)
  useEffect(() => {
    // Gerçek uygulamada bu veriler API'den gelecek
    // Örnek veri yapısı
    const mockCars: ArabaWithResimler[] = [
      {
        id: '1',
        baslik: 'BMW 320i Premium',
        marka: 'BMW',
        model: '320i',
        yil: 2021,
        kilometre: 30000,
        fiyat: 950000,
        renk: 'Siyah',
        yakit_tipi: 'Benzin',
        vites_tipi: 'Otomatik',
        motor_hacmi: '2.0',
        aciklama: 'Premium paket, panoramik cam tavan, deri koltuklar.',
        durum: 'İkinci El',
        sahibi: 'user1',
        konum: 'İstanbul',
        goruntuleme: 245,
        created_at: '2023-10-15',
        updated_at: '2023-10-15',
        resimler: [
          {
            id: '1',
            araba_id: '1',
            url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=420',
            ana_resim: true,
            siralama: 1,
            created_at: '2023-10-15',
          }
        ]
      },
      {
        id: '2',
        baslik: 'Mercedes C180 AMG',
        marka: 'Mercedes',
        model: 'C180 AMG',
        yil: 2022,
        kilometre: 15000,
        fiyat: 1200000,
        renk: 'Beyaz',
        yakit_tipi: 'Benzin',
        vites_tipi: 'Otomatik',
        motor_hacmi: '1.6',
        aciklama: 'AMG paket, komple deri, hafıza paketli koltuklar.',
        durum: 'İkinci El',
        sahibi: 'user2',
        konum: 'Ankara',
        goruntuleme: 320,
        created_at: '2023-11-01',
        updated_at: '2023-11-01',
        resimler: [
          {
            id: '2',
            araba_id: '2',
            url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=420',
            ana_resim: true,
            siralama: 1,
            created_at: '2023-11-01',
          }
        ]
      },
      {
        id: '3',
        baslik: 'Audi A4 Design',
        marka: 'Audi',
        model: 'A4',
        yil: 2020,
        kilometre: 45000,
        fiyat: 980000,
        renk: 'Gri',
        yakit_tipi: 'Dizel',
        vites_tipi: 'Otomatik',
        motor_hacmi: '2.0 TDI',
        aciklama: 'Design paket, matrix LED farlar, B&O ses sistemi.',
        durum: 'İkinci El',
        sahibi: 'user3',
        konum: 'İzmir',
        goruntuleme: 187,
        created_at: '2023-09-20',
        updated_at: '2023-09-20',
        resimler: [
          {
            id: '3',
            araba_id: '3',
            url: 'https://images.unsplash.com/photo-1606664825213-a2e792bc3f8b?q=80&w=420',
            ana_resim: true,
            siralama: 1,
            created_at: '2023-09-20',
          }
        ]
      },
    ];

    setAvailableCars(mockCars);
  }, []);

  const toggleComparison = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  };

  const addCar = (car: ArabaWithResimler) => {
    if (selectedCars.length < maxCars) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const removeCar = (carId: string) => {
    setSelectedCars(selectedCars.filter(car => car.id !== carId));
  };

  const clearComparison = () => {
    setSelectedCars([]);
  };

  const getImageUrl = (car: ArabaWithResimler) => {
    if (car.resimler && car.resimler.length > 0) {
      return car.resimler[0].url;
    }
    return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=300';
  };

  // Fiyat biçimlendirme
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
  };

  // Araç aralarındaki fark yüzdesini hesapla
  const calculateDifference = (value1: number | null, value2: number | null) => {
    if (value1 === null || value2 === null) return null;
    const diff = ((value1 - value2) / value2) * 100;
    return diff.toFixed(1);
  };

  // Araçları ara
  const filteredCars = availableCars.filter(car => {
    // Halihazırda seçili araçları gösterme
    if (selectedCars.some(selected => selected.id === car.id)) return false;
    
    // Arama terimine göre filtrele
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        car.marka.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower) ||
        car.baslik.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <>
      {/* Kapalı durumdaki karşılaştırma butonu */}
      <button
        onClick={toggleComparison}
        className="fixed bottom-4 right-4 z-40 flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Araç Karşılaştır"
      >
        {isOpen ? (
          <FaArrowsAltH className="w-5 h-5" />
        ) : (
          <div className="flex items-center">
            <FaCarSide className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Karşılaştır</span>
            {selectedCars.length > 0 && (
              <span className="ml-2 flex items-center justify-center w-5 h-5 bg-white text-blue-600 text-xs font-bold rounded-full">
                {selectedCars.length}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Karşılaştırma paneli */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-2xl rounded-t-xl overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center">
                <FaCarSide className="mr-2" /> Araç Karşılaştırma
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearComparison}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  aria-label="Karşılaştırmayı Temizle"
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={toggleComparison}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  aria-label="Karşılaştırmayı Kapat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Seçili araçlar gösterimi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Array.from({ length: maxCars }).map((_, index) => (
                  <div key={index} className="relative bg-gray-50 dark:bg-gray-700 rounded-xl p-3 min-h-[200px] flex flex-col items-center justify-center border border-gray-200 dark:border-gray-600">
                    {index < selectedCars.length ? (
                      // Seçilmiş araç gösterimi
                      <div className="w-full">
                        <button
                          onClick={() => removeCar(selectedCars[index].id)}
                          className="absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          aria-label="Aracı Kaldır"
                        >
                          <FaTrashAlt className="w-4 h-4" />
                        </button>
                        
                        <div className="flex flex-col md:flex-row items-center">
                          <div className="w-full md:w-1/3 relative h-32 md:h-40 overflow-hidden rounded-lg">
                            <Image
                              src={getImageUrl(selectedCars[index])}
                              alt={selectedCars[index].baslik}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          <div className="w-full md:w-2/3 p-3">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                              {selectedCars[index].baslik}
                            </h3>
                            <p className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-2">
                              {formatCurrency(selectedCars[index].fiyat)}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <FaCalendarAlt className="text-gray-500 dark:text-gray-400 mr-2" />
                                <span>{selectedCars[index].yil}</span>
                              </div>
                              <div className="flex items-center">
                                <FaTachometerAlt className="text-gray-500 dark:text-gray-400 mr-2" />
                                <span>{(selectedCars[index].kilometre / 1000).toFixed(0)}K km</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Boş slot
                      <div className="text-center">
                        <FaPlus className="w-10 h-10 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Karşılaştırmak için araç ekleyin</p>
                        
                        {/* Araç seçme alanı */}
                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Marka veya model ara..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          
                          {searchTerm && (
                            <div className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              {filteredCars.length > 0 ? (
                                filteredCars.slice(0, 5).map((car) => (
                                  <div
                                    key={car.id}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                                    onClick={() => addCar(car)}
                                  >
                                    <div className="relative w-10 h-10 mr-2 overflow-hidden rounded">
                                      <Image
                                        src={getImageUrl(car)}
                                        alt={car.baslik}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{car.baslik}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{car.yil} • {car.kilometre / 1000}K km</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="p-3 text-sm text-gray-500 dark:text-gray-400">Araç bulunamadı</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Karşılaştırma tablosu - 2 araç seçildiğinde görünür */}
              {selectedCars.length === 2 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Karşılaştırma Detayları</h3>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="p-3 text-left text-gray-600 dark:text-gray-300 font-medium text-sm">Özellik</th>
                          <th className="p-3 text-left text-gray-600 dark:text-gray-300 font-medium text-sm">{selectedCars[0].marka} {selectedCars[0].model}</th>
                          <th className="p-3 text-left text-gray-600 dark:text-gray-300 font-medium text-sm">{selectedCars[1].marka} {selectedCars[1].model}</th>
                          <th className="p-3 text-left text-gray-600 dark:text-gray-300 font-medium text-sm">Fark</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-medium flex items-center">
                            <FaMoneyBillWave className="mr-2 text-green-500" /> Fiyat
                          </td>
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedCars[0].fiyat)}</td>
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedCars[1].fiyat)}</td>
                          <td className="p-3">
                            {selectedCars[0].fiyat && selectedCars[1].fiyat && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCars[0].fiyat > selectedCars[1].fiyat ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                {selectedCars[0].fiyat > selectedCars[1].fiyat ? '+' : '-'}{Math.abs(Number(calculateDifference(selectedCars[0].fiyat, selectedCars[1].fiyat)))}%
                              </span>
                            )}
                          </td>
                        </tr>
                        
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-medium flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-500" /> Yıl
                          </td>
                          <td className="p-3">{selectedCars[0].yil}</td>
                          <td className="p-3">{selectedCars[1].yil}</td>
                          <td className="p-3">
                            {selectedCars[0].yil !== selectedCars[1].yil && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCars[0].yil > selectedCars[1].yil ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                {selectedCars[0].yil > selectedCars[1].yil ? '+' : '-'}{Math.abs(selectedCars[0].yil - selectedCars[1].yil)} yıl
                              </span>
                            )}
                          </td>
                        </tr>
                        
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-medium flex items-center">
                            <FaTachometerAlt className="mr-2 text-purple-500" /> Kilometre
                          </td>
                          <td className="p-3">{selectedCars[0].kilometre.toLocaleString()} km</td>
                          <td className="p-3">{selectedCars[1].kilometre.toLocaleString()} km</td>
                          <td className="p-3">
                            {selectedCars[0].kilometre !== selectedCars[1].kilometre && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCars[0].kilometre < selectedCars[1].kilometre ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                {selectedCars[0].kilometre < selectedCars[1].kilometre ? '-' : '+'}{Math.abs(selectedCars[0].kilometre - selectedCars[1].kilometre).toLocaleString()} km
                              </span>
                            )}
                          </td>
                        </tr>
                        
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-medium flex items-center">
                            <FaGasPump className="mr-2 text-amber-500" /> Yakıt Tipi
                          </td>
                          <td className="p-3">{selectedCars[0].yakit_tipi || 'Belirtilmemiş'}</td>
                          <td className="p-3">{selectedCars[1].yakit_tipi || 'Belirtilmemiş'}</td>
                          <td className="p-3">
                            {selectedCars[0].yakit_tipi !== selectedCars[1].yakit_tipi && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Farklı
                              </span>
                            )}
                          </td>
                        </tr>
                        
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-medium flex items-center">
                            <FaCog className="mr-2 text-gray-500" /> Vites Tipi
                          </td>
                          <td className="p-3">{selectedCars[0].vites_tipi || 'Belirtilmemiş'}</td>
                          <td className="p-3">{selectedCars[1].vites_tipi || 'Belirtilmemiş'}</td>
                          <td className="p-3">
                            {selectedCars[0].vites_tipi !== selectedCars[1].vites_tipi && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Farklı
                              </span>
                            )}
                          </td>
                        </tr>
                        
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <td className="p-3 font-medium flex items-center">
                            <FaPalette className="mr-2 text-pink-500" /> Renk
                          </td>
                          <td className="p-3">{selectedCars[0].renk || 'Belirtilmemiş'}</td>
                          <td className="p-3">{selectedCars[1].renk || 'Belirtilmemiş'}</td>
                          <td className="p-3">
                            {selectedCars[0].renk !== selectedCars[1].renk && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Farklı
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Link
                      href={`/araclar/${selectedCars[0].id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mr-4 transition-colors"
                    >
                      İlk Aracı İncele
                    </Link>
                    <Link
                      href={`/araclar/${selectedCars[1].id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      İkinci Aracı İncele
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 