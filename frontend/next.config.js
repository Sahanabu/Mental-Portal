/** @type {import('next').NextConfig} */
const nextConfig = {
env: {
NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
},

// Force webpack usage for compatibility
turbopack: false,

webpack: (config, { isServer }) => {

```
// Transpile GSAP modules properly
config.module.rules.push({
  test: /\.js$/,
  include: /node_modules[\\/]gsap/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['next/babel'],
    },
  },
});

// Fix Three.js browser issues
if (!isServer) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    os: false,
  };
}

return config;
```

},

// Image optimization settings
images: {
remotePatterns: [
{
protocol: 'http',
hostname: 'localhost',
},
{
protocol: 'https',
hostname: '**.onrender.com',
},
],
},
};

module.exports = nextConfig;
