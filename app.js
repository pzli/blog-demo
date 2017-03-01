var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var mongoose = require('mongoose');
var routes = require('./routes/index');
// var users = require('./routes/users');
var settings = require('./settings');
var flash = require('connect-flash');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// mongoose.connect('mongodb://localhost/blog', function (err, res) {
//   if (err) {
//     console.log('DB CONNECTION FAIL')
//   } else {
//     console.log('DB CONNECTION SUCCESS')
//   }
// })

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // 设置模板引擎为ejs

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); 设置favicon图标
app.use(logger('dev')); // 加载日志中间件
app.use(bodyParser.json()); // 加载解析json的中间件
app.use(bodyParser.urlencoded({ extended: false })); // 加载解析urlencoded请求体的中间件
app.use(cookieParser()); // 加载解析cookie的中间件
app.use(express.static(path.join(__dirname, 'public'))); // 设置public文件夹为存放静态文件的目录

// 将会话信息存储到mongodb中 要在路由前面
app.use(session({
  secret: settings.cookieSecret, // 防止篡改cookie
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days cookie的生存期
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: 'mongodb://localhost/blog'
  })
}));
app.use(flash()); // 添加flash功能 // 这里要在routes前面

// 设置模板全局常量
app.locals.blog = {
  title: 'blog',
  description: 'blog demo'
};

// 路由控制器
routes(app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// 导出app实例供其他模块调用
module.exports = app;
