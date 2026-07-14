const https = require('https');

https.get('https://api.quran.com/api/v4/verses/by_chapter/1?language=id&words=true&word_fields=text_uthmani,translation&translations=33&per_page=50', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(JSON.parse(data).verses[0]);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
