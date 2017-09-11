<template>
<div>
    <div class="setName">
    <h1>ChatRoom <small>群聊网页版</small></h1>
    <p>加入聊天只需一步</p>
    <input type="text" v-model="name">
    <a @click="enter">加入聊天</a>
    </div>
    <div class="loginIng" v-if="loading"><span>加载中。。。</span></div>
</div>
</template>

<script>
    export default{
        data() {
            return {
                name: "",
                loading: false
            }
        },
        methods: {
            enter: function() {
                this.loading = true;
                this.$http.get('http://localhost:3000/login', {params: { name: this.name},withCredentials: true})
                    .then(res => {
                        if(res.data.ret) {
                            localStorage.setItem("user_id", res.data.user_info.user_id);
                            this.$router.push("/chat");
                        }
                    });
            }
        },
        created() {
            this.$http.get('http://localhost:3000/checkStatus',{withCredentials: true})
                .then(res => {
                    if (res.data.ret){
                        this.$router.push("/chat");
                    }
                });
        }
    }
</script>

<style scoped>
    body{
      width: 100%;
      height: 100%;
      font-family: Michroma,'Segoe UI Light','Segoe UI','Segoe UI WP','Microsoft Jhenghei','Microsoft Yahei',sans-serif,Times;
    }
    small{
      font-size: 14px;
      font-weight: normal;
      color: gray;
    }
    h1{
      font-size: 32px;
    }
    p{
      font-size: 14px;
      margin-bottom: 42px;
    }
    input{
      outline: none;
      height: 26px;
      border-radius: 2px;
      border: 1px solid #bbb;
      font-size: 16px;
    }
    a{
      margin-left: 32px;
      text-decoration: none;
      background-color: gray;
      border-radius: 4px;
      padding: 2px 10px;
      color: white;
      cursor: pointer;
      box-shadow: 1px 1px 2px gray;
    }
    a:hover{
      background-color: #3f3f3f;
    }
    .setName{
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin:auto;
      width: 400px;
      height: 200px;
      background-color: #eeeeee;
      padding: 20px;
      border-radius: 10px;
    }
    .loginIng{
      width: 100%;
      height: 100%;
      position: absolute;
      background-color: rgba(250,250,250,0.8);
      overflow: hidden;
    }
    .loginIng span{
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin:auto;
      width: 100px;
      height: 30px;
    }
</style>