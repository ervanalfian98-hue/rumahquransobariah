const https = require('https');
https.get('https://api.quran.com/api/v4/verses/by_page/1?words=true', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    json.verses.forEach(v => {
      v.words.forEach(w => {
        if (w.audio_url) console.log(w.audio_url);
      });
    });
  });
});
