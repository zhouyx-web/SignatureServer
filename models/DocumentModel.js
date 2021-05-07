/**
 * document表的操作模块
 */
const express = require('express');
const customMysql = require('../config/basicConnection');

const documentTask = {
    /**
     * 查询一个用户是否存在，并且以对象或者JSON数据返回该用户
     * @param {*} username 用户名
     * @param {*} password 密码
     * @returns promise
     */
    findOne(doc_id) {
        const sql = `select * from documents where doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
                .then(results => {
                    // 这个results可能是个空数组
                    resolve(results[0])
                })
                .catch(err => { // 将错误一直传递下去，在路由中处理
                    reject(err)
                })
        })
    },
    /**
     * 创建一个文件数据，返回创建的对象
     * @param {*} fileObj 包含doc_id, doc_name, doc_dest, doc_state, doc_title的对象
     * @returns promise
     */
    create(fileObj) {
        const { doc_id, doc_name, doc_path, doc_status } = fileObj
        const sql = `INSERT INTO documents (doc_id, doc_name, doc_path, doc_status) VALUES ('${doc_id}', '${doc_name}', '${doc_path}', '${doc_status}');`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
                .then(results => {
                    // 插入结果
                    resolve(results)
                })
                .catch(err => { // 将错误一直传递下去，在路由中处理
                    reject(err)
                })
        })
    },
    /**
     * 删除数据库中的文件信息
     * @param {*} doc_id
     * @returns promise
     */
    delete(doc_id){
        const sql = `DELETE FROM documents WHERE doc_id = '${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
                .then(results => {
                    // 删除成功
                    resolve(results)
                })
                .catch(err => { // 将错误一直传递下去，在路由中处理
                    reject(err)
                })
        })
    },
    /**
     * 签署文档预发布
     * 设置：doc_name, doc_mode, creator_id, max_sign_num, re_sign
     * @param {*} updateOptions 对数据库中的文档信息进行更新
     * @returns promise
     */
    prepareReleaseUpdate(updateOptions){
        const { doc_name, doc_mode, creator_id, max_sign_num, re_sign, doc_id } = updateOptions
        const sql = `UPDATE documents SET doc_name='${doc_name}', doc_status='unpublish', doc_mode='${doc_mode}', creator_id='${creator_id}', max_sign_num=${max_sign_num}, re_sign='${re_sign}' WHERE doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(doc => {
                resolve(doc)
            })
            .catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = documentTask