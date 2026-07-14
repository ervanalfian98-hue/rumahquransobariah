const https = require('https');

function checkUrl(url) {
  https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`${url} -> ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`${url} -> ERROR: ${err.message}`);
  }).end();
}

checkUrl('https://verses.qurancdn.com/Alafasy/mp3/001001.mp3');
checkUrl('https://audio.qurancdn.com/Alafasy/mp3/001001.mp3');
checkUrl('https://qurancdn.com/Alafasy/mp3/001001.mp3');
