const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Prueba-1',
    author: 'Prueba-1',
    url: '/Prueba/1',
    likes: 1
  },
  {
    title: 'Prueba-2',
    author: 'Prueba-2',
    url: '/Prueba/2',
    likes: 2
  }
]

const initialUsers = [
  {
    username: 'testuser1',
    name: 'Test User 1',
    passwordHash: 'hashedPassword1'
  },
  {
    username: 'testuser2',
    name: 'Test User 2',
    passwordHash: 'hashedPassword2'
  }
]

const noExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return notEqual._id.toString()
}

const blogsInDb = async () => {
  const blog = await Blog.find({})
  return blog.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  noExistingId,
  blogsInDb,
  usersInDb,
  initialUsers
}
