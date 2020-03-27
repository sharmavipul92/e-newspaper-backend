const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const { getMainPage } = require('./getData');
const port = process.env.PORT || 8081

app.use(cors())
// app.use('/static', express.static(path.join(__dirname, 'public')))
app.get('/main/:date/:pageNum', getMainPage)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))