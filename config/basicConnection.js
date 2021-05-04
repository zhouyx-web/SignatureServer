//mysql连接池配置文件
var mysql = require('mysql');
// 引入连接数据库的配置文件
var dbConfig = require('./mysqlConfig');

/**
 * 为此数据库创建和维护一个连接池，当某个连接断开时，这些连接会缓存到连接池中，当接收到新的连接
 * 请求时，就可以从连接池取出可用的连接，不用再去创建新的连接。
 */
var pool = mysql.createPool(dbConfig);

/**
 * 对query执行的结果自定义返回JSON结果
 */
function responseDoReturn(res, result, resultJSON) {
    if (typeof result === 'undefined') {
        res.json({
            code: '201',
            msg: 'failed to do'
        });
    } else {
        res.json(result);
    }
};

/**
 * 
 * sql 
 * callback 外部传入的数据处理函数
 */
/**
 * 封装query之sql带不占位符func
 * @param {*} sql sql查询语句
 * @param {*} callback 
 * @returns promise
 */
function query(sql, callback) {
    // 连接数据库
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) { // connect failed
                reject(err)
            } else { // connect success
                connection.query(sql, function (err, rows) {
                    //释放链接
                    connection.release();
                    if(err) { // query failed
                        reject(err)
                    }
                    else { // query success
                        resolve(rows)
                    }
                });
            }

        });
    })

}

/**
 * 封装query之sql带占位符func
 * arg替换sql语句的 ? 占位符，相当于一个参数
 */
function queryArgs(sql, args, callback) {
    pool.getConnection(function (err, connection) {
        connection.query(sql, args, function (err, rows) {
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}

//exports
module.exports = {
    query: query,
    queryArgs: queryArgs,
    doReturn: responseDoReturn
}