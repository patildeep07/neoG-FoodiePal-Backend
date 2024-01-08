const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username:{type:String, required:true, unique:true},
  profilePicture:{type:String, required:true},
  password:{type:String, required:true}
})

const User = mongoose.model('User', userSchema)

// async function addUser() {
//   try {
//     const newUser = new User({
//       password: '123456',
//       profilePicture: 'www.example.com',
//       username: 'patildeep07',
//     })

//     await newUser.save()
//     console.log('New user: ', newUser)
//   } catch (error) {
//     console.log(error)
//   }
// }

// addUser()

module.exports = User