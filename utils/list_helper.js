const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  let totalLikes = blogs.reduce((sum, blog) => {
    return sum += blog.likes
  }, 0)

  return totalLikes
}

const favoriteBlog = (blogs) => {
  let blogWithMostLikes
  blogs.forEach(blog => {
    blogWithMostLikes = blogWithMostLikes || blog
    blogWithMostLikes = blog.likes > blogWithMostLikes.likes ? blog : blogWithMostLikes
  })

  return blogWithMostLikes === undefined ? {} : blogWithMostLikes
}

const filterAuthor = (blog, author) => {
  return blog.author === author
}

const mostBlogs = (blogs) => {
  let authorWithMostBlogs
  blogs.forEach(blog => {
    authorWithMostBlogs = authorWithMostBlogs || { author: blog.author, blogs: 0 }
    const n = blogs.filter(b => filterAuthor(b, authorWithMostBlogs.author)).length
    authorWithMostBlogs = n < authorWithMostBlogs.blogs ? authorWithMostBlogs : { author: blog.author, blogs: n }
  })

  return authorWithMostBlogs === undefined ? {} : authorWithMostBlogs
}

const mostLikes = (blogs) => {
  let a
  blogs.forEach(blog => {
    a = a || { author: blog.author, likes: blog.likes }
    const likes = blogs
      .filter(b => filterAuthor(b, blog.author))
      .reduce((sum, obj) => sum + obj.likes, 0)

    a = likes < a.likes ? a : { author: blog.author, likes: likes }
  })
  return a === undefined ? {} : a
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}