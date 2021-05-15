var createError = require('http-errors');
// 获取express对象
var express = require('express');
// 处理文件路径的模块
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var documentRouter = require('./routes/document');
var usersRouter = require('./routes/users');
var signRouter = require('./routes/signature')

// 获取express实例
var app = express();

// view 处理 指定系统变量 views view engine的值
// 指定视图模板的路径为根目录下的/views文件夹
app.set('views', path.join(__dirname, 'views'));
// console.log(__dirname) // F:\Web-Projects\workspace\server-signature app.js的文件路径
// 指定视图模板的文件类型为 jade
app.set('view engine', 'jade');

// 声明使用中间件
// 在开发环境下输出请求日志
app.use(logger('dev'));
// 解析http请求中的json数据 // 请求体参数是json结构: {name: tom, pwd: 123}
app.use(express.json({limit:"2mb"}));
// 声明使用解析POST请求的中间件 // 请求体参数是: name=tom&pwd=123
app.use(express.urlencoded({ extended: false }));
// 声明使用解析cookie的中间件
app.use(cookieParser());
// 声明使用静态中间件 一般是网页资源静态资源文件
app.use(express.static(path.join(__dirname, 'public'),{setHeaders:function(res, path){
  res.set('Access-Control-Allow-Origin','*')
}}));

// 声明使用路由器中间件
app.use('/manage/docs', documentRouter);
// 路由中间件讲究的是顺序，前一个匹配了，后面的就不会匹配，除非手动调用next()传递给下一个路由中间件
app.use('/manage/user', usersRouter);
app.use('/manage/sign', signRouter);

// catch 404 and forward to error handler
/**
 * 没有匹配的路由，就执行下面的中间件，下面的中间件把createError(404)生成的request传递给下一个
 * 中间件，就完成了404 not found的捕获
 */
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
/**
 * 这一个中间件没有调用next函数，request就不再传递
 */
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
