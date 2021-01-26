<template>
  <div>
    <div class="bg-img" />
    <div class="play-bg-img bg-img" v-if="playNow.al" :style="`background-image: url('${playNow.al.picUrl}')`" />
    <div class="page-container">
      <left-nav />
      <div class="page-content">
        <top-nav />
        <div class="main-content hide-scroll">
          <info-box
            v-if="showPlayingInfo && playNow.al"
            :pic="playNow.al.picUrl"
            err-pic="https://y.gtimg.cn/mediastyle/global/img/album_300.png"
            :list="[
              { text: playNow.name, icon: 'icon-song' },
              { text: playNow.al.name, icon: 'icon-album' },
              { text: playNow.ar.map(({ name }) => ({ text: name })), icon: 'icon-singer' },
            ]"
          />
          <router-view />
        </div>
      </div>
    </div>
    <player />
  </div>
</template>

<script>
import LeftNav from "./components/LeftNav";
import TopNav from "./components/TopNav";
import Player from "./components/Player";
import store from './utils/store/index';
import {useRoute} from "vue-router";
import { watch, computed } from 'vue';
import InfoBox from "./components/InfoBox";

import request from "./utils/request";
import {handlePlayLists, queryPlayListDetail, updatePlaying, cutSong, initLogin} from "./utils/store/action";
import { ipcRenderer } from 'electron'
// import Num from './utils/num';

export default {
  name: 'App',
  components: {
    LeftNav,
    TopNav,
    Player,
    InfoBox,
  },
  setup() {
    // 初始化 store state
    const state = store();

    const route = useRoute();

    watch(() => route, () => {
      // console.log('router', v);
    })

    initLogin();

    const showPlayingInfo = computed(() => !!{
      '/': true,
      '/playlist/detail': true,
      '/playlist': true,
    }[route.path])

    // 获取服务器 cookie 信息做基础
    request('GET_SERVER_COOKIE')
      // 查询推荐歌单
      .then(() => request('RECOMMEND_PLAYLIST', state.setting.platform))
      // 处理歌单信心，获取第一个推荐歌单
      .then(async ({ data = []}) => {
        let list;
        handlePlayLists(data);
        data[0] && ({ list } = await queryPlayListDetail(data[0].aId));

        updatePlaying(list[0], list);
      })

    // 键盘事件绑定
    window.onkeydown = ({ keyCode, target, ctrlKey, altKey, shiftKey }) => {
      // 输入框内的操作，忽略掉
      if (['textarea', 'input'].indexOf(target.tagName.toLowerCase()) > -1) {
        return;
      }
      let { codeMap, volume } = state.setting;
      const codes = [];
      ctrlKey && codes.push('ctrl');
      altKey && codes.push('alt');
      shiftKey && codes.push('shiftKey');

      if ([16, 17, 18].indexOf(keyCode) === -1) {
        codes.push(keyCode);
      }

      volume *= 100;

      switch (codes.join('-')) {
        case codeMap.VOLUME_DOWN:
          volume = Math.max(volume - 5, 0);
          // this.changeVolume(volume);
          // this.$message.info(`音量调至${Num(volume, 0)}%`);
          return false;
        case codeMap.VOLUME_UP:
          volume = Math.min(volume + 5, 100);
          // this.changeVolume(volume);
          // this.$message.info(`音量调至${Num(volume, 0)}%`);
          return false;
        case codeMap.PLAY_PREV:
          cutSong('prev');
          return false;
        case codeMap.PLAY_NEXT:
          cutSong('next');
          return false;
        case codeMap.PLAY:
          state.playerStatus.playing = !state.playerStatus.playing;
          return false;
        case (codeMap.TO_SIMPLE || 'ctrl-83'):
          window.location = '#/simple';
          return false;
        case (codeMap.QUIT_SIMPLE || '27'):
          if (this.mode === 'simple') {
            window.location = '#/';
          }
          return false;
      }
      state.setting.volume = volume;
    };
    window.onkeypress = window.onkeydown;
    // window.onkeyup = ({ keyCode }) => keys = keys.filter((c) => c !== keyCode);

    ipcRenderer.send('UPDATE_SERVER_POINT', state.setting.SERVER_PORT);

    ipcRenderer.send('SET_DOWNLOAD_DIR', state.setting.DOWN_DIR);

    return {
      ...state,
      showPlayingInfo,
    };
  }
}
</script>

