const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url =
    `mongodb+srv://backend_user:${password}@fullstack-dnxhn.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true }).catch(function (error) {
  console.log(error)
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {

  Person.find({}).then(result => {
    console.log('\nphonebook:')
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    console.log('\n')
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(response => {
    console.log('note saved!', response)
    mongoose.connection.close()
  }).catch(function (error) {
    console.log(error)
  })
} else console.log('Arguments not valid')




