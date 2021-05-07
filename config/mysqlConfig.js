//mysql配置对象
const mysqlConfig = {
    host: "localhost", //数据库的地址
    user: "root", //用户名
    password: "root", //用户密码 ，如果没有密码，直接双引号就是
    database: "signature", //数据库名字
    port: 3306,//mysql数据库运行端口
}

module.exports = mysqlConfig; //用module.exports暴露出这个接口，