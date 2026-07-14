const https = require('https');

https.get('https://api.quran.com/api/v4/verses/by_key/2:6?words=true', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    json.verse.words.forEach(word => {
        console.log(`${word.text_uthmani} -> ${word.audio_url}`);
    });
  });
});
