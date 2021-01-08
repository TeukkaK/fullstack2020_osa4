const mongoose = require('mongoose')
const config = require('./utils/config')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
  title: 'OTSIKKO',
  author: 'KIRJOITTAJA',
  url: 'OSOITE',
  likes: 69,
})


blog.save()
  .then(() => {
    console.log('Note Saved!')
    mongoose.connection.close()
  })