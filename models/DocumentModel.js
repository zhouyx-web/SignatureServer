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
                    resolve(results[0] || {})
                })
                .catch(err => { // 将错误一直传递下去，在路由中处理
                    reject(err)
                })
        })
    },
    /**
     * 
     * @param {*} doc_status 文档状态 create,unpublish,ongoing,end
     * @returns promise
     */
    find(doc_status, time_type){
        const sql = `select * from documents where doc_status='${doc_status}' order by ${time_type} desc;`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
                .then(results => {
                    // 这个results可能是个空数组
                    resolve(results)
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
        const { doc_id, doc_name, doc_path, doc_status, create_time } = fileObj
        const sql = `INSERT INTO documents (doc_id, doc_name, doc_path, doc_status, create_time) VALUES ('${doc_id}', '${doc_name}', '${doc_path}', '${doc_status}', '${create_time}');`
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
     * 设置：doc_name, doc_mode, creator_id, max_sign_num, re_sign, doc_id
     * @param {*} updateOptions 对数据库中的文档信息进行更新
     * @returns promise
     */
    prepareReleaseUpdate(updateOptions){
        const { doc_name, doc_mode, creator_id, max_sign_num, re_sign, doc_id } = updateOptions
        const sql = `UPDATE documents SET doc_name='${doc_name}', doc_mode='${doc_mode}', creator_id='${creator_id}', max_sign_num=${max_sign_num}, re_sign='${re_sign}' WHERE doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(doc => {
                resolve(doc)
            })
            .catch(err => {
                reject(err)
            })
        })
    },
    /**
     * 保存签署区域
     * @param {*} options 签署区域对象JSON字符串 doc_id
     * @returns propmise
     */
    signAreaUpdate(options){
        const {sign_area, doc_id, valid_time} = options
        const sql = `UPDATE documents SET sign_area='${sign_area}', doc_status='unpublish', valid_time='${valid_time}' WHERE doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(doc => {
                resolve(doc)
            })
            .catch(err => {
                reject(err)
            })
        })
    },
    /**
     * 文档发布更新
     * @param {*} endOptions release_time, end_time, doc_status, doc_id
     * @returns promise
     */
    releaseDocUpdate(endOptions){
        const {release_time, end_time, doc_status, doc_id} = endOptions
        const sql = `UPDATE documents SET release_time='${release_time}', doc_status='${doc_status}', end_time='${end_time}' WHERE doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(doc => {
                resolve(doc)
            })
            .catch(err => {
                reject(err)
            })
        })
    },
    /**
     * 结束文档的签署
     * @param {*} doc_id 要结束的文档id 
     * @param {*} end_time 结束时间
     * @returns promise
     */
    signEndUpdate(doc_id, end_time, ){
        const sql = `UPDATE documents SET doc_status='end', end_time='${end_time}' WHERE doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(doc => {
                resolve(doc)
            })
            .catch(err => {
                reject(err)
            })
        })
    },
    /**
     * 
     * @param {*} doc_id 签署人数加1
     */
    updateSignedNum(doc_id){
        const sql = `UPDATE documents SET signed_num=signed_num+1  WHERE doc_id='${doc_id}';`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = documentTask