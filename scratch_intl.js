const date = new Date();
const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
});
const parts = formatter.formatToParts(date);
console.log(parts);

const formatter2 = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
console.log(formatter2.formatToParts(date));
