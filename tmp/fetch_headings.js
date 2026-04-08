const https = require('https');

https.get('https://solaryeco.es/placas-solares/aranda-de-duero-burgos', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gs;
    let match;
    const headings = [];
    while ((match = regex.exec(data)) !== null) {
      headings.push({
        level: 'h' + match[1],
        content: match[2].replace(/<[^>]+>/g, '').trim() // remove inner tags
      });
    }
    console.log(JSON.stringify(headings, null, 2));
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
