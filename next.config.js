/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack to avoid the fatal errors
  experimental: {
    turbo: {
      loaders: false,
    },
  },
  // Optimize for production
  swcMinify: true,
  // Handle GSAP and Three.js modules
  webpack: (config, { isServer }) => {
    // Handle GSAP modules
    config.module.rules.push({
      test: /\\.js$/,
      include: /node_modules[\\/]gsap/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

    // Optimize Three.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
  // Image optimization
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
