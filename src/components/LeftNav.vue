<template>
  <div class="page-left-nav">
    <div class="nav-line home-line">
      <a href="#/">
        <div class="iconfont icon-earphone" />
      </a>
    </div>

    <div :class="`nav-line ${item.url === activeUrl && 'actived'}`" v-for="item in navList" :key="item.url">
      <el-tooltip class="item" effect="dark" :visible-arrow="false" :offset="4" :content="item.name" placement="right">
        <a :href="item.url">
          <div class="hover-bg" />
          <el-badge v-if="item.url === '#/download'" :value="downCount" :hidden="!downCount" class="item" >
            <i class="iconfont icon-down" />
          </el-badge>
          <i v-else :class="`iconfont icon-${item.icon}`" />
        </a>
      </el-tooltip>

    </div>
  </div>
</template>

<script>
  import { mixInject } from "../utils/store/state";
  import { computed } from 'vue';
  import { useRoute } from 'vue-router'

  export default {
    name: "PageLeft",
    setup() {
      const state = mixInject(['user', 'downloadList']);
      const route = useRoute();
      return {
        ...state,
        downCount: computed(() => state.downloadList.filter((d) => !d.finished).length),
        activeUrl: computed(() => `#${route.path}`),
        navList: [
          {
            url: '#/playlist',
            icon: 'playlist',
            name: '歌单',
          },
          {
            url: '#/recommend',
            icon: 'recommend',
            name: '推荐',
          },
          {
            url: '#/top',
            icon: 'top',
            name: '榜单',
          },
          {
            url: '#/download',
            icon: 'down',
            name: '下载',
          },
          {
            url: '#/local',
            icon: 'local',
            name: '本地',
          },
        ],
        goToUser() {
          if (this.mode === 'simple') {
            return window.location = '#/';
          }
          window.location = '#/user';
        }
      }
    },
  }
</script>

<style lang="scss">
  @import "../assets/style/value";
  .mode-simple {
    .page-left-nav {
      height: 100px !important;
      width: 100px !important;
      border-radius: 50%;
      padding: 0;
      top: -40px;
      left: -40px;
      min-height: 0;

      &:hover {
        transform: scale(1.5);
        top: -20px;
        left: -20px;
      }
    }
  }

  .hide-nav .page-left-nav {
    overflow: hidden;
  }

  .page-left-nav {
    position: relative;
    display: inline-block;
    vertical-align: top;
    left: 0;
    top: 0;
    width: 43px;
    padding: 0 10px;
    transition: 0.4s;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-radius: 0;
    opacity: 0.4;
    height: calc(100vh - 10px);
    background: linear-gradient(to bottom, #fff5, #fff0 calc(100% - 100px), #fff0);

    &:hover {
      /*width: 120px;*/
      opacity: 0.6;

      .iconfont {
        opacity: 1;
      }
      .home-line {
        .iconfont {
          font-size: 30px;
        }
        .icon-text {
          font-size: 24px !important;
        }
      }
    }

    .nav-line {
      line-height: 36px;
      height: 36px;
      margin-bottom: 15px;
      cursor: pointer;
      width: 300px;
      position: relative;

      .hover-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 43px;
        height: 43px;
        background: $blue;
        transform: scale(0, 0.8) translate(20%, -20%);
        transform-origin: 0 100%;
        transition: 0.3s;
      }

      &.home-line {
        margin-top: 40px;
      }

      a {
        color: #fff !important;
      }

      &.actived {
        .hover-bg {
          transform: scale(0.8, 0.25) translate(10%, -100%);
        }

        &:hover {
          .hover-bg {
            transform: scale(0.8, 0.5) translate(10%, -50%);
          }
        }
      }

      &:hover {
        .iconfont {
          color: #fff;
        }
        .hover-bg {
          transform: scale(0.3, 0.8) translate(20%, -20%);
        }
      }

      .iconfont {
        background-origin: border-box;
        background-size: 300px;
        background-position-x: 0;
        color: #fff9;
        display: inline-block;
        vertical-align: top;
        font-size: 24px;
        font-weight: 100;
        opacity: 0.8;
        transition: 0.5s;
        width: 40px;
        text-align: center;
      }
      .icon-text {
        display: inline-block;
        vertical-align: top;
        opacity: 0.8;
        transition: 0.3s;
        padding-left: 20px;
        width: 100px;
      }
    }
  }
</style>