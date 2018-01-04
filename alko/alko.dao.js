const xlsx = require('node-xlsx').default;
const fetch = require('node-fetch');
const fs = require('fs');
const _ = require('lodash');

let alko = {};
let cachedData;
const FILE_DOWNLOAD_TIMEOUT = 10000;
const CATALOG_PATH = `./alko-catalogs/`;

alko._getUrl = function(date){
  // date format 27.12.2017
  console.log('Creating url with date', date);
  return `https://www.alko.fi/INTERSHOP/static/WFS/Alko-OnlineShop-Site/-/Alko-OnlineShop/fi_FI/Alkon%20Hinnasto%20Tekstitiedostona/alkon-hinnasto-tekstitiedostona${date}.xls`
};

alko._readResponse = function(xlsFile){
  console.log( xlsFile);
  const workSheetsFromBuffer = xlsx.parse(xlsFile);
  return workSheetsFromBuffer;
};

const createDateStr = () => {
  const date = new Date();
  const daysNum = date.getHours() <= 8 ? date.getDate() - 1 : date.getDate();
  const months = ('0' + (date.getMonth() + 1)).slice(-2)
  const days = ('0' + daysNum).slice(-2)
  return `${days}.${months}.${date.getFullYear()}`;
};

const getCatalogPath = (dateStr) => {
  return `${CATALOG_PATH}alko-catalog-${dateStr}.xls`;
};

const createAlkoCatalogStream = () => {
  const path = getCatalogPath(createDateStr());
  return {
    stream: fs.createWriteStream(path),
    path
  };
};

const readCatalog = (dateStr) => {
  const path = getCatalogPath(dateStr);
  console.log("Checking if cached file exists at ", path);
  return new Promise((res, rej) => {

    const url = alko._getUrl(dateStr);
    console.log("Did not find cached catalog. Querying from Alko with url", url);
    return res(fetchCatalog(url));
  });
};

const fetchCatalog = async (url) => {
  const res = await fetch(url);
  const data = await new Promise((resolve, reject) => {
    const { stream, path } = createAlkoCatalogStream();
    res.body.pipe(stream);
    res.body.on("error", (err) => {
      stream.close();
      reject(err);
    });
    stream.on("finish", function() {
      stream.close();
      resolve(path);
    });
  });

  if(_.isString(data)){
    return alko._readResponse(data)
  }

  return data;
};

const alkoCatalogToJson = (rawData, dataFormat) => {
  const { startIndex, columns } = dataFormat;
  const delCount = startIndex || 0;
  const data = rawData[0].data;
  data.splice(0, delCount);

  return data.map((row, index) => {
    let record = {};
    columns.forEach((columnData) => {
      record[columnData.key] = row[columnData.index];
    });
    return record;
  });
};

alko.getCatalog = function(){
  const dateStr = createDateStr();
  if(cachedData != null){
    return new Promise((res, rej) => {
      res(cachedData);
    });
  }
  return readCatalog(dateStr)
    .then((parsedResponse) => {
        return alkoCatalogToJson(parsedResponse, {
          startIndex: 4,
          columns: [
            { key: 'number', index: 0 },
            { key: 'name', index: 1 },
            { key: 'producer', index: 2 },
            { key: 'bottle_size', index: 3 },
            { key: 'price', index: 4 },
            { key: 'price_per_liter', index: 5 },
            { key: 'is_new', index: 6 },
            { key: 'pricing_ordering_code', index: 7 },
            { key: 'type', index: 8 },
            { key: 'special_group', index: 9 },
            { key: 'beer_type', index: 10 },
            { key: 'country', index: 11 },
            { key: 'region', index: 12 },
            { key: 'vintage', index: 13 },
            { key: 'labelling_info', index: 14 },
            { key: 'additional_info', index: 15 },
            { key: 'grape', index: 16 },
            { key: 'desc', index: 17 },
            { key: 'packaging_type', index: 18 },
            { key: 'closing_type', index: 19 },
            { key: 'alcohol_percent', index: 20 },
            { key: 'acids_grams_per_liter', index: 21 },
            { key: 'sugar_grams_per_liter', index: 22 },
            { key: 'energy_kcal_per_100ml', index: 26 },
            { key: 'selection', index: 27 },
          ]
        });
    })
    .then((parsedJson) => {
      cachedData = parsedJson;
      return parsedJson;
    })
    .catch((error) => {
      console.error('Found an error in the response', error);
    });
}


module.exports = alko;
