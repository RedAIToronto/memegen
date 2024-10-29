const { execSync } = require('child_process');



const fs = require('fs');



const path = require('path');







console.log('🔍 Starting debug build process...');







// Add recursive file checker



function checkDirectoryContents(dir) {



  const items = fs.readdirSync(dir);



  items.forEach(item => {



    const fullPath = path.join(dir, item);



    const stats = fs.statSync(fullPath);



    if (stats.isDirectory()) {



      console.log(`📁 Checking directory: ${fullPath}`);



      checkDirectoryContents(fullPath);



    } else {



      console.log(`📄 Found file: ${fullPath} (${stats.size} bytes)`);



    }



  });



}







// Check for required directories



const requiredDirs = ['public', 'pages', 'components', 'styles'];



requiredDirs.forEach(dir => {



  if (!fs.existsSync(dir)) {



    console.error(`❌ Missing required directory: ${dir}`);



    process.exit(1);



  } else {



    console.log(`✓ Found directory: ${dir}`);



    checkDirectoryContents(dir);



  }



});







// Check for required files



const requiredFiles = [



  'public/aidobe-logo.png',



  'public/placeholder-image.png',



  'public/sparkle-pattern.png',



  'public/window.svg'



];







requiredFiles.forEach(file => {



  if (!fs.existsSync(file)) {



    console.error(`❌ Missing required file: ${file}`);



    process.exit(1);



  } else {



    const stats = fs.statSync(file);



    console.log(`✓ Found file: ${file} (${stats.size} bytes)`);



    // Check file permissions



    try {



      fs.accessSync(file, fs.constants.R_OK);



      console.log(`✓ File is readable: ${file}`);



    } catch (err) {



      console.error(`❌ File permission error: ${file}`, err);



    }



  }



});







try {



  console.log('\n📦 Starting Next.js build with debugging...');



  // Add environment variable for debugging



  process.env.NODE_DEBUG = 'fs';



  execSync('next build --debug', {



    stdio: 'inherit',



    env: {



      ...process.env,



      NODE_DEBUG: 'fs',



      DEBUG: '*'



    }



  });



} catch (error) {



  console.error('\n❌ Build failed:', error);



  // Try to get more error details



  if (error.stdout) console.log('stdout:', error.stdout.toString());



  if (error.stderr) console.log('stderr:', error.stderr.toString());



  process.exit(1);



}


