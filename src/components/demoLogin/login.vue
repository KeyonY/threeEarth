<template>
  <div class="login">
    <div class="canvasContainer">
      <div id="canvasContainer"></div>
    </div>
  </div>
</template>

<script>
  import login from "./js/login";
  export default {
    name: "login",
    mixins: [login],
    data () {
      return {
        account: '',
        psw: ''
      }
    },
    created() {
    },
    methods: {
      submit () {
        this.$message.info('submit');
      }
    }
  }
</script>

<style scoped lang="scss">
.login{position: relative; width: 100%; height: 100%; overflow: hidden; background-color: #050708;}
.canvasContainer{position: relative; width: 100%; height: 100%;}
#canvasContainer{position: absolute; right: 0; top: 0; width: 118%; height: 100%;}
</style>