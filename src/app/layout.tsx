'use client';

import './globals.css'
import { Montserrat, Poppins } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import { Providers } from './providers'
import { PageTransition } from '@/components/ui/PageTransition'
import { FloatingNav } from '@/components/ui/FloatingNav'
import { ParticleBackground } from '@/components/ui/ParticleBackground'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);

  // hydration için render etme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      smoothWheel: true,
      lerp: 0.1,
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [mounted]);

  return (
    <html lang="tr" className={`${montserrat.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300 ease-in-out">
        <Providers>
          {mounted ? (
            <>
              <ParticleBackground />
              <Navbar />
              <PageTransition>
                <main className="flex-grow">{children}</main>
              </PageTransition>
              <Footer />
              <FloatingNav />
              <Toaster position="top-center" />
            </>
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-pulse h-16 w-16 rounded-full bg-blue-500/50"></div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  )
}
