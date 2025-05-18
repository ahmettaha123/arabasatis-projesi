'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaCar, FaTimes, FaUpload, FaArrowRight, FaCheck, FaInfoCircle, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Car, ChevronRight, Image as ImageIcon, Upload, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { aracMarkalari, aracRenkleri, aracOzellikleri, satisDurumu, aracDurumu } from '@/lib/arac-verileri';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@supabase/supabase-js';

const ADIMLAR = [
  { id: 'temel-bilgiler', baslik: 'Temel Bilgiler' },
  { id: 'ozellikler', baslik: 'Özellikler' },
  { id: 'resimler', baslik: 'Fotoğraflar' },
  { id: 'onay', baslik: 'Onay ve Yayın' },
];

// Geçerli resim türleri
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
// Maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function IlanVer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [resimler, setResimler] = useState<File[]>([]);
  const [onizlemeUrlleri, setOnizlemeUrlleri] = useState<string[]>([]);
  const [anaResimIndex, setAnaResimIndex] = useState(0);
  const [seciliOzellikler, setSeciliOzellikler] = useState<string[]>([]);
  const [modeller, setModeller] = useState<string[]>([]);
  const [resimYuklemeHatasi, setResimYuklemeHatasi] = useState('');
  const [userAuthChecked, setUserAuthChecked] = useState(false);
  
  // Form verileri
  const [formData, setFormData] = useState({
    baslik: '',
    marka: '',
    model: '',
    yil: (new Date()).getFullYear().toString(),
    kilometre: '',
    fiyat: '',
    renk: 'Beyaz',
    yakit_tipi: 'Benzin',
    vites_tipi: 'Manuel',
    kasa_tipi: 'Sedan',
    motor_hacmi: '',
    durum: 'İkinci El',
    satis_durumu: 'Sahibinden',
    aciklama: '',
    satici_adi: '',
    satici_telefon: '',
    satici_eposta: ''
  });

  // Satıcı bilgileri (yeni)
  const [saticiIsim, setSaticiIsim] = useState('');
  const [saticiEposta, setSaticiEposta] = useState('');
  const [saticiTelefon, setSaticiTelefon] = useState('');
  
  // İşlem durumları
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Sayfa yüklendiğinde kullanıcı giriş kontrolü yap
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('İlan vermek için giriş yapmalısınız');
          router.push('/giris?redirect=/ilan-ver');
          return;
        }
        
        setUserAuthChecked(true);
        setCurrentUser(user);
        
        // Kullanıcı profilini getir
        const { data, error } = await supabase
          .from('profiller')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          // Profil verisi varsa formu önceden doldur
          setSaticiIsim(data.isim || '');
          setSaticiEposta(data.eposta || user.email || '');
          setSaticiTelefon(data.telefon || '');
        }
      } catch (error) {
        console.error('Kullanıcı kontrolü yapılırken hata:', error);
        toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        router.push('/giris?redirect=/ilan-ver');
      }
    };
    
    checkAuth();
  }, [router]);

  // Marka değiştiğinde modelleri güncelle
  useEffect(() => {
    if (formData.marka) {
      const seciliMarka = aracMarkalari.find(m => m.marka === formData.marka);
      if (seciliMarka) {
        setModeller(seciliMarka.modeller);
        if (!seciliMarka.modeller.includes(formData.model)) {
          setFormData(prev => ({ ...prev, model: '' }));
        }
      } else {
        setModeller([]);
      }
    } else {
      setModeller([]);
    }
  }, [formData.marka]);

  // Başlık oluştur
  useEffect(() => {
    if (formData.marka && formData.model && formData.yil) {
      setFormData(prev => ({
        ...prev,
        baslik: `${formData.marka} ${formData.model} ${formData.yil} ${formData.yakit_tipi} ${formData.vites_tipi}`
      }));
    }
  }, [formData.marka, formData.model, formData.yil, formData.yakit_tipi, formData.vites_tipi]);
  
  const handleResimSecimi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosyalar = e.target.files;
    
    if (!dosyalar) return;
    
    // Maksimum 10 resim kontrolü
    if (resimler.length + dosyalar.length > 10) {
      setResimYuklemeHatasi('En fazla 10 resim yükleyebilirsiniz');
      return;
    }
    
    setResimYuklemeHatasi('');
    const yeniResimler: File[] = [];
    const yeniOnizlemeler: string[] = [];
    
    for (let i = 0; i < dosyalar.length; i++) {
      const dosya = dosyalar[i];
      
      // Sadece görsel dosyalarını kabul et
      if (!dosya.type.startsWith('image/')) {
        setResimYuklemeHatasi('Lütfen sadece resim dosyaları seçin');
        continue;
      }
      
      // 5MB boyut kontrolü
      if (dosya.size > 5 * 1024 * 1024) {
        setResimYuklemeHatasi('Resimler 5MB\'dan küçük olmalıdır');
        continue;
      }
      
      // Görsel boyutlarını kontrol et
      const dosyaURL = URL.createObjectURL(dosya);
      const img = document.createElement('img');
      img.onload = () => {
        // Görsel boyutu çok küçükse uyarı ver
        if (img.width < 800 || img.height < 600) {
          setResimYuklemeHatasi('Resimler en az 800x600 piksel boyutunda olmalıdır');
        }
      };
      img.src = dosyaURL;
      
      yeniResimler.push(dosya);
      yeniOnizlemeler.push(dosyaURL);
    }
    
    setResimler([...resimler, ...yeniResimler]);
    setOnizlemeUrlleri([...onizlemeUrlleri, ...yeniOnizlemeler]);
  };
  
  const resimSil = (index: number) => {
    const yeniResimler = [...resimler];
    const yeniOnizlemeler = [...onizlemeUrlleri];
    
    yeniResimler.splice(index, 1);
    URL.revokeObjectURL(yeniOnizlemeler[index]);
    yeniOnizlemeler.splice(index, 1);
    
    setResimler(yeniResimler);
    setOnizlemeUrlleri(yeniOnizlemeler);
    
    // Ana resim indeksi güncelle
    if (anaResimIndex === index) {
      setAnaResimIndex(0);
    } else if (anaResimIndex > index) {
      setAnaResimIndex(anaResimIndex - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleOzellikChange = (ozellik: string, checked: boolean) => {
    if (checked) {
      setSeciliOzellikler([...seciliOzellikler, ozellik]);
    } else {
      setSeciliOzellikler(seciliOzellikler.filter(item => item !== ozellik));
    }
  };

  const ileriGit = () => {
    if (activeStep === 0 && formValidation()) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (resimler.length === 0) {
        toast.error('Lütfen en az bir resim yükleyin');
        return;
      }
      setActiveStep(3);
    }
  };

  const geriGit = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const formValidation = () => {
    // Temel bilgiler için validasyon
    if (!formData.marka) {
      toast.error('Lütfen marka seçin');
      return false;
    }
    if (!formData.model) {
      toast.error('Lütfen model seçin');
      return false;
    }
    if (!formData.yil) {
      toast.error('Lütfen yıl girin');
      return false;
    }
    if (!formData.kilometre) {
      toast.error('Lütfen kilometre bilgisi girin');
      return false;
    }
    if (!formData.fiyat) {
      toast.error('Lütfen fiyat girin');
      return false;
    }
    if (!formData.satici_adi) {
      toast.error('Lütfen satıcı adını girin');
      return false;
    }
    if (!formData.satici_telefon) {
      toast.error('Lütfen satıcı telefon numarasını girin');
      return false;
    }
    if (!formData.satici_eposta) {
      toast.error('Lütfen satıcı e-posta adresini girin');
      return false;
    }
    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.satici_eposta)) {
      toast.error('Lütfen geçerli bir e-posta adresi girin');
      return false;
    }
    // Telefon numarası formatı kontrolü (Türkiye formatı)
    const phoneRegex = /^(05)[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/;
    if (!phoneRegex.test(formData.satici_telefon)) {
      toast.error('Lütfen geçerli bir telefon numarası girin (05XXXXXXXXX)');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resimler.length === 0) {
      toast.error('Lütfen en az bir resim yükleyin');
      return;
    }

    // Resim kontrolü
    if (resimler.length < 3) {
      toast.error('Lütfen en az 3 resim yükleyin');
      return;
    }
    
    try {
      setLoading(true);
      
      // Kullanıcı oturum bilgisini kontrol et
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        toast.error('İlan vermek için giriş yapmalısınız');
        router.push('/giris?redirect=/ilan-ver');
        return;
      }
      
      console.log('İlan oluşturma başlatılıyor:', {
        marka: formData.marka,
        model: formData.model,
        resimSayisi: resimler.length
      });
      
      // Araç kaydını oluştur
      const { data: araba, error: arabaError } = await supabase
        .from('arabalar')
        .insert({
          baslik: formData.baslik,
          marka: formData.marka,
          model: formData.model,
          yil: parseInt(formData.yil),
          kilometre: parseInt(formData.kilometre),
          fiyat: parseFloat(formData.fiyat),
          renk: formData.renk,
          yakit_tipi: formData.yakit_tipi,
          vites_tipi: formData.vites_tipi,
          kasa_tipi: formData.kasa_tipi,
          motor_hacmi: parseFloat(formData.motor_hacmi || '0'),
          durum: formData.durum,
          satis_durumu: formData.satis_durumu,
          aciklama: formData.aciklama,
          ozellikler: seciliOzellikler,
          sahibi: userData.user.id,
          satici_adi: formData.satici_adi,
          satici_telefon: formData.satici_telefon,
          satici_eposta: formData.satici_eposta,
          goruntuleme: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (arabaError) {
        console.error('Araç kaydı oluşturma hatası:', arabaError);
        throw new Error(`Araç kaydı oluşturulamadı: ${arabaError.message}`);
      }
      
      console.log('Araç kaydı oluşturuldu:', araba);
      
      // Resimleri yükle
      for (let i = 0; i < resimler.length; i++) {
        const dosya = resimler[i];
        const dosyaAdi = `${araba.id}/${Date.now()}-${i}-${dosya.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        console.log(`${i+1}/${resimler.length} resim yükleniyor:`, dosyaAdi);
        
        try {
          // Storage'a yükle
          const { error: uploadError } = await supabase.storage
            .from('arabalar')
            .upload(dosyaAdi, dosya);
          
          if (uploadError) {
            console.error(`Resim yükleme hatası (${i+1}/${resimler.length}):`, uploadError);
            toast.error(`${i+1}. resim yüklenemedi. Diğer resimler yükleniyor...`);
            continue; // Bir resim yüklenemezse diğerlerine devam et
          }
          
          // Public URL al
          const { data: publicURLData } = supabase.storage
            .from('arabalar')
            .getPublicUrl(dosyaAdi);
          
          if (!publicURLData?.publicUrl) {
            console.error(`Resim URL alınamadı (${i+1}/${resimler.length})`);
            continue;
          }
          
          // Resim bilgisini veritabanına kaydet
          const { error: resimError } = await supabase
            .from('resimler')
            .insert({
              araba_id: araba.id,
              url: publicURLData.publicUrl,
              siralama: i === anaResimIndex ? 1 : i + 2, // Ana resim 1, diğerleri 2-n
              ana_resim: i === anaResimIndex
            });
          
          if (resimError) {
            console.error(`Resim kaydı hatası (${i+1}/${resimler.length}):`, resimError);
            toast.error(`${i+1}. resim kaydedilemedi`);
          } else {
            console.log(`${i+1}/${resimler.length} resim başarıyla yüklendi`);
          }
        } catch (resimHatasi) {
          console.error(`Resim işleme hatası (${i+1}/${resimler.length}):`, resimHatasi);
        }
      }
      
      console.log('İlan oluşturma tamamlandı. Yönlendiriliyor:', `/araclar/${araba.id}`);
      toast.success('İlanınız başarıyla oluşturuldu');
      router.push(`/araclar/${araba.id}`);
    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      toast.error('İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Kullanıcı girişi kontrol edilene kadar loading göster
  if (!userAuthChecked) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Araç İlanı Oluştur</h1>
        <p className="text-slate-600 dark:text-slate-400">Aracınızı satmak için gerekli bilgileri doldurun.</p>
      </div>

      {/* Adım göstergeleri */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {ADIMLAR.map((adim, index) => (
            <div key={adim.id} className="flex flex-col items-center flex-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  index < activeStep 
                    ? 'bg-green-500 text-white'
                    : index === activeStep 
                      ? 'bg-blue-600 text-white dark:bg-blue-500' 
                      : 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {index < activeStep ? (
                  <FaCheck />
                ) : (
                  index + 1
                )}
              </div>
              <div className={`text-sm font-medium ${
                index <= activeStep 
                  ? 'text-slate-800 dark:text-slate-200' 
                  : 'text-slate-500 dark:text-slate-500'
              }`}>
                {adim.baslik}
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700"></div>
          <div 
            className="absolute left-0 h-1 bg-blue-600 dark:bg-blue-500 transition-all duration-500"
            style={{ width: `${(activeStep / (ADIMLAR.length - 1)) * 100}%` }}  
          ></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSubmit}>
          {/* Adım 1: Temel Bilgiler */}
          {activeStep === 0 && (
            <div className="fade-in">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center">
                <Car className="mr-2 text-blue-600 dark:text-blue-400" />
                Temel Araç Bilgileri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="marka" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Marka*
                  </label>
                  <Select
                    value={formData.marka}
                    onValueChange={(value) => handleSelectChange('marka', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Marka seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {aracMarkalari.map((marka) => (
                          <SelectItem key={marka.marka} value={marka.marka}>
                            {marka.marka}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Model*
                  </label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => handleSelectChange('model', value)}
                    disabled={!formData.marka}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={formData.marka ? "Model seçin" : "Önce marka seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {modeller.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="yil" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Model Yılı*
                  </label>
                  <Select
                    value={formData.yil}
                    onValueChange={(value) => handleSelectChange('yil', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Yıl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((yil) => (
                          <SelectItem key={yil} value={yil.toString()}>
                            {yil}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="durum" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Araç Durumu*
                  </label>
                  <Select
                    value={formData.durum}
                    onValueChange={(value) => handleSelectChange('durum', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Araç durumunu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {aracDurumu.map((durum) => (
                          <SelectItem key={durum} value={durum}>
                            {durum}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="kilometre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Kilometre*
                  </label>
                  <input
                    type="number"
                    id="kilometre"
                    name="kilometre"
                    value={formData.kilometre}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="input"
                    placeholder="Örn: 45000"
                  />
                </div>
                
                <div>
                  <label htmlFor="fiyat" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Fiyat (TL)*
                  </label>
                  <input
                    type="number"
                    id="fiyat"
                    name="fiyat"
                    value={formData.fiyat}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="input"
                    placeholder="Örn: 450000"
                  />
                  {formData.fiyat && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {formatCurrency(parseInt(formData.fiyat))}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="yakit_tipi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Yakıt Türü*
                  </label>
                  <Select
                    value={formData.yakit_tipi}
                    onValueChange={(value) => handleSelectChange('yakit_tipi', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Yakıt türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Benzin">Benzin</SelectItem>
                        <SelectItem value="Dizel">Dizel</SelectItem>
                        <SelectItem value="LPG">LPG</SelectItem>
                        <SelectItem value="Elektrik">Elektrik</SelectItem>
                        <SelectItem value="Hibrit">Hibrit</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="vites_tipi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Vites Türü*
                  </label>
                  <Select
                    value={formData.vites_tipi}
                    onValueChange={(value) => handleSelectChange('vites_tipi', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vites türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Manuel">Manuel</SelectItem>
                        <SelectItem value="Otomatik">Otomatik</SelectItem>
                        <SelectItem value="Yarı Otomatik">Yarı Otomatik</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="renk" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Renk*
                  </label>
                  <Select
                    value={formData.renk}
                    onValueChange={(value) => handleSelectChange('renk', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {aracRenkleri.map((renk) => (
                          <SelectItem key={renk} value={renk}>
                            {renk}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="kasa_tipi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Kasa Tipi*
                  </label>
                  <Select
                    value={formData.kasa_tipi}
                    onValueChange={(value) => handleSelectChange('kasa_tipi', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kasa tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                        <SelectItem value="Station Wagon">Station Wagon</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Crossover">Crossover</SelectItem>
                        <SelectItem value="Coupe">Coupe</SelectItem>
                        <SelectItem value="Convertible">Cabrio</SelectItem>
                        <SelectItem value="Pick-up">Pick-up</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Minivan">Minivan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="motor_hacmi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Motor Hacmi (L)
                  </label>
                  <input
                    type="number"
                    id="motor_hacmi"
                    name="motor_hacmi"
                    value={formData.motor_hacmi}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    className="input"
                    placeholder="Örn: 1.6"
                  />
                </div>
                
                <div>
                  <label htmlFor="satis_durumu" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Satış Durumu
                  </label>
                  <Select
                    value={formData.satis_durumu}
                    onValueChange={(value) => handleSelectChange('satis_durumu', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Satış durumu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {satisDurumu.map((durum) => (
                          <SelectItem key={durum} value={durum}>
                            {durum}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Adım 2: Özellikler */}
          {activeStep === 1 && (
            <div className="fade-in">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center">
                <CheckCircle className="mr-2 text-blue-600 dark:text-blue-400" />
                Araç Özellikleri
              </h2>

              <div className="mb-6">
                <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3">İlan Başlığı</h3>
                <input
                  type="text"
                  id="baslik"
                  name="baslik"
                  value={formData.baslik}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="İlan başlığı"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Otomatik oluşturulan başlığı düzenleyebilirsiniz.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3">Açıklama</h3>
                <textarea
                  id="aciklama"
                  name="aciklama"
                  value={formData.aciklama}
                  onChange={handleInputChange}
                  rows={5}
                  className="input"
                  placeholder="Aracınız hakkında detaylı bilgi verin..."
                ></textarea>
              </div>

              <div>
                <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3">Araç Özellikleri</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {aracOzellikleri.map((ozellik) => (
                    <div key={ozellik} className="flex items-center space-x-2">
                      <Checkbox 
                        id={ozellik} 
                        checked={seciliOzellikler.includes(ozellik)}
                        onCheckedChange={(checked) => handleOzellikChange(ozellik, checked === true)}
                      />
                      <label
                        htmlFor={ozellik}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
                      >
                        {ozellik}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Adım 3: Fotoğraflar */}
          {activeStep === 2 && (
            <div className="fade-in">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center">
                <ImageIcon className="mr-2 text-blue-600 dark:text-blue-400" />
                Araç Fotoğrafları
              </h2>

              {resimYuklemeHatasi && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span>{resimYuklemeHatasi}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6">
                {onizlemeUrlleri.map((url, index) => (
                  <div 
                    key={index} 
                    className={`relative w-32 h-32 rounded-lg overflow-hidden border-2 ${
                      index === anaResimIndex ? 'border-blue-600 dark:border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Image 
                      src={url} 
                      alt={`Resim ${index + 1}`} 
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                    <button
                      type="button"
                      onClick={() => resimSil(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      aria-label="Resmi sil"
                    >
                      <FaTimes size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnaResimIndex(index)}
                      className={`absolute bottom-1 right-1 bg-blue-600 dark:bg-blue-500 text-white rounded-full p-1 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors ${
                        index === anaResimIndex ? 'opacity-100' : 'opacity-70'
                      }`}
                      aria-label="Ana resim olarak ayarla"
                    >
                      <FaCar size={12} />
                    </button>
                  </div>
                ))}
                
                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors">
                  <Upload className="text-slate-400 dark:text-slate-500 mb-2" size={24} />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Resim Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleResimSecimi}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex items-start mt-4">
                <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p className="mb-1">İlan için en az bir resim gereklidir. En fazla 10 resim yükleyebilirsiniz.</p>
                  <p>Ana resim olarak ayarlamak istediğiniz resmin üzerindeki araba ikonuna tıklayın.</p>
                </div>
              </div>
            </div>
          )}

          {/* Adım 4: Onay ve Yayın */}
          {activeStep === 3 && (
            <div className="fade-in">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center">
                <CreditCard className="mr-2 text-blue-600 dark:text-blue-400" />
                İlanınızı Yayınlayın
              </h2>

              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">İlan Özeti</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Başlık</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.baslik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fiyat</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.fiyat && formatCurrency(parseInt(formData.fiyat))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Marka/Model</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.marka} {formData.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Yıl/Kilometre</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.yil} | {formData.kilometre && parseInt(formData.kilometre).toLocaleString('tr-TR')} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Yakıt/Vites</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.yakit_tipi} | {formData.vites_tipi}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Renk</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.renk}</p>
                  </div>
                </div>

                {onizlemeUrlleri.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Ana Görsel</p>
                    <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image 
                        src={onizlemeUrlleri[anaResimIndex]} 
                        alt="Ana Görsel" 
                        className="w-full h-full object-cover"
                        width={160}
                        height={112}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    İlanınız yayınlandıktan sonra, 24 saat içinde incelenerek onaylanacaktır. 
                    İlanınızın onaylanıp yayınlandığı size e-posta ile bildirilecektir.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Satıcı Bilgileri */}
          <div className="mt-10 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center">
              <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
              Satıcı Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="satici_adi" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Satıcı Adı Soyadı*
                </label>
                <input
                  type="text"
                  id="satici_adi"
                  name="satici_adi"
                  value={formData.satici_adi}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="Adınız ve soyadınız"
                />
              </div>
              
              <div>
                <label htmlFor="satici_telefon" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Telefon Numarası*
                </label>
                <input
                  type="tel"
                  id="satici_telefon"
                  name="satici_telefon"
                  value={formData.satici_telefon}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="05XXXXXXXXX"
                  maxLength={11}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Format: 05XXXXXXXXX (Başında 0 olmalı)
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="satici_eposta" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  E-posta Adresi*
                </label>
                <input
                  type="email"
                  id="satici_eposta"
                  name="satici_eposta"
                  value={formData.satici_eposta}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="ornek@eposta.com"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  İlgilenen alıcılar sizinle bu e-posta üzerinden iletişime geçebilir
                </p>
              </div>
            </div>
          </div>
          
          {/* Ayrıntılı Açıklama */}
          <div className="mt-10">
            <label htmlFor="aciklama" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              İlan Açıklaması
            </label>
            <textarea
              id="aciklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleInputChange}
              className="w-full h-32 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Aracınız hakkında daha fazla bilgi verin..."
            ></textarea>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Aracınızın özellikleri, kullanım geçmişi, bakım durumu gibi detayları paylaşabilirsiniz.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-8">
            <div className="flex">
              <FaInfoCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  İlan oluşturabilmek için satıcı bilgilerinizin eksiksiz ve doğru olması gerekmektedir. 
                  Bu bilgiler alıcıların sizinle iletişime geçebilmesi için kullanılacaktır.
                </p>
              </div>
            </div>
          </div>
          
          {/* Butonlar */}
          <div className="flex justify-between mt-10">
            <button
              type="button"
              onClick={geriGit}
              disabled={activeStep === 0}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeStep === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Geri
            </button>
            
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={ileriGit}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                İleri
                <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    İlan Oluşturuluyor...
                  </>
                ) : (
                  <>
                    İlanı Yayınla
                    <FaCheck className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 