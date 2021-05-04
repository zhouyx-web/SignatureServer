const express = require('express');
const multer = require('multer')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')

const documentModel = require('../models/documentModel')

const router = express.Router();

// 文档存储路径
const dirDocsPath = path.join(__dirname, '..', 'public/upload/docs')
// 配置存储路径和文件名 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(dirDocsPath)) {
            fs.mkdir(dirDocsPath, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    cb(null, dirDocsPath)
                }
            })
        } else {
            cb(null, dirDocsPath)
        }
    },
    filename: function (req, file, cb) {
        // originalname 上传时的文件名 下面是取出扩展名
        var ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})
// 文件过滤 未找到使用方式
// const fileFilter = (req, file, cb) => {

// }
// 文件上传限制
const limits = { fileSize: '5MB' }
// 根据配置 创建multer对象
const upload = multer({ storage, limits })
// 表单的name属性值
const uploadSingle = upload.single('file')

// 注册路由
router.post('/upload', (req, res, next) => {
    uploadSingle(req, res, function (err) { //错误处理
        if (err) {
            return res.send({
                status: 1,
                msg: '上传文件失败'
            })
        }
        var file = req.file
        res.send({
            status: 0,
            data: {
                name: file.filename,
                url: dirDocsPath +'/'+ file.filename
            }
        })

    })
})

module.exports = router;
