const express = require('express');
const multer = require('multer')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')

const documentModel = require('../models/documentModel')

const router = express.Router();

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
    uploadSingle(req, res, function (err) {
        if (err) { // upload err
            return res.send({
                status: 1,
                msg: '上传文件失败'
            })
        }
        // upload success
        var file = req.file
        // add file info to table named documents of mysql database
        const fileInfo = {
            doc_id: uuid.v1(),
            doc_name: file.filename,
            doc_dest: dirDocsPath,
            doc_state: 0, // 创建
            doc_title: file.originalname
        }
        documentModel.create(fileInfo)
            .then(() => { // 写入数据库成功
                res.send({
                    status: 0,
                    data: {
                        name: file.filename,
                        url: dirDocsPath + '/' + file.filename,
                        fileInfo
                    }
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

router.post('/delete', (req, res) => {
    const { doc_name, doc_id } = req.body
    // 删除数据库中的文件数据
    documentModel.delete(doc_id)
    .then(() => {
        // 删除磁盘中的文件
        fs.unlink(path.join(dirDocsPath, name), (err) => {
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

module.exports = router;
