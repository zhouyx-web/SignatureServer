const express = require('express');
const customMysql = require('../config/basicConnection');

const signTask = {

    /**
     * 是否已经存在开始签署的信息
     * @param {*} doc_id 
     * @param {*} user_id 
     * @returns 
     */
    findOne(doc_id, user_id){
        const sql = `SELECT * FROM sign 
            WHERE doc_id='${doc_id}' AND user_id='${user_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
                .then(results => {
                    resolve(results[0])
                })
                .catch(err => { // 将错误一直传递下去，在路由中处理
                    reject(err)
                })
        })
    },
    /**
     * 检查用户是否已经签署过了
     * @param {*} doc_id 文件名
     * @param {*} user_id 签署id
     * @returns promise
     */
    isSigned(doc_id, user_id) {
        const sql = `SELECT * FROM sign 
            WHERE doc_id='${doc_id}' AND user_id='${user_id}' AND sign_status=1;`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
                .then(results => {
                    resolve(results[0])
                })
                .catch(err => { // 将错误一直传递下去，在路由中处理
                    reject(err)
                })
        })
    },
    /**
     * 
     * @param {*} doc_id 签署的文档
     * @param {*} user_id 签署的用户id
     * @param {*} sign_status 签署状态 0 未提交
     */
    create(doc_id, user_id, sign_status=0){
        const sql = `INSERT INTO sign (doc_id, user_id, sign_status)
                    VALUES
                    ('${doc_id}', '${user_id}', ${sign_status});`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(results => {
                // 以数组的形式返回签署人id
                resolve(results)
            })
            .catch(err => { // 将错误一直传递下去，在路由中处理
                reject(err)
            })
        })
    }
}

module.exports = signTask