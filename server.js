const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')

// DB config
const db = require('./config/keys').mongoUrl

// 引入users.js
const users = require('./routes/api/users')
const profiles = require('./routes/api/profiles')

// connect to mongoDB
mongoose.connect(db)
        .then(() => console.log('mongoDB connected'))
        .catch((err) => console.log(err))

const app = express()

app.use(express.json()) // for parsing application/json 前端传给后端的数据为.json格式的字符串
app.use(express.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded 前端传给后端的是一个post请求，表单格式数据

// 初始化passport
app.use(passport.initialize())
require('./config/passport')(passport)

// app.get('/', (req, res) =>{
//   res.send('Hello world!')
// })

// 使用router
app.use('/api/users', users)
app.use('/api/profiles', profiles)

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})