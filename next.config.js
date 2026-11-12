/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Hosts whose images next/image may resize and convert to modern formats.
    // Images from any other host are shown as-is (see components/site/Media.jsx).
    remotePatterns: [
      { protocol: 'https', hostname: 'sachin-dev-59j2.onrender.com', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
