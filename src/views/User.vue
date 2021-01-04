<template>
  <div class="text-center" @click="updateDownloadInfo">点击狗狗狗狗{{downloadInfo.count}}</div>
</template>

<script>
  import {mixInject} from "../utils/store";

  export default {
    name: "User",
    setup() {
      return {
        ...mixInject(['user', 'downloadInfo'])
      }
    },
    methods: {
      updateDownloadInfo() {
        this.downloadInfo.count += 1;
      }
    }
  }
</script>

<style scoped>

</style>