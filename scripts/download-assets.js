const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(process.cwd(), 'public', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => reject(err));
    });
  });
};

async function setup() {
  try {
    // Create public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Download AIDOBE logo
    await downloadFile(
      'https://media.discordapp.net/attachments/1049699170480558201/1300529330631479359/out-0-removebg-preview.png',
      'aidobe-logo.png'
    );

    // Create placeholder images
    const placeholderPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    fs.writeFileSync(path.join(publicDir, 'placeholder-image.png'), placeholderPixel);
    fs.writeFileSync(path.join(publicDir, 'sparkle-pattern.png'), placeholderPixel);

    console.log('Setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setup();
