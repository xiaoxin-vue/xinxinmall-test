const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

// $route GET api/users/test
// @desc 返回请求的json数据
// @access public
// router.get('/test', (req, res) =>{
//   res.json({msg: "login works"})
// })

// $route POST api/users/register
// @desc 返回请求的json数据
// @access public
router.post('/register', (req, res) =>{
  // console.log(req.body);
  //查询数据库是否拥有邮箱
  User.findOne({email: req.body.email})
      .then((user) => {
        if(user) {
          return res.status(400).json({email: '邮箱已被注册！'})
        }else {
          const avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar,
            password: req.body.password
          })
          // 加密密码
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if(err) throw err
                newUser.password =hash
                // 将注册信息保存到User01数据库中的user集合中
                newUser.save()
                       .then(user => res.json(user))
                       .catch(err => console.log(err))
            })
          })
        }
      })
})

// $route POST api/users/login
// @desc 返回token jwt passport
// @access public
router.post('/login', (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  // 查询数据库
  User.findOne({name})
      .then(user => {
        if(!user) {
          res.status(404).json({msg: '用户不存在'})
        } else {
          User.findOne({email})
              .then(user => {
                if(!user) {
                  return res.status(404).json({msg: "邮箱错误，请重新输入。"})
                } else {
                  // 密码匹配
                  bcrypt.compare(password, user.password)
                        .then(isMatch => {
                          if(isMatch) {
                            // res.json({msg: 'success'})
                            const rule = { id: user.id, name: user.name}
                            // jwt.sign('规则', '加密名字', '过期时间', '箭头函数')
                            jwt.sign(rule, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                              res.json({
                                success: true,
                                token: 'Bearer ' + token
                              })
                            })
                          } else{
                            return res.status(404).json({msg: '密码错误，请重新输入。'})
                          }
                        })
                } 
              })
        }
      })
})

// $route POST api/users/current
// @desc 返回token jwt passport
// @access public

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
})

module.exports = router