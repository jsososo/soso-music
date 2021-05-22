<template>
  <div @dblclick="updateWindowSize" :class="`page-top-nav app-platform-${setting.SYSTEM_PLATFORM}`">

    <span class="router-icon">
      <i :class="`el-icon-arrow-left ${canBack && 'actived'}`" @click="canBack && (router.isBack = true)" />
      <i :class="`el-icon-arrow-right ${canReBack && 'actived'}`" @click="canReBack && (router.isReBack = true)" />
    </span>

    <input :class="`search-input ${isSearchPage && 'is-search-page'}`" v-model="keyword" @keyup="onKeyUp" type="text" placeholder="SEARCH..." />

    <div :class="`platform-select active-${setting.platform}`">
      <i class="iconfont icon-163 color-163" @click="updatePlatform('163')" />
      <i class="iconfont icon-qq color-qq" @click="updatePlatform('qq')" />
    </div>

    <div class="top-nav-right-container">
      <a href="#/user" v-if="!u.logined" class="top-nav-btn iconfont icon-user user-btn" />
      <a href="#/user" v-else class="top-nav-btn user-btn"><img :src="u.avatar" /></a>
      <template v-if="setting.SYSTEM_PLATFORM === 'darwin'">
        <a href="#/simple" class="top-nav-btn iconfont icon-windmill" />
        <a href="#/setting" class="top-nav-btn iconfont icon-setting"  />
        <a href="#/feedback" class="top-nav-btn iconfont icon-feedback" />
        <a href="#/about" class="top-nav-btn icon-version-container">
          <i class="iconfont icon-version ft_20" />
        </a>
      </template>
      <template v-else>
        <span class="top-nav-btn sys-icon iconfont icon-mini" @click="appCommand('APP_MINIMIZE')" />
        <el-popover
          popper-class="top-nav-popover top-nav-right-container"
          trigger="hover"
        >
          <div>
            <a href="#/simple" class="top-nav-btn iconfont icon-windmill" />
            <a href="#/setting" class="top-nav-btn iconfont icon-setting"  />
            <a href="#/feedback" class="top-nav-btn iconfont icon-feedback" />
            <a href="#/about" class="top-nav-btn icon-version-container">
              <i class="iconfont icon-version ft_20" />
            </a>
          </div>
          <template #reference>
            <span class="top-nav-btn sys-icon iconfont icon-more-line" />
          </template>
        </el-popover>
        <span class="top-nav-btn sys-icon iconfont icon-close" @click="appCommand('APP_HIDE')" />
      </template>
    </div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../utils/stringHelper";
  import {mixInject} from "../utils/store/state";
  import { ref, computed } from 'vue';
  import {useRoute} from "vue-router";
  import { ipcRenderer } from 'electron';
  const win = require('electron').remote.getCurrentWindow()

  export default {
    name: "TopNav",
    setup() {
      const state = mixInject(['setting', 'searchInfo', 'user', 'router']);
      const keyword = ref('');
      const u = computed(() => state.user[state.setting.platform]);
      const isSearchPage = computed(() => useRoute().path === '/search');
      const canBack = computed(() => state.router.history.length > 1);
      const canReBack = computed(() => !!state.router.back.length);
      return {
        ...state,
        keyword,
        u,
        isSearchPage,
        canBack,
        canReBack,
        updatePlatform(platform) {
          state.setting.platform = platform;
        },
        onKeyUp({ code, key = code }) {
          if (key.toLowerCase() === 'enter') {
            changeUrlQuery({ keyword: keyword.value }, '#/search');
            state.searchInfo.keyword = keyword.value;
          }
        },
        appCommand(opts) {
          ipcRenderer.send(opts)
        },
        updateWindowSize(e) {
          if (e.target.className.split(' ')[0] !== 'page-top-nav') {
            return;
          }
          if (win.isMaximized()) {
            const { width, height } = win.getBounds();
            console.log(width, height);
            win.setBounds({
              x: Number((width * 0.15).toFixed(0)),
              y: Number((height * 0.15).toFixed(0)),
              width: Number((width * 0.7).toFixed(0)),
              height: Number((height * 0.7).toFixed(0)),
            });
          } else {
            win.maximize()
          }

        }
      }
    },
  }
