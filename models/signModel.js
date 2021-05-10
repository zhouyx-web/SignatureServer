const express = require('express');
const customMysql = require('../config/basicConnection');

const signTask = {
    /**
     * 查询签署信息
     * @param {*} username 用户名
     * @param {*} password 密码
     * @returns promise
     */
    find(doc_id) {
        const sql = `select * from sign where doc_id='${doc_id}' and sign_status=1`
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