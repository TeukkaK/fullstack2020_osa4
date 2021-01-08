const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

const URL = '/api/blogs'

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('GETting blogs', () => {
  test('blogs are returned as JSON', async () => {
    await api
      .get(URL)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get(URL)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('specific blog is returned', async () => {
    const response = await api.get(URL)

    const titles = response.body.map(b => b.title)
    const authors = response.body.map(b => b.author)
    const url = response.body.map(b => b.url)
    const likes = response.body.map(b => b.likes)

    expect(titles).toContain(helper.initialBlogs[0].title)
    expect(authors).toContain(helper.initialBlogs[0].author)
    expect(url).toContain(helper.initialBlogs[0].url)
    expect(likes).toContain(helper.initialBlogs[0].likes)
  })

  test('blogs contain id instead of _id', async () => {
    const blogs = await helper.blogsInDB()
    const blog = blogs[0]

    expect(blog.id).toBeDefined()
    expect(blog._id).toBeUndefined()
  })
})

describe('GETting blogs with id', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDB()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`${URL}/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExsistingId()

    await api
      .get(`${URL}/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    await api
      .get(`${URL}/${123}`)
      .expect(400)
  })
})

describe('POSTing blogs ', () => {
  test('fails with 401 when adding valid blog without token', async () => {
    const newBlog = {
      author: 'author',
      title: 'title',
      url: 'url',
      likes: 5
    }

    await api
      .post(URL)
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a valid blog can be added with token', async () => {
    const newBlog = {
      author: 'author',
      title: 'title',
      url: 'url',
      likes: 5
    }

    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)

    const validtoken = `bearer ${returnObject.body.token}`

    await api
      .post(URL)
      .set('Authorization', validtoken)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    const authors = blogsAtEnd.map(b => b.author)
    const url = blogsAtEnd.map(b => b.url)
    const likes = blogsAtEnd.map(b => b.likes)

    expect(titles).toContain(newBlog.title)
    expect(authors).toContain(newBlog.author)
    expect(url).toContain(newBlog.url)
    expect(likes).toContain(newBlog.likes)

    const zeroLikesBefore = helper.initialBlogs.filter(b => b.likes === 0).length
    const zeroLikesAfter = blogsAtEnd.filter(b => b.likes === 0).length
    expect(zeroLikesAfter).toBe(zeroLikesBefore)
  })

  test('a blog without likes can be added (with token)', async () => {
    const newBlog = {
      author: 'author',
      title: 'title',
      url: 'url'
    }

    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)

    const validtoken = `bearer ${returnObject.body.token}`

    await api
      .post(URL)
      .set('Authorization', validtoken)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const zeroLikesBefore = helper.initialBlogs.filter(b => b.likes === 0).length
    const zeroLikesAfter = blogsAtEnd.filter(b => b.likes === 0).length
    expect(zeroLikesAfter).toBe(zeroLikesBefore + 1)
  })

  test('blog without author is not added (with token)', async () => {
    const newBlog = {
      title: 'title',
      url: 'url',
      likes: 5
    }

    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)

    const validtoken = `bearer ${returnObject.body.token}`

    await api
      .post(URL)
      .set('Authorization', validtoken)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without title is not added (with token)', async () => {
    const newBlog = {
      author: 'author',
      url: 'url',
      likes: 5
    }

    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)

    const validtoken = `bearer ${returnObject.body.token}`

    await api
      .post(URL)
      .set('Authorization', validtoken)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without URL is not added (with token)', async () => {
    const newBlog = {
      title: 'title',
      author: 'author',
      likes: 5
    }

    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)

    const validtoken = `bearer ${returnObject.body.token}`

    await api
      .post(URL)
      .set('Authorization', validtoken)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('DELETE blogs', () => {
  test('succeeds with status code 204 if id and token is valid', async () => {
    const blogsAtStart = await helper.blogsInDB()

    const blogToDelete = {
      title: 'Haisunäätä',
      author: 'PaavoPesusieni',
      url: 'Kameli'
    }

    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)
    const validtoken = `bearer ${returnObject.body.token}`

    const response = await api
      .post(URL)
      .set('Authorization', validtoken)
      .send(blogToDelete)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsInMiddle = await helper.blogsInDB()
    expect(blogsInMiddle).toHaveLength(blogsAtStart.length + 1)

    const id = response.body.id

    await api
      .delete(`${URL}/${id}`)
      .set('Authorization', validtoken)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtEnd).toHaveLength(blogsInMiddle.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    const authors = blogsAtEnd.map(b => b.author)
    const url = blogsAtEnd.map(b => b.url)

    expect(titles).not.toContain(blogToDelete.title)
    expect(authors).not.toContain(blogToDelete.author)
    expect(url).not.toContain(blogToDelete.url)
  })

  test('fails with invalid id', async () => {
    const returnObject = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
      .expect('Content-Type', /application\/json/)
    const validtoken = `bearer ${returnObject.body.token}`

    await api
      .delete(`${URL}/123`)
      .set('Authorization', validtoken)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails 401 without token', async () => {
    await api
      .delete(`${URL}/123`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('PUT blogs', () => {
  test('likes can be added', async () => {
    let blogsAtStart = await helper.blogsInDB()
    const modifiedBlog = blogsAtStart[0]
    modifiedBlog.likes = modifiedBlog.likes + 1

    await api
      .put(`${URL}/${modifiedBlog.id}`)
      .send(modifiedBlog)
      .expect(200)
    const blogsAtEnd = await helper.blogsInDB()
    const blog = blogsAtEnd.filter(b => b.id === modifiedBlog.id)[0]
    expect(blog.likes).toBe(modifiedBlog.likes)
  })
})
afterAll(() => {
  mongoose.connection.close()
})