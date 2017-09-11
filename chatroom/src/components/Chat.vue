<template>
<div>
    <div class="header">
        <h1>ChatRoom <small>网页版聊天室</small></h1>
    </div>
    <div class="content">
    <div class="chatBox">
        <div class="leftContent">
          <div class="information">
            <img src="" alt="">
            <p>昵称：{{user_info.name}}</p>
            <div class="btn-area">
               <div @click="chatWithRobot">{{AI.text}}</div>
               <div>注销</div>
            </div>
            <!--<p>地址：陕西西安</p>-->
          </div>
          <div class="online" v-if="!AI.status">
            <h2>在线网友[{{online_users.length}}人]</h2>
            <ul>
              <li v-for="item in online_users">
                <img src="" alt=""><span>{{item.name}}</span><span class="address">[陕西西安]</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="rightContent">
          <div class="message">
            <ul>
              <li v-for="item in chat_content" :class="item.classname">
                <img src="" alt="">
                <div class="msgContent">
                  <span v-if="item.classname === 'otherPeople'">{{item.name}} {{item.time}}</span>
                  <p>{{item.content}}</p>
                </div>
              </li>
              <!--<li class="time"><span>2017-08-14</span></li>-->
                                
            </ul>
          </div>
          <div class="inputMsg">
            <textarea v-model="send_content" @keyup.enter="sendMsg"></textarea>
            <input type="submit" value="发送" @click="sendMsg">
          </div>
        </div>
    </div>
    </div>
</div>
</template>

