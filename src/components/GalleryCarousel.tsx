"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryCarouselProps {
  images: string[];
  className?: string;
}

export function GalleryCarousel({ images = [], className = "" }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  
  // Eğer resimlerin boş olması durumunda veya resim sayısı 0 ise varsayılan bir resim kullan
  const displayImages = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
  ];

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Klavye kullanımı için event listener
  React.useEffect(() => {
    if (isFullscreen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") handlePrevious();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "Escape") setIsFullscreen(false);
      };
      
      window.addEventListener("keydown", handleKeyDown);
      
      // Scroll'u devre dışı bırak
      document.body.style.overflow = "hidden";
      
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isFullscreen, currentIndex]);

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <span className="text-muted-foreground text-sm">
              {currentIndex + 1} / {displayImages.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-full"
              aria-label="Tam ekrandan çık"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <div className="relative w-full h-full max-w-5xl mx-auto">
              <Image
                src={displayImages[currentIndex]}
                alt={`Görsel ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              
              {hasPrevious && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}
              
              {hasNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? "border-primary scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Görsel ${index + 1}`}
                  aria-pressed={index === currentIndex}
                >
                  <Image
                    src={image}
                    alt={`Küçük resim ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className={`relative group ${className}`}>
        <div className="relative aspect-video md:aspect-[16/9] overflow-hidden">
          <Image
            src={displayImages[currentIndex]}
            alt={`Ana Görsel`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
            priority
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="absolute right-4 top-4 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Tam ekran görüntüle"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          
          {hasPrevious && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className="p-1"
                aria-label={`Görsel ${index + 1}`}
                aria-pressed={index === currentIndex}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex 
                      ? "bg-primary" 
                      : "bg-background/50 hover:bg-background/80"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>
        
        {displayImages.length > 1 && (
          <div className="mt-2 overflow-x-auto py-2 flex gap-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-primary scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Görsel ${index + 1} - küçük resim`}
                aria-pressed={index === currentIndex}
              >
                <Image
                  src={image}
                  alt={`Küçük resim ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 