const fetch = require('node-fetch'); // wait, node 18+ has native fetch

fetch('https://api.quran.com/api/v4/verses/by_page/1?language=id&words=true&word_fields=text_uthmani,translation,transliteration&translations=33&audio=7')
  .then(res => res.json())
  .then(data => {
    const word = data.verses[0].words[0];
    console.log("Audio URL from API:", word.audio_url);
    
    // Let's test the URL
    const oldCdn = `https://audio.qurancdn.com/${word.audio_url.replace(/^\/+/, '')}`;
    const newCdn = `https://words.audios.quranicaudio.com/${word.audio_url.startsWith('/') ? word.audio_url.substring(1) : word.audio_url}`;
    
    console.log("Old CDN URL:", oldCdn);
    console.log("New CDN URL:", newCdn);
    
    // fetch head to see if they are valid
    Promise.all([
      fetch(oldCdn, {method: 'HEAD'}).then(r => console.log('Old CDN status:', r.status)),
      fetch(newCdn, {method: 'HEAD'}).then(r => console.log('New CDN status:', r.status))
    ]);
  })
  .catch(err => console.error(err));
