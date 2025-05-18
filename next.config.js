/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'khdmurgshrmjbxufuovu.supabase.co',
      'images.unsplash.com',
      'loremflickr.com',
      'picsum.photos',
      'source.unsplash.com',
      'avatars.githubusercontent.com',
      'randomuser.me',
      'i.pravatar.cc',
      'www.carlogos.org'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Supabase depolama erişimi için CORS ayarları
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ];
  },
  // Node.js ortamı için gerekli ayarlar
  serverExternalPackages: ['@supabase/supabase-js'],
}

module.exports = nextConfig 