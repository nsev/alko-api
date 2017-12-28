const xlsx = require('node-xlsx').default;
const fetch = require('node-fetch');
const fs = require('fs');

let alko = {};
const FILE_DOWNLOAD_TIMEOUT = 3000;

alko._getUrl = function(date){
  // date format 27.12.2017
  console.log('Creating url with date', date);
  return `https://www.alko.fi/INTERSHOP/static/WFS/Alko-OnlineShop-Site/-/Alko-OnlineShop/fi_FI/Alkon%20Hinnasto%20Tekstitiedostona/alkon-hinnasto-tekstitiedostona${date}.xls`
  return 'https://api.github.com/users/github';
}

alko._readResponse = function(body){
  // console.log( body);
  const workSheetsFromBuffer = xlsx.parse(body);
  return workSheetsFromBuffer;
}

alko.getCatalog = function(){
  const date = new Date();
  const days = date.getHours() <= 8 ? date.getDate() - 1 : date.getDate();
  const dateStr = `${days}.${date.getMonth()+1}.${date.getFullYear()}`;
  fetch(alko._getUrl(dateStr))
    // .then(res => res.body)
    // .then(res => {console.log(res);})
    .then((response) => new Promise((res, rej) => {
        // console.log(response);
        // if (response.status >= 400) {
            // throw new Error("Bad response from server");
        // }
        const dest = fs.createWriteStream('./alko-catalog.xls');
        let timer;
        response.body.pipe(dest)
          .on('open', () => {
            timer = setTimeout(() => {
              stream.close()
              rej({reason: 'Timed out downloading file', meta: {url}})
            }, FILE_DOWNLOAD_TIMEOUT)
          })
          .on('error', (error) => {
            clearTimeout(timer)
            rej({reason: 'Unable to download file', meta: {url, error}})
          })
          .on('finish', () => {
            clearTimeout(timer)
            res('./alko-catalog.xls')
          });
    }))
    .then((buffer) => {
        const parsedResponse = alko._readResponse(buffer)
        // console.log(parsedResponse);
        parsedResponse
        .forEach((entry) => {
          const gg = entry.data[4];
          console.log(gg);
        });
        return parsedResponse;
    })
    .catch((error) => {
      console.error('Found an error in the response', error);
    });
}


module.exports = alko;
