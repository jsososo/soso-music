<template>
  <div class="page-top-nav">

    <span class="router-icon">
      <i class="el-icon-arrow-left" />
      <i class="el-icon-arrow-right" />
    </span>

    <input :class="`search-input ${isSearchPage && 'is-search-page'}`" v-model="keyword" @keyup="onKeyUp" type="text" placeholder="SEARCH..." />

    <div :class="`platform-select active-${setting.platform}`">
      <i class="iconfont icon-163 color-163" @click="updatePlatform('163')" />
      <i class="iconfont icon-qq color-qq" @click="updatePlatform('qq')" />
    </div>

    <div class="right-container">
      <a href="#/user" v-if="!u.logined" class="top-nav-btn iconfont icon-user user-btn" />
      <a href="#/user" v-else class="top-nav-btn user-btn"><img :src="u.avatar" /></a>
<!--      <div class="top-nav-btn iconfont icon-windmill" />-->
      <a href="#/setting" class="top-nav-btn iconfont icon-setting"  />
<!--      <div class="top-nav-btn iconfont icon-feedback" />-->
      <a href="#/about" class="top-nav-btn iconfont icon-version" />
    </div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../utils/stringHelper";
  import {mixInject} from "../utils/store/state";
  import { ref, computed } from 'vue';
  import {useRoute} from "vue-router";

  export default {
    name: "TopNav",
    setup() {
      const state = mixInject(['setting', 'searchInfo', 'user']);
      const keyword = ref('');
      const u = computed(() => state.user[state.setting.platform]);
      const isSearchPage = computed(() => useRoute().path === '/search');
      return {
        ...state,
        keyword,
        u,
        isSearchPage,
        updatePlatform(platform) {
          state.setting.platform = platform;
        },
        onKeyUp({ code, key = code }) {
          if (key.toLowerCase() === 'enter') {
            changeUrlQuery({ keyword: keyword.value }, '#/search');
            state.searchInfo.keyword = keyword.value;
          }
        },
      }
    },
  }
</script>

<style scoped lang="scss">
  .page-top-nav {
    -webkit-app-region: drag;
    width: 100%;
    height: 30px;
    line-height: 30px;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.8;
    padding: 25px 0 10px 20px;
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

    .right-container {
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

        &:hover {
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
      .icon-windmill {
        transform: rotate(0);

        &:hover {
          transform: rotate(-90deg);
        }
      }
    }
  }
</style>