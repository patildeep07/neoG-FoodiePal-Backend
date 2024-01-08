const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')

const { initialiseDatabase } = require('./database/db.connection')

const restaurants = require('./routes/restaurants.router')

// Cors
app.use(cors())
app.use(helmet())
app.use(express.json())



initialiseDatabase()

// Routes

app.get('/', (req, res) => {
  res.send('Welcome to FoodiePal API')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, (req, res) => {
  console.log(`Server is running on ${PORT}`)
})

app.use('/restaurants', restaurants)