import Vue from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/antd.css';
import store from './store/store';
import * as baseUrl from './http/baseUrl';
import router from './router';
import '@/http/http.js';
import common from '@/common/js/common.js';

Vue.config.productionTip = false;

Vue.use(Antd);

Vue.prototype.$common = common;
Vue.prototype.$baseUrl = baseUrl;

let vueApp;
InitApp();
/* eslint-disable no-new */
function InitApp () {
  vueApp = new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  });
}
export {vueApp};