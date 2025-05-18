'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaPaperPlane, FaAngleLeft, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface Mesaj {
  id: string;
  gonderen_id: string;
  alici_id: string;
  arac_id: string;
  icerik: string;
  okundu: boolean;
  created_at: string;
}

interface MesajGrubu {
  kullanici_id: string;
  kullanici_adi: string;
  kullanici_resim?: string;
  arac_id: string;
  arac_baslik: string;
  son_mesaj: string;
  son_mesaj_tarihi: string;
  okunmamis_sayisi: number;
}

interface Kullanici {
  id: string;
  ad_soyad: string;
  resim_url: string;
}

export default function MesajlarSayfasi() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mesajGruplari, setMesajGruplari] = useState<MesajGrubu[]>([]);
  const [seciliGrup, setSeciliGrup] = useState<string | null>(null);
  const [seciliKullanici, setSeciliKullanici] = useState<Kullanici | null>(null);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [loading, setLoading] = useState(true);
  const [mesajYukleniyor, setMesajYukleniyor] = useState(false);
  const mesajlarEndRef = useRef<HTMLDivElement>(null);

  // Kullanıcı kontrolü ve mesaj grupları
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/giris');
        return;
      }
      
      setUser(user);
      
      // Mesaj gruplarını al
      await getMesajGruplari(user.id);
      
      setLoading(false);
    };
    
    fetchUserAndMessages();
    
    // Gerçek zamanlı mesaj aboneliği
    const mesajSubscription = supabase
      .channel('mesajlar-kanal')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mesajlar' }, 
        async (payload) => {
          const yeniMesaj = payload.new as Mesaj;
          
          // Şu anki kullanıcı mesajın alıcısı veya göndericisiyse
          if (yeniMesaj.alici_id === user?.id || yeniMesaj.gonderen_id === user?.id) {
            // Mesaj şu an açık olan konuşmaya aitse
            if (seciliGrup && 
                ((yeniMesaj.gonderen_id === seciliGrup && yeniMesaj.alici_id === user?.id) || 
                (yeniMesaj.alici_id === seciliGrup && yeniMesaj.gonderen_id === user?.id))) {
              setMesajlar(prev => [...prev, yeniMesaj]);
              mesajlariOkunduOlarakIsaretle(seciliGrup);
            }
            
            // Mesaj gruplarını güncelle
            getMesajGruplari(user.id);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(mesajSubscription);
    };
  }, [router, seciliGrup]);

  // Mesajların en altına kaydırma
  useEffect(() => {
    if (mesajlarEndRef.current) {
      mesajlarEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mesajlar]);

  // Mesaj gruplarını getir
  const getMesajGruplari = async (userId: string) => {
    try {
      // Gönderilen mesajlar
      const { data: gonderilen, error: gonderilenError } = await supabase
        .from('mesajlar')
        .select(`
          id,
          gonderen_id,
          alici_id,
          arac_id,
          icerik,
          okundu,
          created_at,
          arabalar!inner(baslik)
        `)
        .eq('gonderen_id', userId)
        .order('created_at', { ascending: false });
      
      if (gonderilenError) throw gonderilenError;
      
      // Alınan mesajlar
      const { data: alinan, error: alinanError } = await supabase
        .from('mesajlar')
        .select(`
          id,
          gonderen_id,
          alici_id,
          arac_id,
          icerik,
          okundu,
          created_at,
          arabalar!inner(baslik)
        `)
        .eq('alici_id', userId)
        .order('created_at', { ascending: false });
      
      if (alinanError) throw alinanError;
      
      // Tüm mesajları birleştir
      const tumMesajlar = [...gonderilen, ...alinan];
      
      // Konuşma gruplarını oluştur
      const gruplar: { [key: string]: MesajGrubu } = {};
      
      for (const mesaj of tumMesajlar) {
        const digerKullaniciId = mesaj.gonderen_id === userId ? mesaj.alici_id : mesaj.gonderen_id;
        
        if (!gruplar[digerKullaniciId]) {
          // Diğer kullanıcının bilgilerini al
          const { data: kullanici } = await supabase
            .from('profiller')
            .select('ad_soyad, resim_url')
            .eq('id', digerKullaniciId)
            .single();
          
          gruplar[digerKullaniciId] = {
            kullanici_id: digerKullaniciId,
            kullanici_adi: kullanici?.ad_soyad || 'Bilinmeyen Kullanıcı',
            kullanici_resim: kullanici?.resim_url,
            arac_id: mesaj.arac_id,
            arac_baslik: mesaj.arabalar.baslik,
            son_mesaj: mesaj.icerik,
            son_mesaj_tarihi: mesaj.created_at,
            okunmamis_sayisi: mesaj.alici_id === userId && !mesaj.okundu ? 1 : 0
          };
        } else {
          // Son mesaj tarihini kontrol et ve güncelle
          const mevcutTarih = new Date(gruplar[digerKullaniciId].son_mesaj_tarihi);
          const yeniTarih = new Date(mesaj.created_at);
          
          if (yeniTarih > mevcutTarih) {
            gruplar[digerKullaniciId].son_mesaj = mesaj.icerik;
            gruplar[digerKullaniciId].son_mesaj_tarihi = mesaj.created_at;
          }
          
          // Okunmamış mesaj sayısını güncelle
          if (mesaj.alici_id === userId && !mesaj.okundu) {
            gruplar[digerKullaniciId].okunmamis_sayisi += 1;
          }
        }
      }
      
      // Grupları son mesaj tarihine göre sırala
      const siralanmisGruplar = Object.values(gruplar).sort((a, b) => 
        new Date(b.son_mesaj_tarihi).getTime() - new Date(a.son_mesaj_tarihi).getTime()
      );
      
      setMesajGruplari(siralanmisGruplar);
      
    } catch (error) {
      console.error('Mesaj grupları alınamadı:', error);
    }
  };

  // Mesajları getir
  const getMesajlar = async (digerKullaniciId: string) => {
    try {
      setMesajYukleniyor(true);
      setMesajlar([]);
      
      const { data: kullanici } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', digerKullaniciId)
        .single();
      
      setSeciliKullanici(kullanici);
      
      // İki kullanıcı arasındaki tüm mesajları getir
      const { data, error } = await supabase
        .from('mesajlar')
        .select('*')
        .or(`gonderen_id.eq.${user.id},alici_id.eq.${user.id}`)
        .or(`gonderen_id.eq.${digerKullaniciId},alici_id.eq.${digerKullaniciId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Sadece iki kullanıcı arasındaki mesajları filtrele
      const filtrelenmisData = data.filter(
        mesaj => 
          (mesaj.gonderen_id === user.id && mesaj.alici_id === digerKullaniciId) || 
          (mesaj.gonderen_id === digerKullaniciId && mesaj.alici_id === user.id)
      );
      
      setMesajlar(filtrelenmisData);
      
      // Mesajları okundu olarak işaretle
      mesajlariOkunduOlarakIsaretle(digerKullaniciId);
      
    } catch (error) {
      console.error('Mesajlar alınamadı:', error);
    } finally {
      setMesajYukleniyor(false);
    }
  };

  // Mesaj gönder
  const mesajGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yeniMesaj.trim() || !seciliGrup) return;
    
    try {
      const aracId = mesajGruplari.find(g => g.kullanici_id === seciliGrup)?.arac_id;
      
      const { error } = await supabase
        .from('mesajlar')
        .insert({
          gonderen_id: user.id,
          alici_id: seciliGrup,
          arac_id: aracId,
          icerik: yeniMesaj,
          okundu: false
        });
      
      if (error) throw error;
      
      setYeniMesaj('');
      
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  // Mesajları okundu olarak işaretle
  const mesajlariOkunduOlarakIsaretle = async (gonderenId: string) => {
    try {
      const { error } = await supabase
        .from('mesajlar')
        .update({ okundu: true })
        .eq('gonderen_id', gonderenId)
        .eq('alici_id', user.id)
        .eq('okundu', false);
      
      if (error) throw error;
      
      // Mesaj gruplarını güncelle
      await getMesajGruplari(user.id);
      
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenemedi:', error);
    }
  };

  // Tarih formatla
  const formatTarih = (tarih: string) => {
    const date = new Date(tarih);
    const bugun = new Date();
    
    if (date.toDateString() === bugun.toDateString()) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
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
      <h1 className="text-2xl font-bold mb-8">Mesajlarım</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="md:flex h-[70vh]">
          {/* Sol Taraf - Konuşma Listesi */}
          <div className={`md:w-1/3 border-r overflow-y-auto ${seciliGrup && 'hidden md:block'}`}>
            {mesajGruplari.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <FaUser className="text-2xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Henüz mesajınız yok</h3>
                <p className="text-gray-500 mb-4">Araçlarla ilgili satıcılarla iletişime geçtiğinizde burada görünecektir.</p>
                <Link href="/araclar" className="text-blue-600 hover:underline">
                  Araçları Keşfedin
                </Link>
              </div>
            ) : (
              <ul>
                {mesajGruplari.map((grup) => (
                  <li 
                    key={grup.kullanici_id}
                    onClick={() => {
                      setSeciliGrup(grup.kullanici_id);
                      getMesajlar(grup.kullanici_id);
                    }}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      seciliGrup === grup.kullanici_id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                        {grup.kullanici_resim ? (
                          <Image 
                            src={grup.kullanici_resim} 
                            alt={grup.kullanici_adi}
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
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-semibold truncate">{grup.kullanici_adi}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTarih(grup.son_mesaj_tarihi)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {grup.son_mesaj}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {grup.arac_baslik}
                        </p>
                      </div>
                      {grup.okunmamis_sayisi > 0 && (
                        <div className="ml-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                          {grup.okunmamis_sayisi}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Sağ Taraf - Mesajlaşma */}
          <div className={`md:w-2/3 flex flex-col h-full ${!seciliGrup && 'hidden md:flex'}`}>
            {!seciliGrup ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <FaPaperPlane className="text-2xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mesajlaşmaya Başlayın</h3>
                <p className="text-gray-500">
                  Sol taraftan bir konuşma seçin veya bir araç sayfasından satıcıyla iletişime geçin.
                </p>
              </div>
            ) : (
              <>
                {/* Mesaj Başlığı */}
                <div className="p-4 border-b flex items-center">
                  <button 
                    onClick={() => setSeciliGrup(null)}
                    className="mr-3 md:hidden"
                  >
                    <FaArrowLeft />
                  </button>
                  
                  {seciliKullanici && (
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                        {seciliKullanici.resim_url ? (
                          <Image 
                            src={seciliKullanici.resim_url} 
                            alt={seciliKullanici.ad_soyad}
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
                        <h3 className="font-semibold">{seciliKullanici.ad_soyad}</h3>
                        <p className="text-xs text-gray-500">
                          {mesajGruplari.find(g => g.kullanici_id === seciliGrup)?.arac_baslik}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Mesaj İçeriği */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mesajYukleniyor ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : mesajlar.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-gray-500">Henüz mesaj yok. Bir mesaj göndererek sohbete başlayın.</p>
                    </div>
                  ) : (
                    mesajlar.map((mesaj) => (
                      <div 
                        key={mesaj.id}
                        className={`flex ${mesaj.gonderen_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[75%] rounded-lg p-3 ${
                            mesaj.gonderen_id === user.id 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-gray-100 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p>{mesaj.icerik}</p>
                          <div 
                            className={`text-xs mt-1 text-right ${
                              mesaj.gonderen_id === user.id ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            {formatTarih(mesaj.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={mesajlarEndRef} />
                </div>
                
                {/* Mesaj Giriş Formu */}
                <div className="p-4 border-t">
                  <form onSubmit={mesajGonder} className="flex items-center">
                    <input
                      type="text"
                      value={yeniMesaj}
                      onChange={(e) => setYeniMesaj(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 