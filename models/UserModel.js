/**
 * 对Users表的操作封装成一个模块，外部调用模块中对users表的增删改查方法即可完成数据库操作与读取
 * 查询：在外部需要得到查询的结果，或者失败的消息
 * 增加：在外部需要得到添加的结果，或者失败的消息
 * 修改：在外部需要得到修改的结果，或者失败的消息
 */
const express = require('express');
const customMysql = require('../config/basicConnection');

const usersTask = {
    /**
     * 查询一个用户是否存在，并且以对象或者JSON数据返回该用户
     * @param {*} username 用户名
     * @param {*} password 密码
     * @returns promise
     */
    findOne(username, password) {
        const sql = `select * from users where username='${username}' and password='${password}'`
        return new Promise ((resolve, reject) => {
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
     * 创建一个用户，返回创建的用户的对象
     * @param {*} username 
     * @param {*} password 
     */
    create(username, password) {

    },
    /**
     * 修改用户密码，返回修改后的用户对象
     * @param {*} username 
     * @param {*} newpwd 
     */
    updata(username, newpwd) {

    },
}

module.exports = usersTask