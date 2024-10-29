const https = require('https');
const fs = require('fs');
const path = require('path');

// Helper function to download files
const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(process.cwd(), 'public', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => reject(err));
    });
  });
};

async function setup() {
  try {
    // Create required directories
    const dirs = ['public', 'public/models'];
    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });

    // Base64 encoded 1x1 transparent PNG for placeholders
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

    // Basic SVG content
    const windowSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect><line x1="6" y1="3" x2="6" y2="21"></line></svg>`;

    // Create or download all required files
    await Promise.all([
      // Create placeholder images
      new Promise(resolve => {
        fs.writeFileSync(path.join(process.cwd(), 'public', 'placeholder-image.png'), transparentPixel);
        fs.writeFileSync(path.join(process.cwd(), 'public', 'sparkle-pattern.png'), transparentPixel);
        fs.writeFileSync(path.join(process.cwd(), 'public', 'window.svg'), windowSvgContent);
        resolve();
      }),
      // Download model images
      downloadFile('https://pbs.twimg.com/profile_images/1847811775242063874/aPQtRzhg_400x400.jpg', 'models/fwog.png'),
      downloadFile('https://pbs.twimg.com/profile_images/1772493729120575488/U5fkTROU_400x400.jpg', 'models/mew.png'),
      // Download logo
      downloadFile('https://media.discordapp.net/attachments/1049699170480558201/1300529330631479359/out-0-removebg-preview.png', 'aidobe-logo.png')
    ]);

    console.log('✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setup();


