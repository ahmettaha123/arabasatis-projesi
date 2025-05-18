import Hero from '@/components/Hero';
import UserAuthBar from '@/components/UserAuthBar';
import { FaShieldAlt, FaMoneyBillWave, FaHandshake } from 'react-icons/fa';

// Marka logoları için güvenilir URL'ler
const brandLogos = [
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo-2020-blue-white.png' },
  { name: 'Mercedes', logo: 'https://www.carlogos.org/logo/Mercedes-Benz-logo-2011-1920x1080.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo-2016.png' },
  { name: 'Volkswagen', logo: 'https://www.carlogos.org/logo/Volkswagen-logo-2019-1500x1500.png' },
  { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo-2019-3700x1200.png' },
  { name: 'Honda', logo: 'https://www.carlogos.org/logo/Honda-logo-1920x1080.png' },
  { name: 'Ford', logo: 'https://www.carlogos.org/car-logos/ford-logo-2017.png' },
  { name: 'Renault', logo: 'https://www.carlogos.org/logo/Renault-logo-2015-2048x2048.png' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <UserAuthBar />
      
      {/* Neden Bizi Tercih Etmelisiniz Bölümü */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Neden Bizi Tercih Etmelisiniz?</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Arabanızı satmak veya yeni bir araba satın almak hiç bu kadar kolay olmamıştı. Güvenilir, hızlı ve şeffaf hizmetimizle yanınızdayız.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 w-14 h-14 flex items-center justify-center mb-4">
                <FaShieldAlt className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Güvenilir Platform</h3>
              <p className="text-slate-600 dark:text-slate-300">Tüm araçlarımız detaylı incelemeden geçirilir ve gerçek satıcılar tarafından listelenir. Güvenliğiniz bizim önceliğimizdir.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 w-14 h-14 flex items-center justify-center mb-4">
                <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Rekabetçi Fiyatlar</h3>
              <p className="text-slate-600 dark:text-slate-300">Piyasadaki en rekabetçi fiyatlarla araç alım satım yapabilirsiniz. Fiyat karşılaştırma araçlarımızla en iyi teklifi bulun.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 w-14 h-14 flex items-center justify-center mb-4">
                <FaHandshake className="text-purple-600 dark:text-purple-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Kolay İşlem</h3>
              <p className="text-slate-600 dark:text-slate-300">Basitleştirilmiş satın alma ve satma süreci. Tüm belge işlemleri ve tapu transferinde size rehberlik ederiz.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Marka Logoları Bölümü */}
      <section className="py-10 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-xl font-medium mb-8 text-slate-700 dark:text-slate-300">En Çok Tercih Edilen Markalar</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {brandLogos.map((brand, index) => (
              <div key={index} className="group hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-700 rounded-full p-3 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                  <img 
                    src={brand.logo} 
                    alt={`${brand.name} logosu`} 
                    className="max-w-full max-h-full object-contain filter dark:brightness-0 dark:invert-[.8]" 
                  />
                </div>
                <p className="mt-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{brand.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
