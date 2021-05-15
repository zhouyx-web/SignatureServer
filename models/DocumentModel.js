/**
 * document表的操作模块
 */
const express = require('express');
const customMysql = require('../config/basicConnection');

const documentTask = {
    /**
     * 查询文档或者某个状态的文档是否存在
     * @param {*} doc_id 
     * @param {*} doc_status 
     * @returns 
     */
    findOne(doc_id, doc_status) {
        let sql
        if(doc_status){
            sql = `select * from documents where doc_id='${doc_id}' and doc_status='${doc_status}';`
        } else {
            sql = `select * from documents where doc_id='${doc_id}';`
        }
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
    find(doc_status, time_type, creator_id){
        const sql = `select * from documents where doc_status='${doc_status}' and creator_id='${creator_id}' order by ${time_type} desc;`
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
        const { doc_id, doc_name, doc_path, doc_status, create_time, creator_id, } = fileObj
        const sql = `INSERT INTO documents (doc_id, doc_name, doc_path, doc_status, create_time, creator_id) VALUES ('${doc_id}', '${doc_name}', '${doc_path}', '${doc_status}', '${create_time}', '${creator_id}');`
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
        const { doc_name, doc_mode, max_sign_num, re_sign, doc_id } = updateOptions
        const sql = `UPDATE documents SET doc_name='${doc_name}', doc_mode='${doc_mode}', max_sign_num=${max_sign_num}, re_sign='${re_sign}' WHERE doc_id='${doc_id}';`
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
    },
    /**
     * 尝试开启补签
     * 如果文档可以补签，则修改 doc_status re_sign max_sign_num doc_mode
     * @param {*} doc_id 
     * @returns 
     */
    repeatSign(doc_id){
        const sql= `UPDATE documents
                    SET doc_status='ongoing', re_sign='re_signed', max_sign_num=10000, doc_mode='unlimited'
                    WHERE doc_id='${doc_id}' AND re_sign='allow'`
        return new Promise((resolve, reject) => {
            customMysql.query(sql)
            .then(results => {
                // console.log(results.affectedRows)
                console.log(results.changedRows)
                if(results.affectedRows > 0){
                    resolve()
                } else {
                    reject()
                }
            })
            .catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = documentTask