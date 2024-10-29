// check-project.js

const fs = require('fs');

const path = require('path');



function checkDirectory(dir) {

  try {

    const items = fs.readdirSync(dir);

    console.log(`\nChecking directory: ${dir}`);

    

    items.forEach(item => {

      const fullPath = path.join(dir, item);

      const stats = fs.statSync(fullPath);

      

      if (stats.isDirectory()) {

        console.log(`📁 Directory: ${item}`);

        // Check subdirectories

        checkDirectory(fullPath);

      } else {

        console.log(`📄 File: ${item} (${stats.size} bytes)`);

      }

    });

  } catch (error) {

    console.error(`Error checking directory ${dir}:`, error);

  }

}



// Check key directories

console.log('🔍 Project Structure Check:');

['public', 'pages', 'components', 'styles'].forEach(dir => {

  checkDirectory(dir);

});
