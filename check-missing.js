const https = require('https');
https.get('https://api.quran.com/api/v4/verses/by_chapter/2?words=true&per_page=50', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    let missingCount = 0;
    json.verses.forEach(verse => {
      verse.words.forEach(word => {
        if ((!word.audio_url || word.audio_url === 'null') && word.char_type_name !== 'end') {
          console.log(`Missing audio for word: ${word.text_uthmani} (Type: ${word.char_type_name})`);
          missingCount++;
        }
      });
    });
    console.log(`Found ${missingCount} regular words without audio.`);
  });
});
