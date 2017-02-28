// 已经建立的数据库
var mongodb = require('./db');

// User类
function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

// 存储用户信息
User.prototype.save = function(callback) {
	// 要存储的用户信息
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	// 打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err); // 如果有错误信息，返回错误信息
		}

		// 读取用户集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			// 如果没有错误，将该user插入到users集合中
			collection.insert('users',{
				safe: true
			}, function(err, user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, user[0]); // 存入成功，err为null，返回存储后的用户文档
			});
		});
	});
};


User.get = function(name, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);				
			}
			collection.findOne({
				name: name
			}, function (err, user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, user); // 获取成功
			});
		});
	});

};












