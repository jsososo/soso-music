<template>
  <div v-if="playNow.al && playNow.ar" class="index-main-container">
    <div class="info-content">
      <div class="pic-container">
        <img v-error :src="playNow.al.picUrl" class="pic-content"/>
      </div>
      <div class="text-info">
        <div>
          <div class="music-name text-content">
            <i class="iconfont icon-song"/>
            <span>{{playNow.name}}</span>
          </div>
        </div>
        <div>
          <div class="music-ar-name text-content">
            <i class="iconfont icon-singer" />
            <span v-for="a in playNow.ar" :key="`index-ar-${a.aId}`">{{a.name}}</span>
          </div>
        </div>
        <div>
          <div class="music-al-name text-content">
            <i class="iconfont icon-album" />
            <span>{{playNow.al.name}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";

  export default {
    name: "IndexInfo",
    setup() {
      return mixInject(['playNow']);
    },
  }
</script>

<style scoped lang="scss">
  .index-main-container {
    position: relative;
  }
</style>