</script>

<style lang="scss">
  @import "../assets/style/value";

  .page-top-nav {
    -webkit-app-region: drag;
    width: calc(100% - 65px);
    height: 30px;
    line-height: 30px;
    position: fixed;
    top: 0;
    left: 65px;
    opacity: 0.8;
    padding: 18px 0 10px 20px;
    transition: 0.4s;

    * {
      -webkit-app-region: none;
    }
    &:hover {
      opacity: 1;
    }

    .router-icon {
      font-size: 20px;
      line-height: 42px;
      i {
        padding: 0 5px;
        cursor: pointer;
        opacity: 0.3;

        &.actived {
          opacity: 1;
        }
      }
    }

    .search-input {
      background: #fff3;
      border: none;
      outline: none;
      border-bottom: 2px solid #00B7FF00;
      transition: 0.4s;
      padding: 5px 10px 1px 10px;
      border-radius: 25px;
      height: 24px;
      line-height: 24px;
      width: 150px;
      box-shadow: #fff0 0 0 5px;
      color: #fff9;
      font-size: 16px;

      &::-webkit-input-placeholder {
        color: #fff5;
      }

      &:focus, &.is-search-page {
        border-bottom: 2px solid #00B7FF;
        border-radius: 10px 10px 5px 5px;
        background: #fff3;
        width: 200px;
        box-shadow: #fff3 0 0 10px;
      }
    }

    .platform-select {
      display: inline-block;
      vertical-align: top;
      padding-left: 20px;

      .iconfont {
        font-size: 20px;
        line-height: 42px;
        padding: 0 6px;
        opacity: 0.3;
        transition: 0.3s;
      }
      $platform: '163', 'qq';
      @each $p in $platform {
        &.active-#{$p} .icon-#{$p} {
          opacity: 0.8;
        }
      }
    }

  }
  .top-nav-right-container {
    float: right;
    padding-right: 50px;

    .top-nav-btn {
      display: inline-block;
      padding: 5px 10px;
      transition: 0.3s;
      font-size: 20px;
      cursor: pointer;
      margin-left: 5px;
      opacity: 0.6;
      vertical-align: top;

      &:hover {
        opacity: 0.8;
      }
    }

    .icon-setting {
      transform: rotate(0);

      &:hover {
        transform: rotate(90deg);
      }
    }
    .icon-version {
      transform: rotateY(0);
      transition: 0.3s;
    }
    .icon-version-container:hover {
      .icon-version {
        transform: rotateY(180deg);
      }
    }
    .user-btn {
      overflow: hidden;
      img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        transition: 0.3s;
        margin-top: 2px;
      }
      &:before {
        border: 1px solid #fff9;
        border-radius: 50%;
        transition: 0.3s;
      }
      &:hover {
        transform: scale(1.2);
        &:before {
          border-radius: 4px;
        }
        img {
          border-radius: 4px;
        }
      }
    }
    .icon-feedback {
      @keyframes rotateFeedback {
        from, 50%, to {
          transform: rotate(0);
        }

        25% {
          transform: rotate(12deg);
        }
        75% {
          transform: rotate(-12deg);
        }

      }

      &:hover {
        animation: rotateFeedback 0.4s linear;
      }
    }
    .icon-windmill {
      transform: rotate(0);

      &:hover {
        transform: rotate(-90deg);
      }
    }

    .sys-icon {
      transform: scale(0.9);
      margin-left: 0;
      transition: 0.3s;
      background: transparent;

      &.icon-close:hover {
        background: $red;
      }

      &.icon-mini:hover {
        background: $green;
      }
      &.icon-more-line:hover {
        background: $blue;
      }
    }
  }


  .top-nav-popover {
    min-width: 40px !important;
    width: 92px !important;
    text-align: center;
    padding: 5px 0 !important;
    .top-nav-btn {
      width: 30px;
      text-align: center;
      margin-left: 0;
      color: #333 !important;
      font-size: 18px;
      padding: 3px 8px;
    }
  }
</style>