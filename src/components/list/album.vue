<template>
  <div :class="`list-albums ${className || ''}`">
    <div
      v-for="a in albums"
      :key="a.id"
      class="album-item"
    >
      <div class="album-img-container pointer" @click="goTo(a)">
        <img :src="`${a.picUrl}?param=200y200`" v-error="`https://y.gtimg.cn/mediastyle/global/img/album_300.png`" />
      </div>
      <div class="album-name pointer" @click="goTo(a)">{{a.name}}</div>
    </div>
    <div v-if="(albums || []).length === 0" class="text-center mt_40">{{emptyText || '没啥专辑哟'}}</div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../../utils/stringHelper";

  export default {
    name: "album",
    props: {
      albums: Array,
      className: String,
      emptyText: String,
    },
    setup() {
      return {
        goTo({ id, mid, platform }) {
          changeUrlQuery({
            id, mid, platform
          }, '#/album')
        },
      }
    }
  }
</script>

<style lang="scss">
  .list-albums {
    color: #fff9;

    .album-item {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      text-align: center;
      width: 200px;
      margin: 20px 0;
      transition: 0.3s;
      opacity: 0.7;
      box-shadow: 0 0 0 transparent;

      &:hover {
        opacity: 0.9;

        .album-img-container {
          border-radius: 5px;
          box-shadow: 0 0 30px #333333;

          img {
            width: 170px;
            height: 170px;
            top: -10px;
            left: -10px;
          }

          .album-name {
            background: #000a;
            color: #fff;
          }
        }
      }

      .album-img-container {
        display: inline-block;
        width: 150px;
        height: 150px;
        position: relative;
        overflow: hidden;
        border-radius: 10px;
        transition: 0.4s;

        img {
          width: 150px;
          height: 150px;
          left: 0;
          top: 0;
          position: absolute;
          transition: 0.3s linear;
        }
      }
      .album-name {
        position: absolute;
        right: 5px;
        top: 6px;
        max-width: 120px;
        min-width: 80px;
        padding: 5px;
        background: #0009;
        border-radius: 5px;
        font-size: 14px;
        overflow: hidden;
        box-sizing: border-box;
        text-align: center;
        color: #fffc;
        display: -webkit-box;
        overflow: hidden;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        transition: 0.3s;
      }
    }
  }
</style>