export type Car = {
  id: number;
  created_at: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string;
  description: string;
  features: string[];
  images: string[];
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  location: string;
  is_sold: boolean;
}

export type FuelType = 'benzin' | 'dizel' | 'lpg' | 'elektrik' | 'hibrit';
export type Transmission = 'manuel' | 'otomatik' | 'yarı otomatik';

export type CarFilter = {
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  color?: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      arabalar: {
        Row: {
          id: string
          baslik: string
          marka: string
          model: string
          yil: number
          kilometre: number
          fiyat: number
          renk: string
          yakit_tipi: string
          vites_tipi: string
          kasa_tipi: string
          motor_hacmi: number
          aciklama: string
          durum: string
          satis_durumu: string
          ozellikler: string[]
          sahibi: string
          goruntuleme: number
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          baslik: string
          marka: string
          model: string
          yil: number
          kilometre: number
          fiyat: number
          renk: string
          yakit_tipi: string
          vites_tipi: string
          kasa_tipi: string
          motor_hacmi: number
          aciklama: string
          durum: string
          satis_durumu: string
          ozellikler?: string[]
          sahibi: string
          goruntuleme?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          baslik?: string
          marka?: string
          model?: string
          yil?: number
          kilometre?: number
          fiyat?: number
          renk?: string
          yakit_tipi?: string
          vites_tipi?: string
          kasa_tipi?: string
          motor_hacmi?: number
          aciklama?: string
          durum?: string
          satis_durumu?: string
          ozellikler?: string[]
          sahibi?: string
          goruntuleme?: number
          created_at?: string
          updated_at?: string
        }
      }
      resimler: {
        Row: {
          id: string
          araba_id: string
          url: string
          ana_resim: boolean
          siralama?: number
          created_at: string
        }
        Insert: {
          id?: string
          araba_id: string
          url: string
          ana_resim?: boolean
          siralama?: number
          created_at?: string
        }
        Update: {
          id?: string
          araba_id?: string
          url?: string
          ana_resim?: boolean
          siralama?: number
          created_at?: string
        }
      }
      favoriler: {
        Row: {
          id: string
          kullanici_id: string
          araba_id: string
          created_at: string
        }
        Insert: {
          id?: string
          kullanici_id: string
          araba_id: string
          created_at?: string
        }
        Update: {
          id?: string
          kullanici_id?: string
          araba_id?: string
          created_at?: string
        }
      }
      profiller: {
        Row: {
          id: string
          email: string
          ad_soyad?: string
          telefon?: string
          adres?: string
          resim_url?: string
          updated_at?: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          ad_soyad?: string
          telefon?: string
          adres?: string
          resim_url?: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          ad_soyad?: string
          telefon?: string
          adres?: string
          resim_url?: string
          updated_at?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
} 