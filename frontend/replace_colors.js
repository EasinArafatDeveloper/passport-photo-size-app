const fs = require('fs');
const path = require('path');

const directories = ['src/components', 'src/app'];
const filesToProcess = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      filesToProcess.push(fullPath);
    }
  }
}

directories.forEach(walk);

const replacements = {
  // Teal to Blue
  '#0f766e': '#2563eb', // Teal 700 -> Blue 600
  '#0d5c56': '#1d4ed8', // Teal 800 -> Blue 700
  '#0d9488': '#3b82f6', // Teal 600 -> Blue 500
  '#ccfbf1': '#dbeafe', // Teal 100 -> Blue 100
  '#f0fdfa': '#eff6ff', // Teal 50 -> Blue 50
  '#f0fdf9': '#eff6ff', // Teal 50 (alt) -> Blue 50
  'rgba(15,118,110': 'rgba(37,99,235',
  'rgba(15, 118, 110': 'rgba(37, 99, 235',
  
  // Emerald to Blue (so everything is blue as requested: "websiet ta blue and whiet are combination hoel valo hoy like button gula color oi favicon are jay blue color oi color are")
  '#10b981': '#3b82f6', // Emerald 500 -> Blue 500
  '#d1fae5': '#dbeafe', // Emerald 100 -> Blue 100
  '#065f46': '#1e3a8a', // Emerald 800 -> Blue 900
  'rgba(16,185,129': 'rgba(59,130,246',
  'rgba(16, 185, 129': 'rgba(59, 130, 246',
};

let totalChanged = 0;

for (const file of filesToProcess) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const [teal, blue] of Object.entries(replacements)) {
    // case sensitive
    content = content.split(teal).join(blue);
    // uppercase hex
    if (teal.startsWith('#')) {
      content = content.split(teal.toUpperCase()).join(blue.toUpperCase());
    }
  }
  
  // globals.css root variables override if any
  if (file.endsWith('globals.css')) {
    content = content.replace('--teal:', '--blue:');
    content = content.replace('--teal-dark:', '--blue-dark:');
    content = content.replace('--teal-light:', '--blue-light:');
    content = content.replace('--teal-glow:', '--blue-glow:');
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated colors in', file);
    totalChanged++;
  }
}
console.log('Total files updated:', totalChanged);
