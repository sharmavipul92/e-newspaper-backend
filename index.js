const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const { getMainPage } = require('./getData');
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/news/:date/:pageNum', getMainPage);

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))