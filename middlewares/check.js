module.exports = {
	checkLogin: function checkLogin(req, res, next) { // 检测到未登录则跳到登录界面
		if (!req.session.user) {
			req.flash('error', '请登录！');
			res.redirect('/login');
		}
		next();
	},

	checkNotLogin: function checkNotLogin(req, res, next) { // 检测到已登录则跳到上一个页面
		if (req.session.user) {
			req.flash('error', '您已经登录！');
			res.redirect('back');
		}
		next();
	}	
}