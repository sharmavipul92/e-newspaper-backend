const {Datastore} = require('@google-cloud/datastore');
const kind = 'images';
const domain = 'https://storage.googleapis.com';
const datastore = new Datastore();

async function postCoordinates(req, res) {
  console.log(req.body);
  let { date, pageNum, newsItems } = req.body;
  console.log(date, pageNum);
  let query = datastore.createQuery(kind)
                       .filter('date', '=', formatDate(date))
                       .filter('pageNumber', '=', parseInt(pageNum));
  let [newsData] = await datastore.runQuery(query);
  let news = newsItems.map(item => {
    let [data] = newsData.filter(n => item.id === n.name);
    data.coordinates = item.coordinates;
    return {
      key: datastore.key([kind, item.id]),
      data
    }
  });  
  await datastore.save(news);
  res.send({code: 200, message: 'successfully updated coordinates'});
}

async function getNews(req, res) {
  let { date, pageNum } = req.params;
  console.log(date, pageNum);
  let news = [];
  let mainPage;
  
  // console.log(formatDate(date))
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
  getNews,
  postCoordinates,
}