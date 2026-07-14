const fs = require('fs');
const file = 'D:/PROJECT PEMBUATAN APLIKASI/rumahquransobariah/app/page.js';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/className="absolute left-5/g, 'className="absolute left-5 z-10');
data = data.replace(/className="absolute right-5/g, 'className="absolute right-5 z-10');
fs.writeFileSync(file, data);
console.log('Done');
