const pdfLib = require('pdf-lib')
const fs = require('fs')
const connectModel = require('../models/connectModel')
const { PDFDocument } = pdfLib;


/**
 * 读入png图片
 * @param {*} imgNameArr 图片路径
 */
async function readPNG(imgNameArr, pdfDoc) {
    console.log('readPNG 4')
    const path = 'F:/Web-Projects/workspace/server-signature/public/upload/autograph/'
    let length = imgNameArr.length
    const pngImgArr = []
    for (let i = 0; i < length; i++) {
        let pngImageBytes = await fs.readFileSync(path + imgNameArr[i])
        let pngImg = await pdfDoc.embedPng(pngImageBytes)
        pngImgArr.push(pngImg)
    }
    return pngImgArr
}

/**
 * 
 * @param {*} areaW 签署区域宽度
 * @param {*} areaH 签署区域高度
 * @param {*} itemW 签署项宽度
 * @param {*} itemH 签署项高度
 * @param {*} itemN 签署项个数
 */
function figureSignWH(areaW, areaH, itemW, itemH, itemN) {
    console.log('figureSignWH 3', itemW, itemH, itemN)
    let max_x_num = Math.floor(areaW / itemW)
    let max_y_num = Math.floor(areaH / itemH)
    let max_num = max_x_num * max_y_num
    console.log('figureSignWH 3', max_x_num, max_y_num)
    while(max_num < itemN){
        itemW *= 0.9
        itemH *= 0.9
        max_x_num = Math.floor(areaW / itemW)
        max_y_num = Math.floor(areaH / itemH)
        max_num = max_x_num * max_y_num
    }
    return {itemW, itemH, max_x_num, max_y_num}
}

/**
 * 合并步骤的核心函数
 * @param {*} docPath 文档路径
 * @param {*} imgNameArr 图片路径
 * @param {*} sign_area 签名区域
 * @returns promise 指示合并失败、成功
 */
function mergeCoreFunc(doc_id, doc_path, imgNameArr, sign_area) {
    console.log('mergeCoreFunc 2')
    return new Promise(async (resolve, reject) => {
        // 文档路径
        const docPath = doc_path + '/' + doc_id
        const docSavePath = doc_path + '/sign-docs/' + doc_id
        const itemN = imgNameArr.length
        // 签名区域
        const { top, left, width, height, pageNumber } = sign_area
        // 签名宽高
        try {
            let initItemW = 100, initItemH = 40
            // 计算满足条件的签名项高和宽 行最大容纳的项数
            const {itemW, itemH, max_x_num, max_y_num} = figureSignWH(width, height, initItemW, initItemH, itemN)
            // 读取pdf文件
            const pdfDoc = await PDFDocument.load(fs.readFileSync(docPath))
            const page = pdfDoc.getPages()[pageNumber-1]
            const pageHeight = page.getHeight()
            // 读取图片
            const pngImgArr = await readPNG(imgNameArr, pdfDoc)
            // 合并
            for (let i = 0; i < itemN; i++) {
                // 每个图片的起点坐标
                let x = left + (i % max_x_num) * itemW
                let y = top + (parseInt(i / max_x_num)) * itemH
                // pdf-lib采用的是数学坐标系 左下角定位 转化一下y
                y = pageHeight - y -itemH
                console.log('写入文档', x, y, left, top, max_x_num, itemW, itemH)
                page.drawImage(pngImgArr[i], {
                    x,
                    y,
                    width: itemW,
                    height: itemH,
                })
            }
            // 保存
            const pdfBytes = await pdfDoc.save()
            fs.writeFileSync(docSavePath, pdfBytes)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}
/**
 * 合并文档与签名，覆盖原文件
 * @param {*} options doc_id, doc_path, sign_area 
 * @returns promise
 */
function mergeSignDoc(options) {
    console.log('mergeSignDoc 1')
    const { doc_id, doc_path, sign_area } = options
    // 获取签名路径信息
    // 根据doc_id查找sign表，拿到签署人的id 根据签署人的id查找users表，拿到签名保存路径
    return connectModel.find(doc_id)
    .then(results => {
        const imgNameArr = results.map(item => item.autograph_path)
        // 合并 返回成功或者失败
        return mergeCoreFunc(doc_id, doc_path, imgNameArr, sign_area)
    })
    .catch(err => {
        console.log('mergeSignDoc',err)
        return Promise.reject()
    })
}

module.exports = mergeSignDoc
