const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Vaaran tuntua',
    author: 'Seppo Taalasmaa',
    url: 'www.SepiT.com',
    likes: 0
  },
  {
    title: 'Kalareissu',
    author: 'Pojat',
    url: 'www.Ppojat.com',
    likes: 2
  },
]

const nonExsistingId = async () => {
  const blog = new Blog({ title: 'A', author: 'B', url: 'C' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExsistingId,
  blogsInDB,
  usersInDb,
}