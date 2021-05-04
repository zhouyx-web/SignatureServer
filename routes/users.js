const express = require('express');
const userModel = require('../models/UserModel')
const router = express.Router();

/* POST user login. */
router.post('/login', function (req, res, next) {
  const {username, password} = req.body
  console.log('login',req.body)
  userModel.findOne(username, password)
    .then(user => {
      if(user){// login success
        res.send({status:0, data:user})
      } else {// login failed
        res.send({status:1, msg:'用户名或者账号不正确！'})
      }
    })
    .catch(err => {
      console.log('登陆异常', err)
      res.send({status: 1, msg: '登陆异常, 请重新尝试'})
    })
});

module.exports = router;
