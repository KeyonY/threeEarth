import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    systemReady: false, // 系统加载完毕，接口通畅，准备就绪
    crumbArr: [], // 面包屑导航栏的数据
    iframeUrl: '', // iframe的url
    permissionList: [],
    curMenu: {},
    foldMenu: localStorage.getItem('foldMenu') === 'false', // 折叠菜单栏
    userSocketStatus: 'offline', // 用户socket链接状态 online-已连接 offline-未连接
    editorContent: '' // 用于保存编辑器的内容，实现跨组件传递值
  },
  mutations: {
    setSystemReady (state, bool) {
      state.systemReady = bool;
    },
    setPermissionList (state, arr) {
      state.permissionList = arr;
    },
    setUserSocketStatus (state, b) {
      if (b) {
        state.userSocketStatus = 'online';
      } else {
        state.userSocketStatus = 'offline';
      }
    },
    // 设置折叠菜单
    setFoldMenu (state, b) {
      state.foldMenu = b;
      localStorage.setItem('foldMenu', b);
    },
    // 保存当前菜单栏选项
    pushCurMenu (state, obj) {
      state.curMenu = obj;
    },
    // 更新编辑器的内容
    setEditorContent (state, str) {
      state.editorContent = str;
    }
  },
  getters: {
  },
  actions: {
  }
});
export default store;
