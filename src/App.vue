<template>
  <div :class="`app-platform-${setting.SYSTEM_PLATFORM} ${hidePlayer && 'hide-player'} ${hideNav && 'hide-nav'}`">
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
            :list="infoBoxList"
          >
            <div class="platform-icons" >
              <el-tooltip class="item" effect="dark" content="信息" placement="top">
                <i :class="`iconfont icon-${playNow.platform} color-${playNow.platform} ${playNow.bPlatform ? 'op_3' : 'op_7'}`" />
              </el-tooltip>
              <el-tooltip v-if="playNow.bPlatform" class="item" effect="dark" content="音源" placement="top">
                <i :class="`iconfont op_7 icon-${playNow.bPlatform} color-${playNow.bPlatform}`" />
              </el-tooltip>

            </div>
            <div class="index-icon-content">
              <a href="#/" class="mg_10 iconfont icon-lyric">
                <i class="fake-icon iconfont icon-lyric" />
              </a>
              <a href="#/comment" class="iconfont icon-comment mg_10">
                <i class="fake-icon iconfont icon-comment" />
                <span v-if="playNow.totalComments" style="font-weight: normal;vertical-align: 4px" class="pl_5 ft_12">{{numToStr(playNow.totalComments)}}</span>
              </a>
            </div>
          </info-box>
          <router-view />
        </div>
      </div>
    </div>
    <player />
    <canvas id="music-data-canvas" />
  </div>
</template>

<script>
import LeftNav from "./components/LeftNav";
import TopNav from "./components/TopNav";
import Player from "./components/Player";
import store from './utils/store/index';
import {useRoute, useRouter} from "vue-router";
import { computed } from 'vue';
import InfoBox from "./components/InfoBox";

