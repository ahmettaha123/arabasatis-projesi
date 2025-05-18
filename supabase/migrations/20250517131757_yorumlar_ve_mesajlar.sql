-- Yorumlar tablosu oluşturma
CREATE TABLE IF NOT EXISTS yorumlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arac_id UUID NOT NULL REFERENCES arabalar(id) ON DELETE CASCADE,
  puan INTEGER NOT NULL CHECK (puan >= 1 AND puan <= 5),
  konu TEXT NOT NULL,
  yorum TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, arac_id)
);

-- Mesajlar tablosu oluşturma
CREATE TABLE IF NOT EXISTS mesajlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gonderen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alici_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arac_id UUID NOT NULL REFERENCES arabalar(id) ON DELETE CASCADE,
  icerik TEXT NOT NULL,
  okundu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin tablosu oluşturma
CREATE TABLE IF NOT EXISTS adminler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  yetki_seviyesi INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Arabalar tablosuna ortalama puan, yorum sayısı ve onay alanlarını ekleme
ALTER TABLE arabalar ADD COLUMN IF NOT EXISTS ortalama_puan NUMERIC(3, 2) DEFAULT 0;
ALTER TABLE arabalar ADD COLUMN IF NOT EXISTS yorum_sayisi INTEGER DEFAULT 0;
ALTER TABLE arabalar ADD COLUMN IF NOT EXISTS onaylandi BOOLEAN DEFAULT FALSE;
ALTER TABLE arabalar ADD COLUMN IF NOT EXISTS goruntuleme INTEGER DEFAULT 0;

-- RLS politikaları güncelleme (yorumlar)
ALTER TABLE yorumlar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes yorumları görüntüleyebilir"
  ON yorumlar FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi yorumlarını ekleyebilir"
  ON yorumlar FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi yorumlarını güncelleyebilir"
  ON yorumlar FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi yorumlarını silebilir"
  ON yorumlar FOR DELETE
  USING (auth.uid() = user_id);

-- RLS politikaları güncelleme (mesajlar)
ALTER TABLE mesajlar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi mesajlarını görüntüleyebilir"
  ON mesajlar FOR SELECT
  USING (auth.uid() = gonderen_id OR auth.uid() = alici_id);

CREATE POLICY "Kullanıcılar mesaj gönderebilir"
  ON mesajlar FOR INSERT
  WITH CHECK (auth.uid() = gonderen_id);

CREATE POLICY "Kullanıcılar kendi mesajlarını güncelleyebilir"
  ON mesajlar FOR UPDATE
  USING (auth.uid() = gonderen_id OR auth.uid() = alici_id);

CREATE POLICY "Kullanıcılar kendi mesajlarını silebilir"
  ON mesajlar FOR DELETE
  USING (auth.uid() = gonderen_id);

-- RLS politikaları güncelleme (adminler)
ALTER TABLE adminler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes admin bilgilerini görüntüleyebilir"
  ON adminler FOR SELECT
  USING (true);

-- Admin fonksiyonları
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM adminler WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gerçek zamanlı bildirimler için trigger fonksiyonu
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('yeni_mesaj', json_build_object(
    'id', NEW.id,
    'gonderen_id', NEW.gonderen_id,
    'alici_id', NEW.alici_id,
    'arac_id', NEW.arac_id,
    'created_at', NEW.created_at
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
AFTER INSERT ON mesajlar
FOR EACH ROW EXECUTE PROCEDURE handle_new_message();

-- Yorum eklendiğinde araba ortalama puanını güncelleme trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_car_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  -- Araç için ortalama puanı hesapla
  SELECT 
    AVG(puan)::NUMERIC(3,2), 
    COUNT(*)
  INTO 
    avg_rating, 
    review_count
  FROM yorumlar
  WHERE arac_id = NEW.arac_id;
  
  -- Araç tablosunu güncelle
  UPDATE arabalar
  SET 
    ortalama_puan = avg_rating,
    yorum_sayisi = review_count
  WHERE id = NEW.arac_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON yorumlar
FOR EACH ROW EXECUTE PROCEDURE update_car_rating();
