const fs = require('fs');
const file = 'D:/PROJECT PEMBUATAN APLIKASI/rumahquransobariah/app/page.js';
let data = fs.readFileSync(file, 'utf8');

// Replace left absolute icons
data = data.replace(/absolute left-5(?! top-1\/2)/g, 'absolute left-5 top-1/2 -translate-y-1/2');

// Replace right absolute buttons
data = data.replace(/absolute right-5(?! top-1\/2)/g, 'absolute right-5 top-1/2 -translate-y-1/2');

// Just to be sure, make sure z-index is there for passwords
// (Already added previously, but this won't hurt if we just rely on top-1/2)

fs.writeFileSync(file, data);
console.log('Fixed vertical centering');
