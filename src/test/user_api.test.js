const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper.js')

const api = supertest(app)

let token = null

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const newUser = {
    username: 'testuser',
    name: 'Test User',
    password: 'testpassword'
  }

  const userResponse = await api.post('/api/users').send(newUser)
  const userForToken = {
    username: userResponse.body.username,
    id: userResponse.body.id
  }
  token = jwt.sign(userForToken, process.env.SECRET)

  const newBlog = new Blog({
    title: 'Test Blog',
    author: 'Author',
    url: 'http://example.com',
    user: userResponse.body.id
  })

  await newBlog.save()
})

test('a blog can be added with a valid token', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'New Author',
    url: 'http://newexample.com',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.title, newBlog.title)
})

test('adding a blog fails with status 401 if no token is provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'Unknown Author',
    url: 'http://unauthorized.com',
    likes: 2
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

test('a blog can be deleted by the creator', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
})

test('deleting a blog fails with status 401 if no token is provided', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
})

after(async () => {
  await mongoose.connection.close()
})
