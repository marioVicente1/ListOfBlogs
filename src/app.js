const express = require('express')
require('dotenv').config()
const cors = require('cors')
// const express = require('express')
require('express-async-errors')
const app = express()
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const blogsRouter = require('../src/controllers/blogs')
const config = require('../src/utils/config')
const logger = require('../src/utils/logger')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGO_URL)

mongoose.connect(config.MONGO_URL)

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use(
  '/api/blogs',

  middleware.authenticateToken,
  blogsRouter
)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
