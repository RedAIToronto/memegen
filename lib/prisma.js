import { PrismaClient } from '@prisma/client';



let prisma;



if (process.env.NODE_ENV === 'production') {

  prisma = new PrismaClient({

    log: ['error'],

    errorFormat: 'minimal',

    datasources: {

      db: {

        url: process.env.DATABASE_URL

      }

    }

  });

} else {

  if (!global.prisma) {

    global.prisma = new PrismaClient({

      log: ['query', 'error', 'warn'],

      errorFormat: 'minimal'

    });

  }

  prisma = global.prisma;

}



// Add error handling

prisma.$use(async (params, next) => {

  try {

    return await next(params);

  } catch (error) {

    console.error('Prisma Error:', error);

    throw error;

  }

});



export { prisma };






























