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
          ozellikler: string[] | null
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
          ozellikler?: string[] | null
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
          ozellikler?: string[] | null
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
          ad_soyad?: string | null
          telefon?: string | null
          adres?: string | null
          resim_url?: string | null
          updated_at?: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          ad_soyad?: string | null
          telefon?: string | null
          adres?: string | null
          resim_url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          ad_soyad?: string | null
          telefon?: string | null
          adres?: string | null
          resim_url?: string | null
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