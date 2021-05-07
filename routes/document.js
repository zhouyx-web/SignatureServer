const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const documentModel = require('../models/documentModel')

const router = express.Router()

// 文档存储路径
const dirDocsPath = path.join(__dirname, '..', 'public/upload/docs').replace(/\\/g, '/')
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
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if(ext !== '.pdf'){
        cb(new Error('只支持上传pdf文件类型！'), false)
    } else {
        cb(null, true)
    }
}
// 文件上传限制
const limits = { fileSize: '5MB' }
// 根据配置 创建multer对象
const upload = multer({ storage, limits, fileFilter })
// 表单的name属性值
const uploadSingle = upload.single('file')

// 文件上传
router.post('/upload', (req, res, next) => {
    uploadSingle(req, res, function (err) {
        if (err) { // upload err
            return res.send({
                status: 1,
                msg: err
            })
        }
        // upload success
        var file = req.file
        const fileInfo = {
            doc_id: file.filename,
            doc_name: file.originalname,
            doc_path: dirDocsPath,
            doc_status: 'create', // 创建
        }
        documentModel.create(fileInfo)
            .then(() => { // 写入数据库成功
                res.send({
                    status: 0,
                    data: fileInfo,
                })
            })
            .catch(err => { // 写入数据库失败
                console.log(err)
                res.send({
                    status: 2,
                    msg: '上传文件失败'
                })
            })
    })
})

// 文件删除
router.post('/delete', (req, res) => {
    const { doc_id } = req.body
    // 删除数据库中的文件数据
    documentModel.delete(doc_id)
    .then(() => {
        // 删除磁盘中的文件
        fs.unlink(path.join(dirDocsPath, doc_id), (err) => {
            if (err) {
                console.log(err)
                res.send({
                    status: 1,
                    msg: '删除文件失败'
                })
            } else {
                res.send({
                    status: 0,
                    msg: '删除文件成功'
                })
            }
        })

    })
    .catch(err => {
        console.log(err)
        res.send({
            status: 2,
            msg: '删除文件失败'
        })
    })
})

// 文档预发布，保存设置信息
router.post('/release/first', (req, res, next) => {
    const updateOptions = req.body
    const {doc_id} = updateOptions
    console.log(doc_id)
    // 文档是否存在
    documentModel.findOne(doc_id)
    .then(item => {
        if(item){// exists doc, update doc_id
            documentModel.prepareReleaseUpdate(updateOptions)
            .then(doc => {
                res.send({status:0, data:doc})
            })
            .catch(err => {
                console.log(err)
                res.send({status:2, msg:'数据库操作出错'})
            })
        } else {
            res.send({status:1, msg:'文档不存在'})
        }
    })
    .catch(err => {
        console.log(err)
        res.send({status:2, msg:'数据库操作出错'})
    })
})

module.exports = router;
