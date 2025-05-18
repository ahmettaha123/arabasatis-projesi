import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ArabaSatış - En İyi Araç Alım Satım Platformu',
  description: 'En iyi araçları bulabileceğiniz, güvenilir alım satım platformu',
  keywords: 'araba satış, ikinci el araç, sıfır araba, araba al, otomobil, araç ilanları',
  authors: [{ name: 'Araba Satış A.Ş.', url: '/' }],
  openGraph: {
    title: 'Araba Satış Sitesi | Hayalinizdeki Araca Kavuşmanın Yolu',
    description: 'En güvenilir ve şeffaf araba alım satım platformu. Binlerce araç, uygun fiyatlar ve güvenli işlemler bir tık uzağınızda.',
    url: '/',
    siteName: 'Araba Satış',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7',
        width: 1200,
        height: 630,
        alt: 'Araba Satış',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
}; 