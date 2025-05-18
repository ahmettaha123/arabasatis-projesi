"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Car, MapPin, CalendarDays, Gauge, Fuel, Cog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDistance } from "@/lib/utils";

interface CarType {
  id: string;
  marka: string;
  model: string;
  model_yili: number;
  fiyat: number;
  kilometre: number;
  yakit_tipi: string;
  vites_tipi: string;
  konum: string;
  created_at: string;
  fotograf_urls: string[];
  durum?: string;
  [key: string]: any;
}

interface CarGridProps {
  cars: CarType[];
  columns?: 2 | 3 | 4;
  showBadge?: boolean;
}

const defaultImage = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=960";

export function CarGrid({ cars = [], columns = 3, showBadge = true }: CarGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (cars.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-xl">
        <Car className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Araç Bulunamadı</h3>
        <p className="text-muted-foreground mt-1">Filtreleri değiştirerek tekrar deneyin</p>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {cars.map((car) => (
        <Link 
          key={car.id} 
          href={`/araclar/${car.id}`} 
          className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={car.fotograf_urls?.[0] || defaultImage}
              alt={`${car.marka} ${car.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {showBadge && car.durum && (
              <Badge className="absolute top-2 left-2 bg-primary">
                {car.durum}
              </Badge>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium truncate">{car.marka} {car.model}</h3>
              <span className="text-primary font-bold">{formatCurrency(car.fiyat)}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{car.konum}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center text-xs">
                <CalendarDays className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{car.model_yili}</span>
              </div>
              
              <div className="flex items-center text-xs">
                <Gauge className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{formatDistance(car.kilometre)}</span>
              </div>
              
              <div className="flex items-center text-xs">
                <Fuel className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{car.yakit_tipi}</span>
              </div>
              
              <div className="flex items-center text-xs">
                <Cog className="h-3 w-3 mr-1 text-muted-foreground" />
                <span>{car.vites_tipi}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 