const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    reponse.status(400).end()
  }
})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const { title, author, url, likes } = request.body
    const user = request.user

    const blog = new Blog({
      title,
      author,
      url,
      likes,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const blog = await Blog.findById(request.params.id)
      if (!blog) {
        return response.status(404).json({ error: 'Blog not found' })
      }

      const userId = request.user.id
      if (blog.user.toString() !== userId.toString()) {
        return response
          .status(403)
          .json({ error: 'Only the creator can delete this blog' })
      }

      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  }
)

blogsRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true, runValidators: true, context: 'query' }
  )

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter
