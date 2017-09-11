import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import login from '@/components/Login'
import chat from '@/components/Chat'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: login
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/chat',
      name: 'chat',
      component: chat
    }
  ]
})
