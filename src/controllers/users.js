const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: 'password must be at least 3 characteres long' })
  }

  if (!username || username.length < 3) {
    return response
      .status(400)
      .json({ error: 'username must be at least 3 characteres long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    if (error.code === 11000) {
      return response.status(400).json({ error: 'Username must be unique' })
    }
    console.error(error)
    response
      .status(500)
      .json({ error: 'An error occurred while creating the user' })
  }
})

module.exports = usersRouter
