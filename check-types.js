const https = require('https');
https.get('https://api.quran.com/api/v4/verses/by_chapter/2?words=true&per_page=50', (resp) => {
  let data = '';
  resp.on('data', chunk => data += chunk);
  resp.on('end', () => {
    const json = JSON.parse(data);
    let types = new Set();
    json.verses.forEach(v => {
      v.words.forEach(w => {
        types.add(w.char_type_name);
      });
    });
    console.log("Found types:", Array.from(types));
  });
});
