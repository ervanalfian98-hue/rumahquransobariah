const https = require('https');

function checkUrl(url) {
  https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`${url} -> ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`${url} -> ERROR: ${err.message}`);
  }).end();
}

checkUrl('https://audio.qurancdn.com/wbw/001_001_001.mp3');
checkUrl('https://verses.qurancdn.com/wbw/001_001_001.mp3');
checkUrl('https://words.qurancdn.com/wbw/001_001_001.mp3');
