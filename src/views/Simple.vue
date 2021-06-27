<template>
  <div :class="`simple-container ${!setting.SHOW_SIMPLE_COVER && 'hide-cover'}`">
    <view class="touch-move touch-top" />
    <view class="touch-move touch-bottom" />
    <view class="touch-move touch-left" />
    <template v-if="playNow.al">
      <div class="img-container">
        <img class="song-img" :src="playNow.al.picUrl" alt="" />
      </div>
      <div class="song-info" v-if="allSongs[playNow.aId]">
        <div class="d-table">
          <div class="d-table-cell">
            <div class="song-name">{{playNow.name}}</div>
            <div class="song-artist"><span v-for="a in playNow.ar" class="pr_5" :key="a.id">{{a.name}}</span></div>
            <div class="song-lyric">
              <div v-for="(item, index) in showLyrics" :key="`lyric-${item}-${index}`" :class="`lyric-item ${index === 1 && 'actived'}`">{{item}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-btn">
        <div class="iconfont icon-trans" v-if="playNow.rawTrans" @click="setting.SHOW_SIMPLE_TRANS = !setting.SHOW_SIMPLE_TRANS">
          <div class="hide-trans" v-if="!setting.SHOW_SIMPLE_TRANS" />
        </div>

        <div class="iconfont icon-cover" @click="setting.SHOW_SIMPLE_COVER = !setting.SHOW_SIMPLE_COVER">
          <div class="hide-trans" v-if="!setting.SHOW_SIMPLE_COVER" />
        </div>
      </div>

    </template>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import { computed, ref, watch } from 'vue';
  import { replaceObj } from "../utils/util";

  export default {
    name: "Simple",
    setup() {
      const state = mixInject(['playNow', 'allSongs', 'setting', 'playerStatus']);
      const { playNow, playerStatus, setting } = state;

      const lyricKey = ref(0);
      const startKey = ref(0);
      const lyricList = Object.values(playNow.lyric || {});

      const renderLyric = () => {
        const { lyric } = playNow;
        if (!lyric) {
          return;
        }
        const lyricKeys = Object.keys(lyric);
        const current = playerStatus.currentTime * 1000;
        const key = lyricKeys.findIndex((k) => (k - 300) >= current);
        let lK, sK;
        switch (key) {
          case (lyricKeys.length - 1):
            lK = lyricKeys.length - 1;
            sK = lyricKeys.length - 2;
            break;
          case -1:
            lK = lyricKeys.length;
            sK = lyricKeys.length - 1;
            break;
          case 0:
            lK = 0;
            sK = 0;
            break;
          default:
            lK = key;
            sK = lyricKey.value - 1;
            break;
        }

        lyricKey.value = lK - 1;
        startKey.value = sK - 1;
      }
      watch(() => playNow.lyric,(v) => replaceObj(lyricList, Object.values(v || {})) || (startKey.value = 0));

      watch(() => playerStatus.percentage, renderLyric);

      const showLyrics = computed(() => {
        const [l1, l2, l3] = ([1,2,3]).map((v) => lyricList[startKey.value+v] || { str: '', trans: ''});
        return setting.SHOW_SIMPLE_TRANS && playNow.rawTrans ?
          [ l2.str, '', l2.trans ] :
          [l1.str, l2.str, l3.str]
      })


      return {
        ...state,
        lyricKey,
        startKey,
        showLyrics,
      }
    },
  }
</script>

<style lang="scss">
  @import "../assets/style/value";

  .touch-move {
    -webkit-app-region: drag;
    position: fixed;
    z-index: -1;

    &.touch-top {
      top: 0;
      width: 100vw;
      height: 100px;
      left: 0;
    }

    &.touch-bottom {
      width: 100vw;
      bottom: 0;
      left: 0;
      height: 70px;
    }
    &.touch-left {
      width: 10%;
      top: 100px;
      left: 0;
      height: 100vh;
    }
  }
  .simple-container {
    height: calc(#{$mainHeight} - 10vh);
    width: 90%;
    padding: 0 5%;
    transition: 0.3s;
    padding-top: 8vh;

    &:hover {
      .bottom-btn {
        opacity: 0.2;
        transition: 0.3s;
      }
    }

    &.hide-cover {
      padding-top: calc(30vh - 200px);

      .img-container {
        width: 0;
        opacity: 0;
      }

      .song-info {
        width: calc(80vw - 40px);
      }
    }

    .img-container {
      opacity: 0.7;
      overflow: hidden;
      display: inline-block;
      vertical-align: top;
      border-radius: 20%;
      animation: imgBR 13s infinite;
      transition: 0.3s;
      width: 60vh;

      @keyframes imgBR {
        from, to {
          border-radius: 20%;
          transform: scale(1);
        }
        30%, 80% {
          border-radius: 17%;
          transform: scale(1.01);
        }

        60% {
          border-radius: 21%;
          transform: scale(0.995);
        }

      }

      .song-img {
        height: 60vh;
      }

    }

    .song-info {
      display: inline-block;
      vertical-align: top;
      text-align: center;
      width: calc(100% - 60vh);
      color: #fffa;
      font-weight: bold;
      font-size: 26px;
      line-height: 32px;
      height: 60vh;
      transition: 0.3s;

      .d-table {
        display: table;
        width: 100%;
        height: 60vh;
      }
      .d-table-cell {
        display: table-cell;
        vertical-align: middle;
        position: relative;
      }

      .song-artist {
        font-size: 16px;
        margin-top: 15px;
      }

      .song-lyric {
        font-size: 20px;
        font-weight: normal;
        margin-top: 50px;

        .lyric-item {
          width: 80%;
          padding: 5px 10%;
          opacity: 0.6;

          &.actived {
            opacity: 0.9;
          }
        }
      }
    }

    .bottom-btn {
      position: fixed;
      bottom: 20px;
      text-align: center;
      opacity: 0;
      transition: 0.3s 4s;
      padding-left: 10px;
      border-radius: 20px;
      box-sizing: border-box;
      width: 100%;
      left: 0;
      z-index: 2;

      &:hover {
        transition: 0.3s;
        opacity: 0.6;
      }

      .iconfont {
        font-size: 24px;
        color: #fff;
        cursor: pointer;
        display: inline-block;
        line-height: 28px;
        position: relative;
        width: 80px;

        .hide-trans {
          position: absolute;
          width: 36px;
          border: 2px solid #fff;
          transform: rotate(45deg);
          top: 12px;
          left: calc(50% - 18px);
          background: #fff;
          border-radius: 3px;
        }

      }
    }
  }

</style>