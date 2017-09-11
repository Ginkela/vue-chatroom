var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/chatroom");

const db = mongoose.connection;

db.once('open' ,() => {
	console.log('Mongo working!');
})

db.on('error', (error) => {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db.on('close', () => {
    console.log('数据库断开，重新连接数据库');
    mongoose.connect("mongodb://localhost/chatroom", {server:{auto_reconnect:true}});
});

module.exports = db;