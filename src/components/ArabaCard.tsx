'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaTachometerAlt, FaGasPump, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArabaWithResimler } from '@/types/database';

interface ArabaCardProps {
  araba: ArabaWithResimler;
}

export default function ArabaCard({ araba }: ArabaCardProps) {
  const [hovered, setHovered] = useState(false);
  
  // Araba resmi: resimlerin ilki veya varsayılan resim
  const resimUrl = araba.resimler && araba.resimler.length > 0 
    ? araba.resimler[0].url 
    : 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=960';
  
  // Fiyat biçimlendirme
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Fiyat Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
  };

  const cardVariants = {
    hover: { 
      y: -10,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 20
      }
    },
    initial: { 
      y: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: { 
        type: "spring", 
        stiffness: 500,
        damping: 30
      }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.5 }
    },
    initial: { 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const infoVariants = {
    hover: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    initial: { 
      opacity: 0,
      y: 10,
      transition: { duration: 0.3 }
    }
  };

  const priceVariants = {
    hover: { 
      scale: 1.05,
      color: '#3b82f6',
      transition: { duration: 0.3 }
    },
    initial: { 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate={hovered ? "hover" : "initial"}
      variants={cardVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <Link href={`/araclar/${araba.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <motion.div
            variants={imageVariants}
            className="h-full w-full"
          >
            <Image 
              src={resimUrl} 
              alt={`${araba.marka} ${araba.model}`} 
              className="object-cover h-full w-full" 
              width={400} 
              height={300}
              priority
            />
          </motion.div>
          
          {/* Overlay bilgileri */}
          <motion.div 
            variants={infoVariants}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white transform transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-600 rounded-md text-xs font-medium">
                {araba.yakit_tipi || 'Belirtilmemiş'}
              </span>
              <span className="px-2 py-1 bg-purple-600 rounded-md text-xs font-medium">
                {araba.vites_tipi || 'Belirtilmemiş'}
              </span>
            </div>
          </motion.div>
          
          {/* Marka rozeti */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold shadow-md">
            {araba.marka || 'Belirtilmemiş'}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {araba.baslik || `${araba.marka} ${araba.model}`}
          </h3>
          
          <motion.div 
            className="text-xl font-bold mb-3"
            variants={priceVariants}
          >
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(araba.fiyat)}
            </span>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaCalendarAlt className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                {araba.yil || 'Belirtilmemiş'}
              </span>
            </div>
            
            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaTachometerAlt className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                {araba.kilometre ? `${(araba.kilometre / 1000).toFixed(0)}K km` : 'Belirtilmemiş'}
              </span>
            </div>
            
            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaGasPump className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                {araba.yakit_tipi || 'Belirtilmemiş'}
              </span>
            </div>
            
            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaCog className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                {araba.vites_tipi || 'Belirtilmemiş'}
              </span>
            </div>
          </div>
          
          <motion.div
            className="mt-4 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="inline-block py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium w-full transition-all">
              Detayları Gör
            </span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
} 