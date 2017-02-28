var mongodb = require('./db');

// User类
function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

// 保存单个user信息进数据库
User.prototype.save = function(callback) {
	// 单个user信息
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	// 打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取collection
		db.collection('users', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //err, 返回err
			}
			// 将user插入到collection
			collection.insert(user, {
				safe: true
			}, function(err, user) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, user[0]); // success, 返回插入的user信息
			})
		})
	});
};

// 获取单个user信息
User.get = function(name, callback) {
	
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			// 通过name找到单个文档document
			collection.findOne({
				name: name
			}, function(err, user) {
				mongodb.close();
				if (err) {
					return callback(err); 
				}
				callback(null, user); // success, 返回user
			});
		});
	});
};