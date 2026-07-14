const https = require('https');

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(0)).end();
  });
}

https.get('https://api.quran.com/api/v4/verses/by_chapter/1?words=true&per_page=10', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', async () => {
    const json = JSON.parse(data);
    for (const verse of json.verses) {
      for (const word of verse.words) {
        if (word.audio_url && word.audio_url !== 'null') {
           const url = word.audio_url.startsWith('http') ? word.audio_url : `https://audio.qurancdn.com/${word.audio_url.startsWith('/') ? word.audio_url.slice(1) : word.audio_url}`;
           const code = await checkUrl(url);
           if (code !== 200) {
             console.log(`Missing: ${url} -> ${code}`);
           }
        }
      }
    }
    console.log("Done checking chapter 1");
  });
});
