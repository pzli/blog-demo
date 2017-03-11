var mongodb = require('./db');

function Post(name, title, post) {
	this.name = name;
	this.title = title;
	this.post = post;
}

module.exports = Post;

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

var getPost = function(db) {
	return new Promise(function(resolve, reject) {
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return reject(err);
			}
			resolve(collection);
		});
	});
}

var savePost = function(collection, post) {
	return new Promise(function(resolve, reject) {
		collection.insert(post, {
			safe: true
		}, function(err) {
			mongodb.close();
			if (err) {
				return reject(err);
			}
			resolve(post[0]);
		});
	});
};

var findOne = function(collection, name) {
	return new Promise(function(resolve, reject) {
		var query = {};
		if (name) {
			query.name = name;
		}
		collection.find(query).sort({
			time: -1
		}).toArray(function(err, post) {
			mongodb.close();
			if (err) {
				return reject(err); //失败！返回 err
			}
			resolve(post); //成功！以数组形式返回查询的结果
		})
	});
};

Post.prototype.save = function(callback) {
	var date = new Date();
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	var post = {
		name: this.name,
		title: this.title,
		time: time,
		post: this.post
	};

	openDB()
		.then(function(db) {
			return getPost(db);
		})
		.then(function(collection) {
			return savePost(collection, post);
		})
		.then(function(post) {
			callback(null, post);
		})
		.catch(function(err) {
			console.log(err);
		});
	// mongodb.open(function(err, db) {
	// 	if (err) {
	// 		return callback(err);
	// 	}
	// 	db.collection('posts', function(err, collection) {
	// 		if (err) {
	// 			db.close();
	// 			return callback(err);
	// 		}
	// 		collection.insert(post, {
	// 			safe: true
	// 		}, function(err) {
	// 			db.close();
	// 			if (err) {
	// 				return callback(err);
	// 			}
	// 			callback(null, post[0]);
	// 		})
	// 	})
	// })
}

Post.get = function(name, callback) {
	openDB()
		.then((db) => {
			return getPost(db);
		})
		.then((collection) => {
			return findOne(collection, name);
		})
		.then((post) => {
			callback(null, post);
		})
		.catch((err) => {
			console.log(err);
		});
	// mongodb.open(function(err, db) {
	// 	if (err) {
	// 		return callback(err);
	// 	}
	// 	db.collection('posts', function(err, collection) {
	// 		if (err) {
	// 			db.close();
	// 			return callback(err);
	// 		}
	// 		var query = {};
	// 		if (name) {
	// 			query.name = name;
	// 		}
	// 		collection.find(query).sort({
	// 			time: -1
	// 		}).toArray(function(err, post) {
	// 			mongodb.close();
	// 			if (err) {
	// 				return callback(err); //失败！返回 err
	// 			}
	// 			callback(null, post); //成功！以数组形式返回查询的结果
	// 		})
	// 	})
	// })
}