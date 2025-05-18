'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

const UserAuthBar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  return (
    <div className="fixed top-24 right-4 z-40 flex flex-col gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-200 dark:border-slate-700">
      {user ? (
        <div className="relative group">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200"
          >
            <span className="text-sm text-slate-700 dark:text-slate-300">Hesabım</span>
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </Link>
          
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-20">
            <div className="py-2">
              <Link 
                href="/dashboard" 
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
              <Link 
                href="/hesap" 
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Hesap Bilgilerim
              </Link>
              <Link 
                href="/hesap/favoriler" 
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Favorilerim
              </Link>
              <button 
                onClick={() => {
                  // Çıkış yapma işlemi
                  setUser(null);
                  router.push('/');
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-100 dark:border-slate-700 mt-1 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            href="/giris"
            className="py-1.5 px-4 text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors text-center"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="py-1.5 px-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-lg transition-colors text-center"
          >
            Kayıt Ol
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserAuthBar; 