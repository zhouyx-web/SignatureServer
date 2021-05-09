// 连接查询
const express = require('express');
const customMysql = require('../config/basicConnection');

const connectTask = {
    /**
     * users/sign表
     * @param {*} doc_id 
     * @returns 
     */
    find(doc_id) {
        const sql = `SELECT autograph_path FROM users,sign WHERE _id=user_id AND doc_id='${doc_id}' AND sign_status=1`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(results => {
                resolve(results)
            })
            .catch(err => { // 将错误一直传递下去，在路由中处理
                reject(err)
            })
        })
    },
}

module.exports = connectTask