<template>
  <div :class="`list-singers ${className || ''}`">
    <div
      v-for="s in singers"
      :key="`${s.id}-${s.mid}`"
      class="singer-item"
      @click="goTo(s)"
    >
      <img
        v-error="`https://y.gtimg.cn/mediastyle/global/img/singer_300.png`"
        class="singer-img"
        :src="`${s.picUrl}?param=120y120`"
      >
      <div class="singer-name">
        {{ s.name }}
      </div>
    </div>
    <div
      v-if="(singers || []).length === 0"
      class="text-center mt_40"
    >
      {{ emptyText || '没啥歌手哟' }}
    </div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../../utils/stringHelper";

  export default {
    name: "Singer",
    props: {
      singers: Array,
      emptyText: String,
      className: String,
    },
    setup() {
      return {
        goTo({id, mid, platform}) {
          changeUrlQuery({id, mid, platform}, '#/singer');
        }
      }
    }
  }
</script>

<style lang="scss">
  .list-singers {
    color: #fff9;

    .singer-item {
      position: relative;
      width: 150px;
      box-sizing: border-box;
      display: inline-block;
      vertical-align: top;
      margin-bottom: 20px;
      text-align: center;
      cursor: pointer;
      transition: 0.3s;
      opacity: 0.7;

      &:hover {
        opacity: 1;

        .singer-img {
          border-radius: 20px;
          transform: scale(1.05);
        }
      }

      .singer-img {
        width: 60%;
        border-radius: 50%;
        margin-top: 20px;
        transition: 0.3s;
        transform: scale(1);
      }

      .singer-name {
        color: #fff8;
      }
    }
  }
</style>