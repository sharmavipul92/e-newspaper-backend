const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const { getPage, postCoordinates, getFullPaper, downloadNewspaper, getSingleNews } = require('./getData');
const port = process.env.PORT || 8080

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/news/paper/:date', getFullPaper);
app.post('/news/coordinates', postCoordinates);
app.get('/news/:id', getSingleNews);
app.get('/news/:date/:pageNum', getPage);
app.get('/download/:date', downloadNewspaper);

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))