var express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
const db = require("./mongodb/data_base.js");
const connectMongo = require("connect-mongo");
const cookieParser = require("cookie-parser");
const utils = require("./utils.js");
let session = require("express-session");
let schema = require("./mongodb/schema.js");

const MongoStore = connectMongo(session);

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin); //跨域
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
	  	res.send(200);
	} else {
	    next();
	}
});
app.use(cookieParser());

app.use(session({
    name: "sid",
    secret: "sid",
    resave: false,   //每次请求都重新设置cookie过期时间
    saveUninitialized: false,
    cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000
    },
    store: new MongoStore({url: "mongodb://localhost/chatroom"})
}))

let users = [];

io.on("connection", socket => {
    socket.on('chat', data => {
        console.log(data);
        let user_id = data.user_id,
            content = data.content;
        if(user_id) {
            schema.user.findOne({user_id: user_id},(err, data) => {
                const user_info = data;
                console.log(user_info);
                 schema.lastMsg.findOne((err, lastMsg) => {
                     let chat_id = ++lastMsg.last_chat_id,
                         time = utils.getTime(),
                         chatMsg = {
                             chat_id: chat_id,
                             name: user_info.name,
                             user_id: user_id,
                             time: time,
                             head_pic: user_info.head_pic,
                             content: content
                         };
                     lastMsg.save();
                     schema.chat.create(chatMsg, () => {
                         console.log(chatMsg);
                         io.emit("chat", chatMsg)
                     });

                 });
            });
        }
        // if (data.to == 'all') {
        // //向其他所有用户广播该用户发话信息
        // socket.broadcast.emit('chat', data);
        // } else {
        // var clients = io.sockets.clients();
        // //遍历找到该用户
        // }
    });

    socket.on('login', data => {
        if(utils.getUser(data, users) < 0) {
            users.push(data);
        }
        io.sockets.emit('login', {
            users: users,
            user: data
        });
    });
    
    socket.on('logout', data => {
        var index = utils.getUser(data, users);
        if(index > -1) {
            users.splice(index, 1);
            socket.broadcast.emit('logout', {
                users: users,
                user: data
            });
        }else {
            console.log('注销账户信息不存在！');
        }
    });
})

//登陆状态判断
app.get('/checkStatus', (req, res) => {
    if (req) {
        //如果有user_id，返回true，否则返回false
        console.log(req.session);
        if (req.session.user_id) {
            res.send({
                ret: true,
                msg: "已登录"
            })
        } else {
            res.send({
                ret: false,
                msg: "未登录"
            })
        }
    }
});

//登录
app.get("/login", (req, res) => {
    if(req) {
        const name = req.query.name;
        const head_pic = Math.floor(Math.random()*10) + '.jpg';
        //找到最后一个用户的id，将新用户的id设置为+1的值
        schema.lastMsg.findOne((err, lastMsg) => {
            const user_id = ++lastMsg.last_user_id;
            lastMsg.save();
            let data = {
                name: name,
                user_id: user_id,
                head_pic: head_pic
            };
            schema.user.create(data, () => {
                console.log(data);
                //在cookie中保存user_id
                req.session.user_id = user_id;
                res.send({
                    ret: true,
                    msg: '登录成功',
                    user_info: data
                })
            })
        });
    }else {
        console.log('登录失败');
		res.send({
            ret: false,
			msg: '登录失败'
		})
    }
});

app.get("/chatInfo", (req, res) => {
    if(req) {
        const user_id = req.session.user_id;
        const local_user_id = req.query.user_id;
        const limit = 20;   //返回聊天记录最多条数
        let send_data = {};
        let num = 0;   //num等于2时，表示所有异步请求全部完成      
        if(user_id || local_user_id) {
            schema.user.findOne({user_id: user_id},(err, data) => {
                num++;
                send_data.user_info = data;
                if(num === 2) {
                    res.send({
                        ret: true,
                        msg: '数据获取成功',
                        data: send_data
                    })
                }
            });
            schema.chat.find((err, data) => {
                num++;
                send_data.chat_info = data;
                if(num === 2) {
                    res.send({
                        ret: true,
                        msg: '数据获取成功',
                        data: send_data
                    })
                }
            }).sort({id: -1}).skip(Number(0)).limit(Number(limit));
        }else {
            console.log('用户id不存在');
		    res.send({
                ret: false,
                reason: -1,
                msg: '用户id不存在'
            });
        }
    }else {
        console.log('获取信息失败');
		res.send({
            ret: false,
            reason: -2,
			msg: '获取信息失败'
		})
    }
})

app.use(express.static(__dirname));
server.listen(3000);