const { execSync } = require('child_process');

console.log('🚀 Starting setup...');

try {
  // Run setup scripts
  execSync('node scripts/setup-assets.js', { stdio: 'inherit' });
  console.log('✅ Setup complete!');
} catch (error) {
  console.error('❌ Setup failed:', error);
  process.exit(1);
} 