<style lang="scss">
  @import "assets/style/common";
  @import "assets/style/icon/iconfont.css";
  @import "assets/style/value";
  html {
    &::-webkit-scrollbar
    {
      width:5px;
      height:0;
      background-color:rgba(0,0,0,0.3);
    }
    /*定义滚动条轨道
     内阴影+圆角*/
    &::-webkit-scrollbar-track
    {
      border-radius:10px;
      /*background-color: rgba(255,255,255,0.5);*/
    }
    /*定义滑块
     内阴影+圆角*/
    &::-webkit-scrollbar-thumb
    {
      border-radius:10px;
      background-color:rgba(255,255,255,0.5);
    }
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #fffc;
    min-width: $minWidth;
    overflow: hidden;

    a {
      color: #fffc;
    }

    .hide-scroll {
      overflow: auto;
      &::-webkit-scrollbar
      {
        width: 0;
        height: 0;
      }
    }

    .small-scroll {
      &::-webkit-scrollbar
      {
        width:5px;
        height:5px;
        background-color:rgba(0,0,0,0.3);
      }
      /*定义滚动条轨道
       内阴影+圆角*/
      &::-webkit-scrollbar-track
      {
        border-radius:10px;
        /*background-color: rgba(255,255,255,0.5);*/
      }
      /*定义滑块
       内阴影+圆角*/
      &::-webkit-scrollbar-thumb
      {
        border-radius:10px;
        background-color:rgba(255,255,255,0.5);
      }
    }

    .iconfont {
      cursor: pointer;
    }

    $colors: (
      red: $red,
      blue: $blue,
      green: $green,
      yellow: $yellow,
      gray: $gray
    );

    $cls: color, background, border-color;
    $colors_key: blue, red, yellow, green;
    @each $n in $cls {
      @each $k, $v in $colors {
        .#{$n}-#{$k} {
          #{$n}: $v !important;
        }
      }
    }
    .color-qq {
      color: $green;
    }
    .color-163 {
      color: $red;
    }

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
      -webkit-filter: brightness(60%) blur(30px);
      filter: brightness(60%) blur(30px);
      transform: scale(1.1);
    }

    .page-container {
      display: flex;

      .page-content {
        flex: 1;
        position: relative;
      }

      .main-content {
        padding: 0 20px;
        margin-top: 80px;
        height: $mainHeight;
        position: relative;

        .inner_tab_content {
          height: $innerTabHeight;
        }
      }
    }

    .playing-bg {
      position: absolute;
      height: 76px;
      top: -3px;

      .wave-bg {
        width: 100vw;
        height: 100vw;
        border-radius: 35%;
        position: absolute;
        right: 0;
        top: -50vw;
        animation: waveBg 5s infinite linear;
        background: -webkit-linear-gradient(left, #409EFF33, #409EFF99);
      }
      .wave-bg2 {
        width: 120vw;
        height: 120vw;
        border-radius: 45%;
        position: absolute;
        right: 0;
        top: -60vw;
        animation: waveBg 8s infinite linear;
        background: -webkit-linear-gradient(top, #fff1, #fff2);
      }

      @keyframes waveBg {
        from {
          transform: rotate(0);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }

    .page-right-container {
      width: 50%;
      min-width: 425px;
      max-width: 750px;
      position: absolute;
      right: 0;
      height: 100%;
      top: 0;
      overflow-y: auto;
      background: #0001;
      border-left: 1px solid #fff5;
      &::-webkit-scrollbar
      {
        width: 0;
        height: 0;
      }
    }
  ;
  }
</style>