<script>
    export default{
        data() {
            return {
                user_info: {},
                chat_info: [],
                robot_chat_info: [],
                online_users: [],
                send_content: "",
                AI: {
                    text: "online",
                    status: false
                },
                chat_content: []
            }
        },
        methods: {
            sendMsg: function() {
                var content = this.send_content;
                this.send_content = "";
                if(this.AI.status) {
                    this.robot_chat_info.push({
                        time: this.getTime,
                        content: content,
                        classname: "mine"
                    });
                    this.setScrollTop;
                    this.$http.get('http://jisuznwd.market.alicloudapi.com/iqa/query?question='+encodeURIComponent(content),{
                      headers:{
                          'Authorization': 'APPCODE ee87f98d712a42128421c78d72e985a0',
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      data:{}
                    }).then( res => {
                      console.log(res.data)
                      this.robot_chat_info.push({
                        name: "智能机器人",
                        time: this.getTime,
                        content: res.data.result.content,
                        classname: "otherPeople"
                      });
                      this.chat_content = this.robot_chat_info;
                      this.setScrollTop;
                    });
                }else{
                    var data = {
                        user_id : this.user_info.user_id,
                        content : content
                    }
                    socket.emit("chat", data);
                }
            },
            chatWithRobot: function() {
                if(!this.AI.status) {
                    this.AI.text = "AI";
                    this.AI.status = true;
                    this.chat_content = this.robot_chat_info;
                }else{
                    this.AI.text = "online";
                    this.AI.status = false;
                    this.chat_content = this.chat_info;
                }
            }
        },
        computed: {
            getTime: function() {
                var now = new Date(),
                    year = now.getFullYear(),
                    month = now.getMonth()+1,
                    day = now.getDate(),
                    hours = now.getHours(),
                    minutes = now.getMinutes(),
                    seconds = now.getSeconds();
                return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            },
            setScrollTop: function() {
                setTimeout(function() {
                    var _message = document.getElementsByClassName("message")[0];
                    var length = _message.getElementsByTagName("ul")[0].offsetHeight-_message.offsetHeight;
                    _message.scrollTop = length +40;
                }, 0);
            }
        },
        mounted() {
            this.$http.get('http://localhost:3000/chatInfo',{withCredentials: true, user_id: localStorage.getItem('user_id')}).then(res => {
                if (res.data.ret){
                    this.user_info = res.data.data.user_info;
                    var chat_info = res.data.data.chat_info;
                    var user_id = this.user_info.user_id;
                    chat_info.map((item) => {
                       if(item.user_id === user_id) {
                           item.classname = "mine";
                       }else {
                           item.classname = "otherPeople";
                       }
                    });
                    this.chat_info = chat_info.reverse();
                    this.chat_content = this.chat_info;
                    socket.on("chat", data => {
                        if(data.user_id === user_id){
                            data.classname = "mine";
                        }else{
                            data.classname = "otherPeople";
                        }
                        this.chat_info.push(data);
                        this.chat_content = this.chat_info;
                        this.setScrollTop;
                    });
                    socket.emit("login",this.user_info);
                    socket.on("login", data => {
                        this.online_users = data.users;
                    });
                    socket.on("logout", data => {
                        
                    });
                }else {
                  if(res.data.reason === -1) {
                      console.log("用户id不存在");
                      this.$router.push("/login");
                  }else {
                      alert("获取信息失败");
                  }
                }
            });
            
        }
    }
</script>

<style lang="less" scoped>
@content-width:800px;
@head-color:rgb(40,40,40);
@main-color:rgb(245,245,245);
@triangle:5px;
*{
  margin: 0;
  padding: 0;
  font-family: 'Microsoft Yahei';
}
li{
  list-style: none;
}
.header{
  height:70px;
  background-color: @head-color;
  color: #ddd;
  border-bottom: 1px #b3b3b3 solid;
   h1{
    font-size: 32px;
    width: @content-width;
    line-height: 70px;
    margin: 0 auto;
    height: 70px;
    small{
      font-size: 12px;
      color: #ddd;
    }
  }
} 
.content{
  background: rgb(230,230,230);
  height: 739px;
  position: relative;
}
.chatBox{
  width: @content-width;
  height: 600px;
  background-color: @main-color;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 1px solid #c3c3c3;
  border-radius: 4px;
  box-shadow: 6px 6px 4px #d3d3d3;
}
.leftContent{
  width: 30%;
  background-color: rgb(225,225,225);
  height: 100%;
  float: left;
  font-size: 14px;
  line-height: 20px;
  .information{
    padding-bottom: 10px;
    border-bottom: 1px solid #c3c3c3;
     img{
      box-sizing: border-box;
      border: 1px solid #a3a3a3;
      border-radius: 50%;
      width: 60%;
      margin: 10% 20% 5% 20%;
    }
    p{
      padding: 0 20%;
    }
    .btn-area{
      text-align: center;
      margin-top: 5px;
      div{
        display: inline-block;
        margin: 0 20px;
        width: 55px;
        background: #7d7d7d;
        border-radius: 4px;
        color: white;
        cursor: pointer;
      }
    }
  }
  .online{
    padding: 0 14%;
    h2{
      font-weight: normal;
      font-size: 14px;
      line-height: 30px;
    }
    img{
      height:20px;
      vertical-align: text-bottom;
      margin-right: 4px;
      border-radius: 50%;
    }
    span{
      line-height: 24px;
    }
    .address{
      float: right;
    }
  }
}
.rightContent{
  float: right;
  width: 70%;
  height: 100%;
  .message{
    height: 75%;
    border-bottom: 1px solid #e3e3e3;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
    ul{
      padding: 0 18px;
      .otherPeople{
        line-height: 20px;
        margin: 20px 0;
        img{
          height: 40px;
          border-radius: 50%;
          vertical-align: top;
        }
        .msgContent{
          display: inline-block;
          margin-left: 5px;
          span{
            font-size: 12px;
            color: gray;
            display: block;
            line-height: 18px;
            position: relative;
            top: -2px;
          }
          p{
            display: inline-block;
            max-width: 300px;
            font-size: 14px;
            background-color: rgb(220,230,220);
            padding: 10px 6px;
            border-radius: 4px;
            position: relative;
          }
          p:before{
            content: '';
            position: absolute;
            left: -@triangle;
            border-right: @triangle solid rgb(220,230,220);
            border-top: @triangle solid transparent;
            border-bottom: @triangle solid transparent;
          }          
        }
      }
      .mine{
        line-height: 20px;
        margin: 20px 0;
        overflow: hidden;
        img{
          height: 40px;
          border-radius: 50%;
          vertical-align: top;
          float: right;
        }
        .msgContent{
          float: right;
          display: inline-block;
          margin-right: 8px;
          p{
            display: inline-block;
            max-width: 300px;
            font-size: 14px;
            background-color: rgb(220,230,220);
            padding: 10px 6px;
            border-radius: 4px;
            position: relative;
          }
          p:after{
            content: '';
            position: absolute;
            right: -@triangle;
            top: 14px;
            border-left: @triangle solid rgb(220,230,220);
            border-top: @triangle solid transparent;
            border-bottom: @triangle solid transparent;
          }          
        }
      }
      .time{
        font-size: 12px;
        text-align: center;
        span{
          background-color: #bbb;
          padding: 2px 8px;
          border-radius: 4px;
          color: white;
        }
      }
    }
  }
  .inputMsg{
    padding: 16px 24px;
    height: 25%;
    box-sizing: border-box;
    textarea{
      width: 100%;
      height: 75%;
      border:none;
      resize: none;
      background-color: transparent;
      outline: none;
    }
    input{
        float: right;
        background-color: transparent;
        outline: none;
        border-style: none;
        border: 1px solid rgb(150,150,150);
        color: rgb(150,150,150);
        padding: 2px 6px;
        cursor: pointer;
        overflow-y: auto;
    }
    input:hover{
      background-color: rgb(220,230,220);
    }
  }
}
::-webkit-scrollbar{width:7px;height:7px}
::-webkit-scrollbar-button{display:none}
::-webkit-scrollbar-track{display:none}
::-webkit-scrollbar-track-piece{background:#f1f1f1}
::-webkit-scrollbar-thumb{background:#bbb;border-radius:4px}
::-webkit-scrollbar-corner{background:#f1f1f1}
::-webkit-resizer{background:#fff}
</style>