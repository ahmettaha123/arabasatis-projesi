'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion } from 'framer-motion';

type LazyImageProps = Omit<ImageProps, 'onLoad'> & {
  threshold?: number;
  delayMs?: number;
  blurHash?: string;
  effect?: 'fade' | 'slide-up' | 'zoom' | 'none';
  placeholderSrc?: string;
  shimmer?: boolean;
};

export default function LazyImage({
  threshold = 0.1,
  delayMs = 200,
  blurHash,
  effect = 'fade',
  placeholderSrc,
  shimmer = true,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // IntersectionObserver ile görünürlüğü izle
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Gecikme ekleyebiliriz
          setTimeout(() => {
            setIsVisible(true);
          }, delayMs);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, delayMs]);

  // Animasyon varyantları
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } }
    },
    'slide-up': {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    },
    zoom: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    },
    none: {
      hidden: {},
      visible: {}
    }
  };

  const getShimmerUrl = (width: number, height: number) => {
    // SVG tabanlı shimmer efekti
    const shimmerSvg = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#eee" offset="20%" />
          <stop stop-color="#f5f5f5" offset="50%" />
          <stop stop-color="#eee" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#eee" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

    return `data:image/svg+xml;base64,${Buffer.from(shimmerSvg).toString('base64')}`;
  };

  // Default placeholder veya shimmer
  const shimmerUrl = shimmer && typeof props.width === 'number' && typeof props.height === 'number'
    ? getShimmerUrl(props.width as number, props.height as number)
    : undefined;

  // Görsel yükleme için placeholder
  const placeholder = placeholderSrc 
    ? 'blur' 
    : shimmerUrl 
      ? 'blur' 
      : undefined;
  
  const blurDataURL = placeholderSrc || shimmerUrl || blurHash;

  return (
    <div ref={ref} className={`overflow-hidden ${props.className || ''}`} style={{ position: 'relative' }}>
      {isVisible ? (
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={variants[effect]}
        >
          <Image
            {...props}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoadingComplete={() => setIsLoaded(true)}
            className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${props.className || ''}`}
          />
        </motion.div>
      ) : (
        <div 
          style={{
            width: props.width,
            height: props.height,
            background: '#f0f0f0',
            borderRadius: '8px'
          }}
          className={`animate-pulse ${props.className || ''}`}
        />
      )}
    </div>
  );
} 