<template>
  <div class="page-title">
    <div class="main-title">{{title}}</div>
    <div :class="`main-title-2 color-${setting.platform}`">{{title}}</div>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";

  export default {
    name: "PageTitle",
    props: {
      title: String,
    },
    setup() {
      return mixInject('setting')
    }
  }
</script>

<style scoped lang="scss">
  .page-title {
    position: absolute;
    top: 5px;
    left: 10px;
    pointer-events: none;
    white-space: nowrap;

    .main-title, .main-title-2 {
      position: absolute;
      top: 0;
      left: 0;
      font-weight: bold;
      font-size: 70px;
      color: #fff5;
      z-index: 0;
      text-shadow: #fff3 0 0 5px;
      opacity: 0.2;
    }
    .main-title-2 {
      transform: translate(6px, 6px);
      z-index: 1;
      opacity: 0.1;
      transition: 0.3s;
    }
  }
</style>