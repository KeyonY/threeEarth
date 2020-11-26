import gl from './gl-main';
export default {
  data () {
    return {
    }
  },
  created() {
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initGL();
      });
    });
  },
  beforeDestroy () {
    gl.destroy();
  },
  methods: {
    // 初始化
    initGL () {
      gl.init();
    }
  }
}