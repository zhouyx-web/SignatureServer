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
}

module.exports = signTask