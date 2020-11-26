import Vue from 'vue';
import Router from 'vue-router';

// 登录
const login = () => import('@/components/login');

// 入口页
const appIndex = () => import('@/components/index.vue');
// 首页
const homeIndex = () => import('@/components/home/index.vue');
// 首页
const demoLogin = () => import('@/components/demoLogin/login.vue');
// 嵌入其他系统的frame
// import frameAdmin from '@/components/frame/admin.vue'; // 后台管理系统

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/demo',
      name: 'demoLogin',
      component: demoLogin
    },
    {
      path: '*',
      redirect: '/demo'
    },
    {
      path: '/app',
      name: 'appIndex',
      component: appIndex,
      children: [
        {
          path: 'home',
          name: 'homeIndex',
          component: homeIndex
        }
      ]
    },
    {
      path: '*',
      name: 'appIndex',
      component: appIndex
    }
  ]
});
