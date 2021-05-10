const express = require('express');
const userModel = require('../models/UserModel')
const visitorModel = require('../models/VisitorsModel')
const documentModel = require('../models/DocumentModel')
const uuid = require('uuid')
const router = express.Router();

/* POST user login. */
router.post('/login', function (req, res, next) {
  const { username, password } = req.body
  console.log('login', req.body)
  userModel.findOne(username, password)
    .then(user => {
      if (user) {// login success
        res.send({ status: 0, data: user })
      } else {// login failed
        res.send({ status: 1, msg: '用户名或者账号不正确！' })
      }
    })
    .catch(err => {
      console.log('登陆异常', err)
      res.send({ status: 1, msg: '登陆异常, 请重新尝试' })
    })
});

// 用户请求获取uid
router.get('/get-uid', (req, res, next) => {
  console.log('get-uid')
  /**
   * 1.生成uid,存入visitors表
   * 2.返回生成的uid
   * 3.前端将uid存入localstorage
   */
  const uid = uuid.v1()
  visitorModel.create(uid)
    .then(() => {
      res.send({
        status: 0,
        data: { uid }
      })
    })
    .catch(err => {
      res.send({ status: 1, msg: '创建游客账号失败' })
      console.log(err)
    })
})

module.exports = router;
