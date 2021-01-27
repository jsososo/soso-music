<template>
  <div class="page-left-nav">
    <div class="nav-line home-line">
      <a href="#/">
        <div class="iconfont el-icon-s-home" />
        <div class="icon-text">soso</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/playlist">
        <i class="iconfont icon-playlist"></i>
        <div class="icon-text">歌单</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/recommend">
        <i class="iconfont icon-recommend"></i>
        <div class="icon-text">推荐</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/top">
        <i class="iconfont icon-top"></i>
        <div class="icon-text">榜单</div>
      </a>
    </div>
    <div class="nav-line">
      <a href="#/download">
        <el-badge :value="downCount" :hidden="!downCount" class="item" >
          <i class="iconfont icon-down" />
        </el-badge>
        <div class="icon-text">下载</div>
      </a>
    </div>
  </div>
</template>

<script>
  import { mixInject } from "../utils/store/state";
  import { computed } from 'vue';

  export default {
    name: "PageLeft",
    setup() {
      const state = mixInject(['user', 'downloadList'])
      return {
        ...state,
        downCount: computed(() => state.downloadList.filter((d) => !d.finished).length),
      }
    },
    methods: {
      goToUser() {
        if (this.mode === 'simple') {
          return window.location = '#/';
        }
        window.location = '#/user';
      }
    }
  }
</script>

<style lang="scss">
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

  .page-left-nav {
    position: relative;
    display: inline-block;
    vertical-align: top;
    left: 0;
    top: 0;
    width: 43px;
    padding: 0 10px;
    transition: 0.4s;
    overflow: hidden;
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

      &.home-line {
        margin-top: 40px;
      }

      a {
        color: #fff !important;
      }

      &:hover {
        .iconfont {
          font-size: 30px;
        }
        .icon-text {
          font-size: 20px;
        }
      }

      .iconfont {
        display: inline-block;
        vertical-align: top;
        font-size: 24px;
        font-weight: 100;
        opacity: 0.8;
        transition: 0.3s;
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