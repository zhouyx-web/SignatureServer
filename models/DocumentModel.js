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
    findOne(username, password) {
        const sql = `select * from users where username='${username}' and password='${password}'`
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
        const { doc_id, doc_name, doc_dest, doc_state, doc_title } = fileObj
        const sql = `INSERT INTO documents (doc_id, doc_name, doc_dest, doc_state, doc_title) VALUES ('${doc_id}', '${doc_name}', '${doc_dest}', ${doc_state}, '${doc_title}');`
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
    }
}

module.exports = documentTask