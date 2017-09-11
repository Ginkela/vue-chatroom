var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: String,
	user_id: Number,
	head_pic: {type: String, default: 'default.jpg'},
});

userSchema.index({id: 1});

const User = mongoose.model('User', userSchema);

const chatSchema = new Schema({
	chat_id: Number,
	name: String,
	user_id: Number,
	time: String,
	head_pic: String,
	content: String
})

chatSchema.index({id: 1});

const Chat = mongoose.model('Chat', chatSchema)

const lastMsgSchema = new Schema({
	last_user_id: Number,
	last_chat_id: Number,
});

lastMsgSchema.index({id: 1});

const LastMsg = mongoose.model('LastMsg', lastMsgSchema);

LastMsg.findOne((err, data) => {
	if (!data) {
		LastMsg.create({
			last_user_id: 0,
			last_chat_id: 0,
		})
	}
});

module.exports = {
    user : User,
    chat : Chat,
    lastMsg : LastMsg
}