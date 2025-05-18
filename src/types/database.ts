export type Araba = {
  id: string;
  baslik: string;
  marka: string;
  model: string;
  yil: number;
  kilometre: number;
  fiyat: number;
  renk: string;
  yakit_tipi: string;
  vites_tipi: string;
  motor_hacmi: string;
  aciklama: string;
  durum: string;
  sahibi: string;
  konum: string;
  goruntuleme: number;
  created_at: string;
  updated_at: string;
};

export type Resim = {
  id: string;
  araba_id: string;
  url: string;
  ana_resim: boolean;
  siralama: number;
  created_at: string;
};

export type ArabaWithResimler = Araba & {
  resimler: Resim[];
};

export type Profil = {
  id: string;
  ad_soyad: string;
  email: string;
  telefon: string;
  adres: string;
  kullanici_id: string;
  created_at: string;
  updated_at: string;
};

export type Favori = {
  id: string;
  kullanici_id: string;
  araba_id: string;
  created_at: string;
}; 