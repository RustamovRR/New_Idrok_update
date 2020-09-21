const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const multer = require('multer');
const path = require('path')
const crypto = require("crypto");
const GridFsStorage = require("multer-gridfs-storage");
const app = express()


const Article = require('./models/Schema')
const articleRouter = require('./routes/articles')
const usersRouter = require('./routes/user')
const adminNewsRouter = require('./routes/adminNewsRouter')

mongoose.connect('mongodb+srv://Idrok:riskiddin98@cluster0.thx7q.mongodb.net/article', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(console.log('mongodbga ulandi...'))


app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(express.json())
app.use(express.urlencoded())

app.use('/', usersRouter)
app.use('/admin/news', adminNewsRouter)
app.use('/articles', articleRouter)



const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`${port}chi portni eshitishni boshladim...`);
});

