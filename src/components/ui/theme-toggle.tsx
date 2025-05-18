'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hidratasyondan sonra tema bileşeni göster
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return <div className="w-9 h-9 rounded-md bg-muted" />
  }

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label="Temayı değiştir"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      initial={false}
      animate={{ 
        backgroundColor: theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(237 233 254)',
        borderColor: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(196 181 253)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative w-9 h-9 rounded-md overflow-hidden border shadow-md flex items-center justify-center"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
        >
          {theme === 'dark' ? (
            <Moon className="h-5 w-5 text-yellow-300" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Efekt parçacıkları */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              scale: theme === 'dark' ? [0, 1, 0] : [0, 0, 0],
              opacity: theme === 'dark' ? [0, 0.6, 0] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.2,
              times: [0, 0.5, 1]
            }}
            className="absolute w-1 h-1 rounded-full bg-yellow-200"
          />
        ))}
      </div>
    </motion.button>
  )
} 