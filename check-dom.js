const fs = require('fs');
const appJs = fs.readFileSync('C:/monitoring_unugha/public/js/app.js', 'utf8');
const indexHtml = fs.readFileSync('C:/monitoring_unugha/public/index.html', 'utf8');

const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(appJs)) !== null) {
  ids.add(match[1]);
}

console.log('Total unique IDs referenced:', ids.size);
const missing = [];
for (const id of ids) {
  if (!indexHtml.includes('id="' + id + '"') && !indexHtml.includes("id='" + id + "'")) {
    missing.push(id);
  }
}

console.log('Missing IDs in index.html:', missing);
