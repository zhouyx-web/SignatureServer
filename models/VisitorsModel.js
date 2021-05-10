const express = require('express');
const customMysql = require('../config/basicConnection');

const visitorsTask = {
    create(uid) {
        const sql = `INSERT INTO visitors (_id)
                    VALUES
                    ('${uid}');`
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

module.exports = visitorsTask