/** @type {import('next').NextConfig} */

const nextConfig = {

  images: {

    domains: [

      'pbs.twimg.com', // For Twitter images

      'uploadthing.com', // For UploadThing

      'replicate.delivery', // For Replicate outputs

      'utfs.io' // For UploadThing file storage

    ],

    dangerouslyAllowSVG: true,

    contentDispositionType: 'attachment',

    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

  },

  webpack: (config, { isServer }) => {

    if (isServer) {

      config.externals.push({

        'utf-8-validate': 'commonjs utf-8-validate',

        'bufferutil': 'commonjs bufferutil',

      })

    }

    return config

  },

  experimental: {

    esmExternals: 'loose'

  }

}



module.exports = nextConfig 
