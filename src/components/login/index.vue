<template>
<div id="login">
  <a-layout>
    <a-layout-header></a-layout-header>
    <a-layout-content>
      <a-button type="primary" icon="swap-right" @click="goGL">GO GL →</a-button>
    </a-layout-content>
    <a-layout-footer></a-layout-footer>
  </a-layout>
</div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {};
  },
  methods: {
    // 跳转GL页
    goGL () {
      this.$router.push({});
    }
  }
};
</script>
<style lang="scss" scoped>
</style>