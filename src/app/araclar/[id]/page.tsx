'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FaCar, FaGasPump, FaTachometerAlt, FaCalendarAlt, FaCog, FaPhone, FaEnvelope, FaUser, FaMapMarkerAlt, FaHeart, FaShareAlt } from 'react-icons/fa';
import Car3DViewer from '@/components/Car3DViewer';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Heart, Share, Car, Calendar, MapPin, Fuel, Gauge, Zap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { CarFeatures } from "@/components/CarFeatures";
import { CarSpecTable } from "@/components/CarSpecTable";
import { SellerContactCard } from "@/components/SellerContactCard";
import { CarGrid } from "@/components/CarGrid";

// Separator bileşenini doğrudan burada tanımlayalım
function Separator({ className = '' }: { className?: string }) {
  return (
    <div className={`h-[1px] w-full bg-gray-200 dark:bg-gray-700 ${className}`}></div>
  );
}

interface AracDetay {
  id: string;
  baslik: string;
  marka: string;
  model: string;
  yil: number;
  kilometre: number;
  yakit_tipi: string;
  vites_tipi: string;
  motor_hacmi: string;
  renk: string;
  fiyat: number;
  aciklama: string;
  gorsel_url: string[];
  satici_id: string;
  satici_isim: string;
  satici_tel: string;
  satici_email: string;
  konum: string;
  created_at: string;
}

async function getCarById(id: string) {
  const { data, error } = await supabase
    .from('araclar')
    .select(`
      *,
      satici:satici_id (*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getSimilarCars(id: string, marka: string, model: string) {
  const { data } = await supabase
    .from('araclar')
    .select('*')
    .neq('id', id)
    .eq('marka', marka)
    .eq('model', model)
    .limit(4);

  return data || [];
}

export default function CarDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [car, setCar] = useState<any>(null);
  const [similarCars, setSimilarCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const carData = await getCarById(id);
        
        if (!carData) {
          setError(true);
          return;
        }
        
        setCar(carData);
        
        const similar = await getSimilarCars(id, carData.marka, carData.model);
        setSimilarCars(similar);
      } catch (err) {
        console.error('Veri yüklenirken hata oluştu:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="animate-pulse h-16 w-16 rounded-full bg-blue-500/50"></div>
      </div>
    );
  }
  
  if (error || !car) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-10">
      {/* Üst bilgi ve butonlar */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/araclar" className="flex items-center gap-1 hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span>Araçlara dön</span>
            </Link>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold">{car.marka} {car.model}</h1>
          <p className="text-lg text-muted-foreground">{car.model_yili} • {car.kilometre} km • {car.yakit_tipi} • {car.vites_tipi}</p>
        </div>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span>Favorilere Ekle</span>
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            <span>Paylaş</span>
          </Button>
        </div>
      </div>
      
      {/* Fiyat bilgisi ve listeleme tarihi (mobil) */}
      <div className="md:hidden bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold text-primary">{formatCurrency(car.fiyat)}</div>
          <div className="text-sm text-muted-foreground">Yayınlanma: {formatDate(car.created_at)}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Fotoğraf galerisi */}
          <div className="bg-muted rounded-xl overflow-hidden">
            <GalleryCarousel images={car.fotograf_urls} />
          </div>
          
          {/* İlan açıklaması */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">İlan Açıklaması</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>{car.aciklama}</p>
            </div>
          </div>
          
          {/* Araç özellikleri */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Araç Özellikleri</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CarSpecTable car={car} />
              <CarFeatures features={car.ozellikler || []} />
            </div>
          </div>
          
          {/* Konum bilgisi */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Konum</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{car.konum}</span>
            </div>
            
            {/* Harita yerleştirilecek yer */}
            <div className="mt-4 aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Konum haritası
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Fiyat bilgisi ve listeleme tarihi (desktop) */}
          <div className="hidden md:block bg-card rounded-xl p-6 shadow-sm">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{formatCurrency(car.fiyat)}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Yayınlanma: {formatDate(car.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Satıcı iletişim kartı */}
          <SellerContactCard seller={car.satici} />
          
          {/* Hızlı bakış */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Hızlı Bakış</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Car className="h-6 w-6 text-primary mb-1" />
                <div className="text-xs text-center text-muted-foreground">Model</div>
                <div className="text-sm font-medium text-center">{car.model}</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Calendar className="h-6 w-6 text-primary mb-1" />
                <div className="text-xs text-center text-muted-foreground">Yıl</div>
                <div className="text-sm font-medium text-center">{car.model_yili}</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Gauge className="h-6 w-6 text-primary mb-1" />
                <div className="text-xs text-center text-muted-foreground">Kilometre</div>
                <div className="text-sm font-medium text-center">{car.kilometre} km</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Fuel className="h-6 w-6 text-primary mb-1" />
                <div className="text-xs text-center text-muted-foreground">Yakıt</div>
                <div className="text-sm font-medium text-center">{car.yakit_tipi}</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Zap className="h-6 w-6 text-primary mb-1" />
                <div className="text-xs text-center text-muted-foreground">Vites</div>
                <div className="text-sm font-medium text-center">{car.vites_tipi}</div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Briefcase className="h-6 w-6 text-primary mb-1" />
                <div className="text-xs text-center text-muted-foreground">Durum</div>
                <div className="text-sm font-medium text-center">{car.durum || "İkinci El"}</div>
              </div>
            </div>
          </div>
          
          {/* Güvenlik ipuçları */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-4">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Güvenlik İpuçları</h3>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Aracı görmeden kapora ödemeyin</li>
              <li>• Banka hesabınıza erişim vermeyin</li>
              <li>• Şüpheli işlemlerde alışverişi durdurun</li>
              <li>• İlanı resmi kanallar dışında yürütmeyin</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Benzer araçlar */}
      {similarCars.length > 0 && (
        <div className="pt-4">
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-6">Benzer Araçlar</h2>
          <CarGrid cars={similarCars} />
        </div>
      )}
    </div>
  );
} 