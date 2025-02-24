/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/platformerEngine2D",
  base: "/platformerEngine2D",
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true, //added to get index html file
  },
};

export default nextConfig;
