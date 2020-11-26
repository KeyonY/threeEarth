const libApp = {
  scene: null,
  scene2: null,
  camera: null,
  camera2: null,
  renderer: null,
  controls: null,
  controls2: null,
  controlsDom: null,
  model: null,
  animation: null,
  baseInfo: {
    author: 'Aaron Kong',
    title: '标准化框架登录页',
  },
  config: {
    color: {}
  },
  copy: { // app的实例备份，用于重置的方法
    scene: null,
    scene2: null,
    camera: null,
    camera2: null,
    renderer: null,
    controls: null,
    controls2: null,
    controlsDom: null,
    model: null,
    animation: null,
  },
  // 重置实例
  reset: function () {
    for (let i in this.copy) {
      this[i] = this.copy[i];
    }
    this.clearAppInterval();
    if (this.animation) {
      cancelAnimationFrame(this.animation);
    }
  },
  interval: [], // 定时器集合
  // 清理interval
  clearAppInterval: function () {
    for (let i = 0; i < this.interval.length; i++) {
      clearInterval(this.interval[i]);
    }
  },
  // 所有事件监听的集合，用于清除事件监听 {dom: <Element>, type: 'click', fn: <Function>}
  listenList: [],
  // 移除所有事件监听
  removeAllListen: function () {
    for (let i = 0; i < this.listenList.length; i++) {
      if (this.listenList[i].dom) {
        this.listenList[i].dom.removeEventListener(this.listenList[i].type, this.listenList[i].fn,false);
      } else {
        window.removeEventListener(this.listenList[i].type, this.listenList[i].fn,false);
      }
    }
  }
};
export default libApp;