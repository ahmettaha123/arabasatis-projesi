import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Para birimini formatlar
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Tarih formatlar
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Mesafeyi formatlar (kilometre)
 */
export function formatDistance(km: number): string {
  if (km < 1000) {
    return `${km} km`;
  }
  return `${(km / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} bin km`;
}

/**
 * Fiyat aralığını formatlar
 */
export function formatPriceRange(min?: number, max?: number): string {
  if (min && max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  } else if (min) {
    return `${formatCurrency(min)} ve üzeri`;
  } else if (max) {
    return `${formatCurrency(max)}'e kadar`;
  }
  return "Belirtilmemiş";
}

/**
 * Araç yaş aralıklarını formatlar
 */
export function formatAgeRange(startYear?: number, endYear?: number): string {
  const currentYear = new Date().getFullYear();
  
  if (startYear && endYear) {
    return `${startYear} - ${endYear}`;
  } else if (startYear) {
    return `${startYear} ve sonrası`;
  } else if (endYear) {
    return `${endYear} ve öncesi`;
  }
  return "Tüm yıllar";
}

/**
 * URL'den parametreleri parse eder
 */
export function parseURLParams(url: string): Record<string, string> {
  try {
    const params = new URLSearchParams(url.split("?")[1]);
    const result: Record<string, string> = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  } catch (error) {
    return {};
  }
}

/**
 * Araç verilerini filtrelemek için yardımcı fonksiyonlar
 */
export const carFilterFunctions = {
  marka: (car: any, value: string) => {
    if (!value) return true;
    return car.marka.toLowerCase() === value.toLowerCase();
  },
  
  model: (car: any, value: string) => {
    if (!value) return true;
    return car.model.toLowerCase().includes(value.toLowerCase());
  },
  
  min_fiyat: (car: any, value: string) => {
    if (!value) return true;
    const minPrice = parseInt(value);
    return car.fiyat >= minPrice;
  },
  
  max_fiyat: (car: any, value: string) => {
    if (!value) return true;
    const maxPrice = parseInt(value);
    return car.fiyat <= maxPrice;
  },
  
  min_yil: (car: any, value: string) => {
    if (!value) return true;
    const minYear = parseInt(value);
    return car.model_yili >= minYear;
  },
  
  max_yil: (car: any, value: string) => {
    if (!value) return true;
    const maxYear = parseInt(value);
    return car.model_yili <= maxYear;
  },
  
  yakit_tipi: (car: any, value: string) => {
    if (!value) return true;
    return car.yakit_tipi.toLowerCase() === value.toLowerCase();
  },
  
  vites_tipi: (car: any, value: string) => {
    if (!value) return true;
    return car.vites_tipi.toLowerCase() === value.toLowerCase();
  },
  
  max_kilometre: (car: any, value: string) => {
    if (!value) return true;
    const maxKm = parseInt(value);
    return car.kilometre <= maxKm;
  },
  
  konum: (car: any, value: string) => {
    if (!value) return true;
    return car.konum.toLowerCase().includes(value.toLowerCase());
  }
};
