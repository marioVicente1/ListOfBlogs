const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const api = supertest(app)
const helper = require('./test_helper.js')

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObject = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObject.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test.only('blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {
    assert(blog.id)
    assert(!blog._id)
  })
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Prueba-4',
    author: 'Prueba-4',
    url: '/Prueba/4',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(r => r.title)
  assert(titles.includes('Prueba-4'))
})

test('if likes is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog sin Likes',
    author: 'Autor sin Likes',
    url: '/blog-sin-likes'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title or url is not added', async () => {
  const newBlogWithoutTitle = {
    author: 'Autor sin Título',
    url: '/blog-sin-titulo',
    likes: 5
  }

  await api.post('/api/blogs').send(newBlogWithoutTitle).expect(400)
  const newBlogWithoutUrl = {
    title: 'Blog sin URL',
    author: 'Autor sin URL',
    likes: 5
  }

  await api.post('/api/blogs').send(newBlogWithoutUrl).expect(400)
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const titles = blogsAtEnd.map(r => r.title)
  assert(!titles.includes(blogToDelete.title))
})

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const updatedBlogData = {
    likes: blogToUpdate.likes + 1
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlogData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const updatedBlog = response.body
  assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
})

after(async () => {
  await mongoose.connection.close()
})
