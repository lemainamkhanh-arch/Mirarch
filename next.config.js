/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ghxeugllxqnlqzdrxewl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: 's.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: 'v.pinimg.com',
      },
    ],
  },
}

module.exports = nextConfig
