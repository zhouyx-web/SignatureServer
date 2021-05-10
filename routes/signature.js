// 用户签署相关接口
const express = require('express');
const signModel = require('../models/signModel')
const documentModel = require('../models/DocumentModel')
const router = express.Router();

// 向sign存入uid的签署记录，doc_id uesr_id sign_status:0
router.post('/start-sign', (req, res, next) => {
    const {doc_id, uid} = req.body
    signModel.create(doc_id, uid)
    .then(() => {
        res.send({ status: 0, data: { uid } })
    })
    .catch(err => {
        console.log(err)
        res.send({ status: 1, msg: '用户签署记录添加失败' })
    })
})


module.exports = router;