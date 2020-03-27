const {Datastore} = require('@google-cloud/datastore');
const kind = 'images';
const domain = 'https://storage.googleapis.com';
const datastore = new Datastore();

async function getMainPage(req, res) {
  let { date, pageNum } = req.params;
  console.log(date);
  console.log(pageNum);
  let news = [];
  let mainPage;
  
  let query = datastore.createQuery(kind)
                       .filter('date', '=', new Date(formatDate(date)))
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
  getMainPage,
}