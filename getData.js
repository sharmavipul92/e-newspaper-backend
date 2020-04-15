const {Datastore} = require('@google-cloud/datastore');
const {Storage} = require('@google-cloud/storage');
const kind = 'images';
const domain = 'https://storage.googleapis.com';
const bucketName = 'seema-sandesh-epaper';

const datastore = new Datastore();
const storage = new Storage();

async function postCoordinates(req, res) {
  let { date, pageNum, newsItems } = req.body;
  console.log(date, pageNum);
  let query = datastore.createQuery(kind)
                       .filter('date', '=', formatDate(date))
                       .filter('pageNumber', '=', parseInt(pageNum));
  let [newsData] = await datastore.runQuery(query);
  let news = newsItems.map(item => {
    let [data] = newsData.filter(n => item.id === n.name);
    if(data) {
      data.coordinates = item.coordinates;
      return {
        key: datastore.key([kind, item.id]),
        data
      }
    }
  });  
  await datastore.save(news);
  res.send({code: 200, message: 'successfully updated coordinates'});
}


async function getSingleNews(req, res) {
  let id = req.params.id;
  id = id.replace(/-/g, '/') + '.jpg';
  console.log(id);
  
  let [news] = await datastore.get(datastore.key([kind, id]));
  console.log(news);
  if(news) {
    res.send({ code: 200, newsLink: `${domain}/${news.bucket}/${news.name}` });
  } else {
    res.send({ code: 204 });
  }
}

async function getPage(req, res) {
  let { date, pageNum } = req.params;
  console.log(date, pageNum);
  let news = [];
  let mainPage;
  
  let query = datastore.createQuery(kind)
                       .filter('date', '=', formatDate(date))
                       .filter('pageNumber', '=', parseInt(pageNum));
  let [newsData] = await datastore.runQuery(query);
  for(let snippet of newsData) {
    if(snippet.name.includes('main')){
      mainPage = `${domain}/${snippet.bucket}/${snippet.name}`;
    } else {
      news.push({
        link: `${domain}/${snippet.bucket}/${snippet.name}`,
        id: snippet.name,
        coordinates: snippet.coordinates
      })
    }
  }
  let code = news.length ? 200 : 204;
  res.send({code, news, mainPage});
}

async function getFullPaper(req, res) {
  let date = req.params.date;
  console.log(date);
  let pages = {};
  
  let query = datastore.createQuery(kind)
                       .filter('date', '=', formatDate(date));
  let [newsData] = await datastore.runQuery(query);
  for(let snippet of newsData) {
    if(!pages[snippet.pageNumber]){
      pages[snippet.pageNumber] = { mainPage: '', news: [] };
    }
    if(snippet.name.includes('main')){
      pages[snippet.pageNumber].mainPage = `${domain}/${snippet.bucket}/${snippet.name}`;
    } else {
      pages[snippet.pageNumber].news.push({
        link: `${domain}/${snippet.bucket}/${snippet.name}`,
        id: snippet.name,
        coordinates: snippet.coordinates
      })
    }
  }
  let code = Object.keys(pages).length ? 200 : 204;
  res.send({code, pages});
}

async function downloadNewspaper(req, res, next) {
  let dateStr = req.params.date;
  let srcFilename;
  console.log(dateStr);
  if(!isNaN(Date.parse(dateStr))) {
    let fileName = `seema-sandesh-${formatDate(dateStr)}.pdf`;
    srcFilename = `pdf/${fileName}`;
  } else {
    srcFilename = dateStr.split('-').join('/') + '.jpg';
  }

  try {
    let file = storage.bucket(bucketName).file(srcFilename);
    file.exists().then(async (data) => {
      if(data[0]) {
        res.send({code: 200, link: `${domain}/${bucketName}/${srcFilename}` });
      } else {
        throw new Error('file not found.');
      }
    }).catch((err) => {
      console.error('file not found.');
      next(err);
    })
  } catch (error) {
    console.error('file not found.');
    next(error);
  }
}

/*
async function downloadNewspaper(req, res, next) {
  let dateStr = req.params.date;
  console.log(dateStr);
  const cwd = path.join(__dirname, '/downloads');
  let fileName = `seema-sandesh-${formatDate(dateStr)}.pdf`;
  let srcFilename = `pdf/${fileName}`;
  let destFilename = path.join(cwd, fileName);

  try {
    if (!fs.existsSync(destFilename)) {
      let file = storage.bucket(bucketName).file(srcFilename);
      file.exists().then(async (data) => {
        if(data[0]) {
          await file.download({ destination: destFilename });
          res.download(destFilename);
        } else {
          throw new Error('file not found');
        }
      }).catch((err) => {
        console.error(err);
        next(err);
      })
    } else {
      res.download(destFilename);
    }
    
  } catch (error) {
    console.error('file not found.');
    next(error);
  }
}
*/

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

module.exports = {
  getPage,
  postCoordinates,
  getFullPaper,
  downloadNewspaper,
  getSingleNews,
}