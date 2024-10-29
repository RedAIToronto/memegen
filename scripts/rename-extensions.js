const fs = require('fs');
const path = require('path');

function renameJsxToJs(dir) {
  try {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Skip node_modules and .next directories
        if (item === 'node_modules' || item === '.next') {
          return;
        }
        // Recursively process subdirectories
        console.log(`📁 Processing directory: ${fullPath}`);
        renameJsxToJs(fullPath);
      } else if (item.endsWith('.jsx')) {
        try {
          const newPath = fullPath.replace('.jsx', '.js');
          fs.renameSync(fullPath, newPath);
          console.log(`✓ Renamed: ${fullPath} → ${newPath}`);
        } catch (error) {
          console.error(`❌ Failed to rename ${fullPath}:`, error.message);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error processing directory ${dir}:`, error.message);
  }
}

// Start with the components directory
const componentsDir = path.join(process.cwd(), 'components');

console.log('🔄 Starting JSX to JS conversion...');
console.log(`📁 Starting with components directory: ${componentsDir}`);

if (fs.existsSync(componentsDir)) {
  renameJsxToJs(componentsDir);
  console.log('\n✅ Conversion complete!');
} else {
  console.error('❌ Components directory not found!');
  process.exit(1);
} 