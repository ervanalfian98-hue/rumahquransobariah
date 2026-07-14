const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode);
    }).on('error', (e) => resolve(e.message)).end();
  });
}

async function test() {
  const url1 = 'https://audio.qurancdn.com/wbw/002_006_011.mp3';
  const url2 = 'https://words.qurancdn.com/wbw/002_006_011.mp3';
  const url3 = 'https://verses.qurancdn.com/wbw/002_006_011.mp3';
  
  console.log(`audio.qurancdn.com: ${await checkUrl(url1)}`);
  console.log(`words.qurancdn.com: ${await checkUrl(url2)}`);
  console.log(`verses.qurancdn.com: ${await checkUrl(url3)}`);
}

test();
