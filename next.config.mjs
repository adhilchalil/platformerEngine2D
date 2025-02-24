/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  assetPrefix: isProd ? '/platformerEngine2D/' : '',
  basePath: isProd ? '/platformerEngine2D' : '',
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true, //added to get index html file
  },
};

export default nextConfig;
