var mongodb = require('./db');
// User类
function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

var openDB = function() {
	return new Promise(function(resolve, reject) {
		mongodb.open(function(err, db) {
			if (err) {
				mongodb.close();
				return reject(err);
			}
			resolve(db);
		});
	});
};


var getUser = function(db) {
	return new Promise(function(resolve, reject) {
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return reject(err);
			}
			resolve(collection);
		});
	});
}

var saveUser = function(collection, user) {
	return new Promise(function(resolve, reject) {
		collection.insert(user, {
			safe: true
		}, function(err) {
			mongodb.close();
			if (err) {
				return reject(err);
			}
			resolve(user[0]);
		});
	});
};

var findOne = function(collection, name) {
	return new Promise(function(resolve, reject) {
		// 通过name找到单个文档document
		collection.findOne({
			name: name
		}, function(err, user) {
			mongodb.close();
			if (err) {
				return reject(err);
			}
			resolve(user); // success, 返回user
		});
	});
};

// 保存单个user信息进数据库
User.prototype.save = function(callback) {
	// 单个user信息
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	openDB()
		.then((db) => {
			return getUser(db);
		})
		.then((collection) => {
			return saveUser(collection, user);
		})
		.then((user) => {
			callback(null, user);
		})
		.catch((err) => {
			console.log(err);
		});
	// // 打开数据库
	// mongodb.open(function(err, db) {
	// 	if (err) {
	// 		return callback(err);
	// 	}
	// 	// 读取collection
	// 	db.collection('users', function(err, collection) {
	// 		if (err) {
	// 			mongodb.close();
	// 			return callback(err); //err, 返回err
	// 		}
	// 		// 将user插入到collection
	// 		collection.insert(user, {
	// 			safe: true
	// 		}, function(err, user) {
	// 			mongodb.close();
	// 			if (err) {
	// 				return callback(err);
	// 			}
	// 			callback(null, user[0]); // success, 返回插入的user信息
	// 		})
	// 	})
	// });
};

// 获取单个user信息
User.get = function(name, callback) {
	openDB()
		.then((db) => {
			return getUser(db);
		})
		.then((collection) => {
			return findOne(collection, name);
		})
		.then((user) => {
			callback(null, user);
		})
		.catch((err) => {
			console.log(err);
		});
	// mongodb.open(function(err, db) {
	// 	if (err) {
	// 		return callback(err);
	// 	}
	// 	db.collection('users', function(err, collection) {
	// 		if (err) {
	// 			db.close();
	// 			return callback(err);
	// 		}
	// 		// 通过name找到单个文档document
	// 		collection.findOne({
	// 			name: name
	// 		}, function(err, user) {
	// 			mongodb.close();
	// 			if (err) {
	// 				return callback(err);
	// 			}
	// 			callback(null, user); // success, 返回user
	// 		});
	// 	});
	// });
};