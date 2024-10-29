/** @type {import('next').NextConfig} */

const nextConfig = {

  reactStrictMode: true,

  experimental: {

    workerThreads: false,

    cpus: 1,

  },

  images: {

    domains: [

      'media.discordapp.net',

      'cdn.discordapp.com',

      'replicate.delivery',

      'pbs.twimg.com'

    ],

    unoptimized: true,

    dangerouslyAllowSVG: true,

    contentDispositionType: 'attachment',

    remotePatterns: [

      {

        protocol: 'https',

        hostname: '**',

      },

    ],

  },

  outputFileTracingIncludes: {

    '/**': ['./public/**/*']

  },

  outputFileTracingExcludes: {

    '**': [

      'node_modules/**/*',

      '.git/**/*',

      '.next/**/*',

      'public/**/*'

    ]

  },

  serverExternalPackages: ['ws'],

  webpack: (config, { isServer }) => {

    if (!isServer) {

      config.resolve.fallback = {

        fs: false,

        path: false,

        crypto: false,

        ws: false

      }

    }

    return config;

  },

  output: 'standalone'

};

export default nextConfig;






























