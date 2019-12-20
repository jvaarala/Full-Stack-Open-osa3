console.log('Starting server...')

require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('post', function (req) {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())


/*let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]*/

app.get('/info', (req, res) => {
  Person.count({}, function (err, count) {
    res.send(
      '<div>Phone book has info for ' + count + ' people</div>' +
            '<div>' + new Date(Date.now()).toLocaleString('fi-FI', { timeZone: 'Europe/Helsinki' }) + '</div>'
    )
  })

})


app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        console.log('No content found with given ID ', req.params.id)
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      console.log('Person found and deleted with ID ', req.params.id, result)
      res.status(204).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(() => res.status(404).send({ error: 'Unknown endpoint' }))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  console.log('Attempt to POST: ', person)

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log('Catched by errorhandler:\n' + error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})