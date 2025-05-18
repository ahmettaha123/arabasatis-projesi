'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaArrowLeft, FaUser } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface YorumData {
  puan: number;
  yorum: string;
  konu: string;
}

export default function YorumEkleSayfasi({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [arac, setArac] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState<YorumData>({
    puan: 0,
    yorum: '',
    konu: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kullanıcı kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(`/giris?redirect=${encodeURIComponent(`/araclar/${params.id}/yorum`)}`);
          return;
        }
        
        setUser(user);
        
        // Araç bilgilerini getir
        const { data: aracData, error: aracError } = await supabase
          .from('arabalar')
          .select('*, profiller(ad_soyad)')
          .eq('id', params.id)
          .single();
        
        if (aracError) throw aracError;
        
        // Kullanıcı kendi aracına yorum yapamaz
        if (aracData.user_id === user.id) {
          setError('Kendi aracınıza yorum yapamazsınız.');
          setLoading(false);
          return;
        }
        
        // Kullanıcının daha önce yorum yapıp yapmadığını kontrol et
        const { data: mevcutYorum, error: yorumError } = await supabase
          .from('yorumlar')
          .select('*')
          .eq('arac_id', params.id)
          .eq('user_id', user.id)
          .single();
        
        if (mevcutYorum) {
          setError('Bu araç için zaten bir yorum yapmışsınız.');
          setLoading(false);
          return;
        }
        
        setArac(aracData);
        setLoading(false);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router, params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, puan: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (formData.puan === 0) {
      setError('Lütfen bir puan verin.');
      return;
    }
    
    if (!formData.konu.trim()) {
      setError('Lütfen bir konu başlığı girin.');
      return;
    }
    
    if (!formData.yorum.trim()) {
      setError('Lütfen yorum alanını doldurun.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Yorumu kaydet
      const { error } = await supabase
        .from('yorumlar')
        .insert({
          user_id: user.id,
          arac_id: params.id,
          puan: formData.puan,
          konu: formData.konu,
          yorum: formData.yorum
        });
      
      if (error) throw error;
      
      // Araç ortalama puanını güncelle
      const { data: yorumlar, error: yorumlarError } = await supabase
        .from('yorumlar')
        .select('puan')
        .eq('arac_id', params.id);
      
      if (yorumlarError) throw yorumlarError;
      
      if (yorumlar && yorumlar.length > 0) {
        const toplamPuan = yorumlar.reduce((sum, item) => sum + item.puan, 0);
        const ortalamaPuan = toplamPuan / yorumlar.length;
        
        const { error: guncelleError } = await supabase
          .from('arabalar')
          .update({ ortalama_puan: ortalamaPuan, yorum_sayisi: yorumlar.length })
          .eq('id', params.id);
        
        if (guncelleError) throw guncelleError;
      }
      
      setSuccess(true);
      
      // 3 saniye sonra araç detay sayfasına yönlendir
      setTimeout(() => {
        router.push(`/araclar/${params.id}`);
      }, 3000);
      
    } catch (error: any) {
      console.error('Yorum gönderilirken hata:', error);
      setError(error.message || 'Yorum gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href={`/araclar/${params.id}`} 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Araç Detayına Dön
      </Link>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Yorum Yap</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md">
              Yorumunuz başarıyla gönderildi. Teşekkür ederiz! Araç detay sayfasına yönlendiriliyorsunuz...
            </div>
          ) : (
            <>
              {arac && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h2 className="font-semibold mb-2">{arac.baslik}</h2>
                  <p className="text-sm text-gray-600">
                    Satıcı: {arac.profiller.ad_soyad}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Değerlendirme Puanı
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-3xl focus:outline-none"
                      >
                        <FaStar 
                          className={`${
                            (hoverRating ? star <= hoverRating : star <= formData.puan)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-700">
                      {formData.puan > 0 ? `${formData.puan}/5` : ''}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="konu" className="block text-sm font-medium text-gray-700 mb-1">
                    Konu
                  </label>
                  <input
                    type="text"
                    id="konu"
                    name="konu"
                    value={formData.konu}
                    onChange={handleInputChange}
                    placeholder="Yorumunuzun kısa bir başlığı"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label htmlFor="yorum" className="block text-sm font-medium text-gray-700 mb-1">
                    Yorumunuz
                  </label>
                  <textarea
                    id="yorum"
                    name="yorum"
                    value={formData.yorum}
                    onChange={handleInputChange}
                    placeholder="Araç hakkındaki deneyim ve görüşlerinizi paylaşın..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    maxLength={1000}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Gönderiliyor...
                    </>
                  ) : (
                    'Yorumu Gönder'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 