'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useUI } from '@/context/UIContext';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const { animations } = useUI();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || !animations.enableParticles) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ekran boyutunu ayarla
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      
      // Canvas'ı temizle
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    setupCanvas();
    
    // Renk ayarları
    const particleColor = theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(0, 0, 50, 0.2)';
    
    const lineColor = theme === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 50, 0.05)';
    
    // Parçacık sayısını ekran boyutuna göre ayarla
    const particleCount = Math.min(
      50,
      Math.floor((canvas.width * canvas.height) / 15000)
    );
    
    // Parçacık oluştur
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 0.5;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Kenara çarpınca yön değiştir
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }
    }
    
    // Parçacıkları oluştur
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animasyon fonksiyonu
    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Tüm parçacıkları çiz ve güncelle
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      // Parçacıklar arasında çizgi çiz
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Belirli mesafeden yakın parçacıklar arasında çizgi çiz
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Mesafeye göre çizgi opaklığını ayarla
            const opacity = 1 - (distance / 100);
            ctx.strokeStyle = theme === 'dark'
              ? `rgba(255, 255, 255, ${opacity * 0.05})`
              : `rgba(0, 0, 50, ${opacity * 0.05})`;
              
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Pencere boyutu değişince canvas'ı yeniden ayarla
    const handleResize = () => {
      setupCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Temizleme
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, theme, animations.enableParticles]);
  
  if (!mounted || !animations.enableParticles) {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
} 