import request from "./utils/request";
import {handlePlayLists, queryPlayListDetail, updatePlaying, cutSong, initLogin, mixDomain as domain} from "./utils/store/action";
import { ipcRenderer } from 'electron'
import { ElMessage, ElNotification } from 'element-plus';
import { changeUrlQuery, numToStr } from "./utils/stringHelper";
import Storage from "./utils/Storage";

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
    const { playNow } = state;

    const route = useRoute();
    const router = useRouter();
    window.route = route;
    window.router = router;

    const infoBoxList = computed(() => ([
      { text: playNow.name, icon: 'icon-song' },
      { text: playNow.al.name, link: changeUrlQuery({ id: playNow.al.id, mid: playNow.al.mid, platform: playNow.al.platform }, '#/album', false), icon: 'icon-album' },
      {
        text: playNow.ar.map(({ name, id, mid, platform }, i) =>
          ({
            text: `${name}${(i < playNow.ar.length - 1) ? '/' : ''}`,
            link: changeUrlQuery({ id, mid, platform }, '#/singer', false)
          })),
        icon: 'icon-singer'
      },
    ]))

    initLogin();

    ipcRenderer.send('UPDATE_SERVER_POINT', state.setting.SERVER_PORT);

    ipcRenderer.send('SET_DOWNLOAD_DIR', state.setting.DOWN_DIR);

    ipcRenderer.send('GET_HISTORY_DATA');

    // 左侧显示播放信息的页面
    const showPlayingInfo = computed(() => !!{
      '/': true,
      '/playlist/detail': true,
      '/playlist': true,
      '/recommend': true,
      '/comment': true,
      '/history': true,
    }[route.path])

    const hidePlayer = computed(() => !!{
      '/simple': true,
    }[route.path])

    const hideNav = computed(() => !!{
      '/simple': true,
    }[route.path])

    request({
      domain,
      api: 'MIX_VERSION_CHECK',
      data: { version: state.setting.version },
    }).then(({ data }) => {
      if (data) {
        ElNotification({
          title: `最新版本：${data.version}`,
          message: data.explain.split('\n').map(v => `<div class="fc_666 ft_12">${v}</div>`).join('') +
            `<dvi><a style="color: #409EFF" href="#/about?type=history">去看看</a></dvi>`,
          dangerouslyUseHTMLString: true,
        })
      }
    })
    // 查询推荐歌单
    request('RECOMMEND_PLAYLIST', state.setting.platform)
      // 处理歌单信心，获取第一个推荐歌单
      .then(async ({ data = []}) => {
        let list;
        handlePlayLists(data);
        data[0] && ({ list } = await queryPlayListDetail(data[0].aId));

        updatePlaying(list[0], list);
      })

    // 键盘事件绑定
    window.onkeydown = ({ keyCode, target, ctrlKey, altKey, shiftKey, metaKey }) => {
      // 输入框内的操作，忽略掉
      if (['textarea', 'input'].indexOf(target.tagName.toLowerCase()) > -1) {
        return;
      }
      const { codeMap, setting } = state;
      let { volume } = setting;
      const codes = [];
      ctrlKey && codes.push('ctrl');
      altKey && codes.push('alt');
      shiftKey && codes.push('shiftKey');
      metaKey && codes.push('meta');

      if ([16, 17, 18, 91].indexOf(keyCode) === -1) {
        codes.push(keyCode);
      }
      switch (codes.join('-').toLowerCase()) {
        case codeMap.VOLUME_DOWN:
          ElMessage.closeAll();
          state.setting.volume = Math.max(volume - 5, 0);
          ElMessage.info(`音量调至${state.setting.volume}`);
          return false;
        case codeMap.VOLUME_UP:
          ElMessage.closeAll();
          state.setting.volume = Math.min(volume + 5, 100);
          ElMessage.info(`音量调至${state.setting.volume}`);
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
        case (codeMap.GO_SIMPLE):
          window.location = '#/simple';
          return false;
        case (codeMap.QUIT_SIMPLE):
          if (route.path === '/simple') {
            window.location = '#/';
          }
          return false;
        // case 'meta-82':
        //   return location.reload();
      }
      return true;
    };
    // window.onkeyup = ({ keyCode }) => keys = keys.filter((c) => c !== keyCode);

    setInterval(() => {
      if (Storage.get('q_cookie_time') < new Date().valueOf() - 86400000) {
        state.user.qq = { id: state.user.qq.id };
      }
    }, 60000)

    return {
      ...state,
      showPlayingInfo,
      infoBoxList,
      hideNav,
      hidePlayer,
      numToStr,
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

    .main-player-container, .page-top-nav {
      transition: 0.3s;
    }
    .page-left-nav {
      transition: 0.3s;
    }

    .hide-player {
      height: 100vh;
      overflow: hidden;
      .main-player-container {
        opacity: 0;
        overflow: hidden;
        bottom: -120px;
      }
    }

    .hide-nav {
      .page-top-nav {
        top: -100px;
      }
      .page-left-nav {
        height: 80px !important;
      }
    }

    #music-data-canvas {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
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

    $cls: color, background, border-color;
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
    .color-migu {
      color: $yellow;
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
        margin-top: 70px;
        height: $mainHeight;
        position: relative;

        .inner_tab_content {
          height: $innerTabHeight;
        }
        .platform-icons {
          position: absolute;
          top: 205px;
          left: 5px;

          .iconfont {
            padding: 5px;
          }
        }
        .index-icon-content {
          font-weight: 900;
          padding-top: 25px;

          .icon-comment {
            font-size: 20px;
          }

          a {
            position: relative;
            vertical-align: middle;
            transition: 0.3s;
            opacity: 0.6;

            &:hover {
              opacity: 0.8;

              .fake-icon {
                transform: translate(2px, 1px);
                opacity: 0.8;
              }
            }

            .fake-icon {
              position: absolute;
              top: 0;
              left: 0;
              transform: translate(0, 0);
              opacity: 0;
              color: $blue;
              transition: 0.3s;
              z-index: -1;
            }
          }
        }
      }
    }

    /* 播放中的歌曲 */
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

    .input-line.so-input {
      line-height: 48px;
      font-size: 20px;

      input {
        background: transparent;
        border: none;
        outline: none;
        color: #fff;
        width: 250px;
        font-size: 20px;

        &::-webkit-input-placeholder {
          color: #fff5;
        }
      }

      .input-content, .input-label {
        display: inline-block;
        padding: 6px;
        position: relative;
        vertical-align: top;

        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          display: inline-block;
          transition: 0.4s;
        }
      }
      .input-label {
        &:before {
          height: 40px;
          top: 8px;
          width: 0;
          background: #{$blue}cc;
          z-index: -1;
          opacity: 0.5;
        }
      }
      .input-content {
        width: 250px;
        overflow: hidden;
        margin-left: 15px;

        &:before {
          width: 650px;
          background: linear-gradient(to right, $blue, $blue 50%, #fffc 51% , #fffc);
          height: 2px;
          top: 40px;
          transform: translateX(-330px);
          opacity: 0.6;
        }
      }

      &:hover {
        .input-label:before {
          width: 10px;
        }
      }

      &:focus-within {
        .input-label:before {
          opacity: 1;
          width: 20px;
        }
        .input-content:before {
          transform: translateX(0);
        }
      }
    }

    .common-small-box {
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

        .box-img-container {
          border-radius: 5px;
          box-shadow: 0 0 30px #333333;

          img {
            width: 170px;
            height: 170px;
            top: -10px;
            left: -10px;
          }

          .box-name {
            background: #000a;
            color: #fff;
          }
        }
      }

      .box-img-container {
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
      .box-name {
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
