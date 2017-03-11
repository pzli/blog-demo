## 安装
	
	cnpm install
	
## 启动数据库

下载好mongoDB后，闯进blog文件夹当做项目数据库，在bin目录下使用命令：

	./mongod --dbpath ../blog/
	
	
## 启动
我使用了nodemon来实现每次保存重新载入刷新页面，在项目根目录下使用命令：

	nodemon ./bin/www



## 在写这个项目中出现的问题：

大体思路按照[Express入门教程：一个简单的博客](http://www.tuicool.com/articles/jueARjE)，但在过程中出现了一些问题。 

1、在express中，由于版本升级，旧版本中使用session将数据存到mongoDB中的代码为：

	app.use(session({
	  secret: settings.cookieSecret,
	  key: settings.db,//cookie name
	  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
	  store: new MongoStore({
	    db: settings.db,
	    host: settings.host,
	    port: settings.port
	  })
	}));

而新版本中，store的参数MongoStore的示例参数要设置为url参数

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
	
2、	在app.js中，中间件的加载顺序很重要，由于connect-flash中间件是基于 session 的，在路由routes中使用了req.flash()这个方法，所以要按照先session连接数据库，再添加flash功能，最后设置路由，否则，在route中就拿不到session数据。

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
	// 路由控制器
	routes(app);
	
express-session、connect-mongo 和 connect-flash 的区别与联系

	express-session: 会话（session）支持中间件
	connect-mongo: 将 session 存储于 mongodb，需结合 express-session 使用，我们也可以将 session 存储于 redis，如 connect-redis
	connect-flash: 基于 session 实现的用于通知功能的中间件，需结合 express-session 使用
	
3、在生产环境中，由于有时会断开mongoDB，再连接的时候端口会被占用，此时无法重新开启数据库

解决方法为下面两行指令，第一行会显示目前占用数据库端口的进程，第二条第二个参数就是占用端口号：

	ps aux |grep mongod
	kill -9 xxxxx
	
4、在写User和Post的save和get方法时，会有很多回调函数callback出现，可以使用ES6中的promise或者TJ做的co等方式来处理过多的回调，也可以用目前还在ES7的async/await。

5、同样是在写User和Post的save和get方法时，要注意，save方法是原型方法而get不是，因为save是保存当前的对象。

## 更新

最新的版本使用了ES6的Promise方法重写了user和post方法。

由于在ES5中，多次回调会使代码很不流畅，在大型项目中也不利于维护，所以用Promise来重写异步方法。
