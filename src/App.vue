<template>
  <div class="bg-img" />
  <LeftNav />
  <User />
</template>

<script>
import LeftNav from "./components/LeftNav";
import User from "./views/User";
import { mixProvide } from "./utils/store";
// import request from "./utils/request";

export default {
  name: 'App',
  components: {
    LeftNav,
    User,
  },
  setup() {
    mixProvide(['user', 'downloadInfo']);
  }
}
</script>

<style lang="scss">
  @import "assets/style/common";
  @import "assets/style/icon/iconfont.css";
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #fffc;
    margin-top: 60px;

    .bg-img {
      background: url("./assets/img/bg-1.png") no-repeat;
      background-position: center center;
      background-size: cover;
      position: fixed;
      top: 0;
      left: 0;
      z-index: -100;
      width: 100vw;
      height: 100vh;
    }
  }
</style>
