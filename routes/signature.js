// 用户签署相关接口
const express = require('express');
const signModel = require('../models/signModel')
const documentModel = require('../models/DocumentModel')
const router = express.Router();
const savePng = require('../utils/savePng')

// 向sign存入uid的签署记录，doc_id user_id sign_status:0
router.post('/start-sign', (req, res, next) => {
    const { doc_id, uid } = req.body

    signModel.isSigned(doc_id, uid)
        .then(result => {
            if (result) {
                res.send({ status: 1, msg: '您已经签署过此文件！' })
            } else {
                signModel.findOne(doc_id, uid)
                    .then(result => {
                        // 不存在初步签署记录
                        if (!result) {
                            signModel.create(doc_id, uid)
                                .then(() => {
                                    res.send({ status: 0, data: { uid, doc_id } })
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.send({ status: 1, msg: '用户签署记录添加失败' })
                                })
                        } else {// 存在
                            res.send({ status: 0, data: { uid, doc_id } })
                        }
                    })
            }
        })

})

/**
 * 用户提交签名
 * 1.获取数据 签名图片base64编码 doc_id uid
 * 2.处理数据
 *  - base64编码保存为png图片
 *  - 更新sign表 doc_id uid 的sign_status sign_time为1
 *  - 更新documents数据表doc_id 签署人数 signed_num
 */
router.post('/commit', (req, res, next) => {
    const { doc_id, uid, imgBase64 } = req.body
    // 判断doc_id是否能继续签署
    documentModel.findOne(doc_id)
    .then(result => {
        const {signed_num, max_sign_num, doc_status} = result
        if (result && doc_status !== 'end' && max_sign_num > signed_num) {
            // 写入图片
            savePng(uid, imgBase64)
            .then(() => {
                // 更新签署状态
                signModel.update(doc_id, uid)
                .then(() => {
                    // 更新签署人数 signed_num
                    documentModel.updateSignedNum(doc_id)
                    res.send({status:0, data:{doc_id, uid}})
                })
                .catch(err => {
                    console.log(err)
                    res.send({ status: 2, msg: '签署失败' })
                })
            })
            .catch(err => {
                console.log(err)
                res.send({ status: 1, msg: '签名保存失败，请重试' })
            })
        } else {
            res.send({status:3, msg:'签署已结束或者文件不存在，请联系管理员'})
        }
    })
    .catch(err => {
        console.log(err)
        res.send({status:4, msg:'系统错误'})
    })
})


module.exports = router;