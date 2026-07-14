const https = require('https');

https.get('https://api.quran.com/api/v4/verses/by_page/1?words=true&word_fields=text_uthmani', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    let missingCount = 0;
    let totalCount = 0;
    json.verses.forEach(verse => {
      verse.words.forEach(word => {
        totalCount++;
        if (!word.audio_url || word.audio_url === 'null') {
          console.log(`Missing audio for: ${word.text_uthmani} (Type: ${word.char_type_name})`);
          missingCount++;
        }
      });
    });
    console.log(`Total missing: ${missingCount} out of ${totalCount}`);
  });
});
