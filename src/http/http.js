import Vue from 'vue';
import axios from 'axios';
// import Qs from 'qs';
import VueAxios from 'vue-axios';
import Router from '../router/index';
import { message } from 'ant-design-vue';
import { baseUrl } from '@/http/baseUrl';

Vue.use(VueAxios, axios);
axios.defaults.baseURL = baseUrl;
axios.defaults.withCredentials = false;
axios.defaults.headers.post['Content-Type'] = 'application/data-patch+data';
axios.defaults.headers['Authorization'] = (localStorage.getItem('token')) || '';
axios.defaults.timeout = 30000;
axios.defaults.transformRequest = function (data, headers) {
  if (headers['Content-Type'] === 'multipart/form-data') {
    return data;
  } else {
    // return Qs.stringify(data);
    return JSON.stringify(data);
  }
};
// 请求响应计数器
let requestNum = 0;
let responseNum = 0;
// 请求拦截器
axios.interceptors.request.use(function (config) {
  requestNum++;
  return config;
}, function (error) {
  console.log('请求出错了！');
  return Promise.reject(error);
});
// 响应拦截器
axios.interceptors.response.use(function (response) {
  responseNum++;
  if (responseNum === requestNum) {
    Vue.nextTick(() => {
    });
  }
  if (response.data.code === 401) { // 401重定向去登录认证
    Router.push({name: 'login'});
  }
  if (response.data.code === 500) {
    message.error({
      message: '服务器出错了！'
    });
  }
  return response;
}, function (error) {
  console.log(error);
  responseNum++;
  if (responseNum === requestNum) {
    Vue.nextTick(() => {
    });
  }
  if (error.message.indexOf('timeout') !== -1) {
    Router.replace({name: 'login'});
    message.error({
      message: '服务器连接超时！'
    });
  }
  if (error.response.status === 401) {
    Router.replace({name: 'login'});
    message.error({
      message: '请登录！'
    });
  }
  if (error.response.status === 500) {
    message.error({
      message: '服务器出错了！'
    });
  }
  return Promise.reject(error);
});
