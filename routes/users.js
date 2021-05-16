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

// 用户注册
router.post('/register', (req, res, next) => {
  const {username, password} = req.body
  userModel.findOne(username, password)
  .then(user => {
    if (user) {
      res.send({ status: 2, msg:'注册失败，用户名重复！' })
    } else {
      userModel.create(username, password)
      .then(_id => {
        res.send({status:0, data:{username, password, _id}})
      })
      .catch(err => {
        console.log('register', err)
        res.send({status:3, msg:'注册失败，请重试'})
      })
    }
  })
  .catch(err => {
    console.log('注册失败', err)
    res.send({ status: 1, msg: '注册失败，请重试' })
  })
})

// 修改密码
router.post('/update', (req, res, next) => {
  const {username, oldPwd, password} = req.body
  // 查询输入的账号与密码是否正确
  userModel.findOne(username, oldPwd)
  .then(user => {
    if (user) {
      userModel.updata(username, password)
      .then(() => {
        res.send({status:0, msg:'密码修改成功,请重新登录'})
      })
      .catch(() => {
        res.send({status:3, msg:'密码修改失败，请稍后重试'})
      })
    } else {
      res.send({ status: 2, msg:'账号或旧密码错误' })
    }
  })
  .catch(err => {
    console.log('操作失败', err)
    res.send({ status: 1, msg: '服务器错误，请稍后重试' })
  })
})

module.exports = router;
