import moment from 'moment';
import {vueApp as Vue} from '@/main';
const common = {
  // 计算除去标题和底部tab栏等的高度，赋予loadmore组件固定高度
  /* params
  * el - 要赋予高度的dom
  * ...vaule - 所有要减去dom的高度
  * eg: this.$common.setLoadmoreHeight(document.getElementsByClassName('demo-loadmore-wrap')[0], document.getElementsByClassName('mu-bottom-nav')[0].clientHeight);
  */
  setLoadmoreHeight (el, ...values) {
    let winH = document.body.clientHeight;
    let result = winH;
    for (let i = 0, len = values.length; i < len; i++) {
      result = result - values[i];
    }
    el.style.height = result + 'px';
  },
  // 格式化时间
  filterTime (val, arg = 'YYYY-MM-DD HH:mm:ss') {
    if (!val) return '';
    val = new Date(val).getTime();
    // eslint-disable-next-line no-undef
    return moment(val).format(arg);
  },
  // 转换时间日期今天、昨天、xx-xx
  /*
  * 时间戳/日期时间格式字符串 => hh:mm、昨天 hh:mm、MM-dd hh:mm
  */
  getdatestr (btime) {
    btime = new Date(btime);
    var _byd = getdate(-2); // 前天0点
    var _yd = getdate(-1); // 昨天0点
    var _td = getdate(0); // 今天0点
    var _tomd = getdate(1); // 明天0点
    var strHM = btime.getHours() + ':' + btime.getMinutes();
    if (btime < _byd) {
      // 前天之前，返回月，日
      return btime.getMonth() + 1 + '-' + btime.getDate();
    } else if (btime >= _byd && btime < _yd) {
      // 前天
      return '前天 ' + strHM;
    } else if (btime >= _yd && btime < _td) {
      // 昨天
      return '昨天 ' + strHM;
    } else if (btime >= _td && btime < _tomd) {
      // 今天
      return strHM;
    } else {
      return btime.getMonth() + 1 + '-' + btime.getDate() + ' ' + strHM;
    }
  },
  // 转换时间  （xx:xx， 几天前， 几分钟前）
  /*
  * 时间戳/日期时间格式字符串 => xx:xx， 几天前， 几分钟前
  */
  getDateDiff (dateStr) {
    if (!dateStr) return;
    var publishTime = this.getDateTimeStamp(dateStr) / 1000;
    var dSeconds;
    var dMinutes;
    var dHours;
    var dDays;
    var timeNow = parseInt(new Date().getTime() / 1000);
    var d;

    var date = new Date(publishTime * 1000);
    var Y = date.getFullYear();
    var M = date.getMonth() + 1;
    var D = date.getDate();
    var H = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    // 小于10的在前面补0
    if (M < 10) {
      M = '0' + M;
    }
    if (D < 10) {
      D = '0' + D;
    }
    if (H < 10) {
      H = '0' + H;
    }
    if (m < 10) {
      m = '0' + m;
    }
    if (s < 10) {
      s = '0' + s;
    }

    d = timeNow - publishTime;
    dDays = parseInt(d / 86400);
    dHours = parseInt(d / 3600);
    dMinutes = parseInt(d / 60);
    dSeconds = parseInt(d);

    if (dDays > 0 && dDays < 3) {
      return dDays + '天前';
    } else if (dDays <= 0 && dHours > 0) {
      return dHours + '小时前';
    } else if (dHours <= 0 && dMinutes > 0) {
      return dMinutes + '分钟前';
    } else if (dSeconds < 60) {
      if (dSeconds <= 0) {
        return '刚刚';
      } else {
        return dSeconds + '秒前';
      }
    } else if (dDays >= 3 && dDays < 30) {
      // return M + '-' + D + ' ' + H + ':' + m;
      return M + '-' + D;
    } else if (dDays >= 30) {
      // return Y + '-' + M + '-' + D + ' ' + H + ':' + m;
      return Y + '-' + M + '-' + D;
    }
  },
  getDateTimeStamp (dateStr) {
    return Date.parse(dateStr.replace(/-/gi, '/'));
  },
  // 转换本地图片文件为base64格式
  /* 使用callback来取得base64的内容
  * cb的参数即转换后的base64内容
  * 使用参考：
    this.$common.picToBase64(file, (res) => {
      let result = res;
    });
  */
  picToBase64 (file, cb) {
    const reader = new FileReader();
    // 将文件以Data URL形式读入页面
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      // var ImgFileSize = reader.result.substring(reader.result.indexOf(",") + 1).length;//截取base64码部分（可选可不选，需要与后台沟通）
      cb(reader.result);
    };
  },
  // 获取当前地址栏的参数
  getQueryString (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  },
  // 分钟转换  时/分
  ChangeHourMinutestr (str) {
    if (str !== '0' && str !== '' && str !== null) {
      return ((Math.floor(str / 60)).toString().length < 2 ? '0' + (Math.floor(str / 60)).toString() : (Math.floor(str / 60)).toString()) + ':' + ((str % 60).toString().length < 2 ? '0' + (str % 60).toString() : (str % 60).toString());
    } else {
      return '';
    }
  },
  // 分钟转换
  changeStrToMinutes (str) {
    var arrminutes = str.split(':');
    if (arrminutes.length === 2) {
      var minutes = parseInt(arrminutes[0]) * 60 + parseInt(arrminutes[1]);
      return minutes;
    } else {
      return 0;
    }
  },

  ifCloseLoading: false,
  // 关闭初始化时loading动画
  closeLoadingInit () {
    let dom = document.getElementById('loadContainer');
    let child = document.getElementsByClassName('loadingBox')[0];
    if (!this.ifCloseLoading && child != null) {
      this.ifCloseLoading = true;
      dom.removeChild(child);
      dom.style.display = 'none';
    }
  },
  // 获取时间  转换格式 (YYYY-MM-DD)
  getDateYMD (time) {
    let date = time ? new Date(time) : new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let times = year + '-' + (+month < 10 ? ('0' + month) : month) + '-' + (+day < 10 ? ('0' + day) : day);

    return times;
  },
  // 获取地址栏的参数
  getQueryVariable (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) { return pair[1]; }
    }
    return (false);
  },
  // 时间戳转换剩余时间
  /*
  * params: times - 截止时间的毫秒数
  *         obj - 要赋值的变量对象，至少包含 hour、minute、second属性，包含day则计算天数
  */
  getLastTime: function (times, obj) {
    let timer;
    clearInterval(timer);
    let nowTime = new Date().getTime();
    let lasttime = times - nowTime;
    if (lasttime <= 0) {
      if ('day' in obj) {
        obj.day = '00';
      }
      obj.hour = '00';
      obj.minute = '00';
      obj.second = '00';
      return obj;
    }
    timer = setInterval(() => {
      let dayStr = Math.floor(lasttime / 24 / 60 / 60 / 1000);
      let hourStr = Math.floor((lasttime / 60 / 60 / 1000) % 24);
      let minuteStr = Math.floor((lasttime / 60 / 1000) % 60);
      let secondStr = Math.floor((lasttime / 1000) % 60);
      if ('day' in obj) {
        obj.day = dayStr > 9 ? dayStr : ('0' + dayStr);
        obj.hour = hourStr > 9 ? hourStr : ('0' + hourStr);
      } else {
        obj.hour = (dayStr * 24 + hourStr) > 9 ? (dayStr * 24 + hourStr) : ('0' + hourStr);
      }
      obj.minute = minuteStr > 9 ? minuteStr : ('0' + minuteStr);
      obj.second = secondStr > 9 ? secondStr : ('0' + secondStr);
      lasttime -= 1000;
    }, 1000);
  },
  /** 2020/5/21
  * 作者: Keyon
  * 功能: commonDetail页面的跳转方法封装
  * @param id {String} id
  * @param from {String} 内容来源的routename, 默认为跳转前的当前routename
  * @param type {String} 内容来源的模块, 默认不填
  * @returns {Null} 默认返回null
  */
  goDetail (id, from = Vue.$route.name, type) {
    Vue.$router.push({name: 'commonDetail', query: {id: id, from: from, type: type}});
  },
  /** 2020/5/21
  * 作者: Keyon
  * 功能: noticeList页面的跳转方法封装
  * @returns {Null} 默认返回null
  */
  goNoticeList () {
    Vue.$router.push({name: 'noticeList', query: {from: Vue.$route.name}});
  },
  /** 2020/5/28
  * 作者: Keyon
  * 功能: 删除树形结构的末端children属性
  * @param arr {Array} 树形结构数据
  * @returns {Array} 默认返回处理过的树形结构数据
  */
  treeDelChildren (arr) {
    let result = [];
    // 递归查找最末端
    let fn = (json) => {
      // 1.第一层 root 深度遍历整个JSON
      for (let i = 0; i < json.length; i++) {
        let o = json[i];
        // 没有就下一个
        if (!o || !o.children) {
          continue;
        }
        if (o.children.length === 0) {
          delete o.children;
          continue;
        } else {
          if (o.children) {
            // 递归往下找
            fn(o.children);
          } else {
            // 跳出当前递归，返回上层递归
            continue;
          }
        }
      }
      result = json;
      return result;
    };
    fn(arr);
    return result;
  },
  /** 2020/6/4
  * 作者: Keyon
  * 功能: 解码字符串
  * @param str {String}
  * @returns {Null} 默认返回null
  */
  decodeStr (str) {
    return decodeURIComponent(str);
  },
  /** 2020/9/2
  * 作者: Keyon
  * 功能: 验证手机号
  * 描述:
  * @param option {Array}
  * @returns {Null} 默认返回null
  */
  mobileVerify (phone) {
    return /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/.test(phone);
  },
  // 智慧迎新2.0项目，截取组织字符串中的学院
  splitOrgName (str) {
    let result = '';
    if (str) {
      result = str.split('>')[0];
      return result;
    }
  },
  /** 2020/9/3
  * 作者: Keyon
  * 功能: 节流函数
  * 描述:
  * @param func {Function} 执行的方法
  * @param delay {Number} 时间间隔
  * @returns {Function}
  */
  throttle (func, delay) {
    let context = this;
    let args = arguments;
    let now = Date.now();
    if (now - common.throttlePrev >= delay) {
      func.apply(context, args);
      common.throttlePrev = Date.now();
    }
  },
  throttlePrev: Date.now(),
  /** 2020/9/6
  * 作者: Keyon
  * 功能: 计算百分比
  * 描述:
  * @param a {Number} 分子
  * @param b {Number} 分母
  * @param d {Number} 小数位数，默认不保留小数
  * @returns {Null} 默认返回null
  */
  cpuPercent (a, b, d = 0) {
    let result = '';
    if (a !== 0) {
      let dnum = '100';
      for (let i = 0; i < d; i++) {
        dnum += '0';
      }
      dnum = Number(dnum);
      result = Math.ceil(a / b * dnum) / (dnum / 100) + '%';
    } else {
      result = 0;
    }
    return result;
  }
};

function getdate (AddDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount); // 获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1; // 获取当前月份的日期
  var d = dd.getDate();
  return new Date(y + '-' + m + '-' + d);
}
export default common;
