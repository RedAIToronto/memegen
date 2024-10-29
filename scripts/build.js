const { execSync } = require('child_process');

const fs = require('fs');

const path = require('path');



async function build() {

  try {

    // Clean previous build

    console.log('🧹 Cleaning previous build...');

    execSync('rimraf .next out', { stdio: 'inherit' });



    // Setup assets

    console.log('📦 Setting up assets...');

    execSync('node scripts/setup-assets.js', { stdio: 'inherit' });



    // Create required directories if they don't exist

    const dirs = ['public', 'public/models'];

    dirs.forEach(dir => {

      if (!fs.existsSync(dir)) {

        fs.mkdirSync(dir, { recursive: true });

      }

    });



    // Run the build with specific NODE_ENV

    console.log('🏗️ Building...');

    execSync('next build', { 

      stdio: 'inherit',

      env: {

        ...process.env,

        NODE_ENV: 'production',

        NEXT_TELEMETRY_DISABLED: '1'

      }

    });



  } catch (error) {

    console.error('Build failed:', error);

    process.exit(1);

  }

}



build(); 
