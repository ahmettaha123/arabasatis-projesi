import Link from 'next/link';
import { FaCar, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Birinci Sütun - Logo ve Hakkında */}
          <div className="lg:col-span-2 fade-in animation-delay-200">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative w-10 h-10 flex items-center justify-center bg-blue-600 dark:bg-blue-500 rounded-lg shadow-md group-hover:scale-110 transition-all duration-300">
                <FaCar className="text-white text-xl" />
                <div className="absolute inset-0 bg-blue-400 rounded-lg blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">ArabaSatış</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Türkiye'nin en güvenilir ve şeffaf araba alım satım platformu. Binlerce araç, uygun fiyatlar ve güvenli işlemler bir tık uzağınızda.
            </p>
            <div className="flex items-center space-x-5">
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* İkinci Sütun - Hızlı Linkler */}
          <div className="fade-in animation-delay-400">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 border-b border-slate-200 dark:border-slate-800 pb-2">
              Hızlı Linkler
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/araclar" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Tüm Araçlar
                </Link>
              </li>
              <li>
                <Link href="/ilan-ver" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  İlan Ver
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/blog" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Üçüncü Sütun - Yardım */}
          <div className="fade-in animation-delay-600">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 border-b border-slate-200 dark:border-slate-800 pb-2">
              Yardım
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sikca-sorulan-sorular" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/kullanici-sozlesmesi" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Kullanıcı Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/cerez-politikasi" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:pl-1 duration-200">
                  <FaChevronRight className="mr-2 text-xs text-blue-600 dark:text-blue-400" />
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Dördüncü Sütun - İletişim */}
          <div className="fade-in animation-delay-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 border-b border-slate-200 dark:border-slate-800 pb-2">
              İletişim
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 text-blue-600 dark:text-blue-400">
                  <FaMapMarkerAlt />
                </div>
                <span className="text-slate-600 dark:text-slate-400">Karaköy, Kemankeş Cad. No:31, <br />Beyoğlu, İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">
                  <FaPhone />
                </div>
                <a href="tel:+902121234567" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  +90 212 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">
                  <FaEnvelope />
                </div>
                <a href="mailto:info@arabasatis.com" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  info@arabasatis.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © {currentYear} ArabaSatış. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
} 