const https = require('https');

https.get('https://arlyon.vercel.app/', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if(match) {
      console.log('Found JS:', match[1]);
      https.get('https://arlyon.vercel.app' + match[1], (res2) => {
        let js = '';
        res2.on('data', c => js += c);
        res2.on('end', () => {
          console.log('JS File Size:', js.length);
          console.log('Has PROD_API_URL:', js.includes('https://arlyon.onrender.com/api'));
          console.log('Has new Login diagnostics:', js.includes('Login Failure Details'));
          console.log('Has Fallback API:', js.includes('?PROD_API_URL:"/api"'));
        });
      });
    } else {
      console.log('No JS found');
    }
  });
});
