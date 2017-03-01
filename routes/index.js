var crypto = require('crypto'), // crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码。
	User = require('../models/user.js'),
	Post = require('../models/post.js');


module.exports = function(app) {
	// 主页
	app.get('/', function(req, res) {
		Post.get(null, function(err, posts) {
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: '主页',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	// 注册
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		//检验用户两次输入的密码是否一致
		if (password_re != password) {
			req.flash('error', '两次输入的密码不一致!');
			return res.redirect('/reg'); //返回注册页
		}
		//生成密码的 md5 值
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name: name,
			password: password,
			email: req.body.email
		});
		//console.log(123);
		//检查用户名是否已经存在 
		User.get(newUser.name, function(err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			if (user) {
				req.flash('error', '用户已存在!');
				return res.redirect('/reg'); //返回注册页
			}
			//console.log(123);
			//如果不存在则新增用户
			newUser.save(function(err, user) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/reg'); //注册失败返回主册页
				}
				//console.log(user);
				req.session.user = user; //用户信息存入 session
				req.flash('success', '注册成功!');
				res.redirect('/'); //注册成功后返回主页
			});
		});
	});


	// 登录
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		var md5 = crypto.createHash('md5'),
			name = req.body.name,
			password = md5.update(req.body.password).digest('hex');
		User.get(name, function(err, user) {
			if (!user) {
				req.flash('error', '用户名不存在！');
				return res.redirect('/login');
			}
			if (user.password != password) {
				req.flash('error', '密码错误！');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', '登录成功！');
			res.redirect('/');
		})
	});


	// 发布
	app.get('/post', checkLogin);
	app.get('/post', function(req, res) {
		res.render('post', {
			title: '发布',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post', checkLogin);
	app.post('/post', function(req, res) {
		var currentUser = req.session.user,
			post = new Post(currentUser.name, req.body.title, req.body.post);
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发表成功！');
			res.redirect('/');
		})
	});

	// 退出
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) { // 点击退出按钮不会有页面
		req.session.user = null;
		// 通过把 req.session.user 赋值 null 丢掉 session 中用户的信息，实现用户的退出。
		req.flash('success', '退出成功');
		res.redirect('/');
	});

	function checkLogin(req, res, next) { // 检测到未登录则跳到登录界面
		if (!req.session.user) {
			req.flash('error', '请登录！');
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) { // 检测到已登录则跳到上一个页面
		if (req.session.user) {
			req.flash('error', '您已经登录！');
			res.redirect('back');
		}
		next();
	}
};