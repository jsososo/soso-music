<template>
  <div class="lyric-content-container" ref="lyricContainer">
    <div
      :class="`lyric-list-container ${grab ? 'grabbing' : ''}`"
      @mousedown="changeGrab(true)"
      @mouseup="changeGrab(false)"
      @mouseleave="changeGrab(false)"
      @mousemove="dragLyric"
    >
      <div v-if="playNow.lyric" class="lyric-list" :style="`top: ${top + moveY}px;`">
        <div
          v-for="(item, index) in playNow.lyric"
          :key="`${playNow.aId}-${item.str}-${index}`"
          :ref="(el) => setLyricRef(index, el)"
          :class="`lyric-item ${index === lyricKey ? 'lyric-item-now' : ''}`"
        >
          <div v-html="item.str || ''" />
          <div v-if="item.trans" v-html="item.trans" />
        </div>
      </div>
    </div>
    <div class="play-line-center" v-show="moveY || baseMoveY">
      <hr />
      <div
        class="p-time-btn"
        @mouseover="changeGrab(true)"
        @mouseleave="changeGrab(false)"
        @click="playAtCenter"
      >
        {{timeToStr(centerTime)}}
        <i class="iconfont icon-play" />
      </div>
    </div>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import { ref, computed, watch } from 'vue';
  import { timeToStr } from "../utils/stringHelper";

  export default {
    name: "Lyric",
    setup() {
      const state = mixInject(['playNow', 'playerStatus']);
      const { playNow, playerStatus } = state;

      const [
        grab,
        clickY,
        moveY,
        lyricContainer,
        top,
        lyricKey,
        baseMoveY,
      ] = [
        ref(false),
        ref(0),
        ref(0),
        ref(),
        ref(0),
        ref(0),
        ref(0),
      ]

      const lyricRefMap = {};

      // 歌词信息
      const lyricInfo = computed(() => ({
        obj: playNow.lyric || {},
        keys: Object.keys(playNow.lyric || {}),
      }))

      let timeout;

      const centerTime = computed(() => {
        if (!lyricContainer.value) {
          return 0;
        }
        let i = lyricInfo.value.keys.findIndex((k) => {
          lyricRefMap[k] = lyricRefMap[k]|| { offsetTop: 0, offsetHeight: 0 };
          const { offsetTop: t, offsetHeight: h } = lyricRefMap[k];
          return (top.value + moveY.value + t + h - lyricContainer.value.clientHeight / 2) > 0
        })
        return lyricInfo.value.keys[i] / 1000;
      })

      // 当前播放到的歌词时间
      watch(() => [playNow.lyric, playerStatus.currentTime], ([lyric, currentTime]) => {
        if (!lyric) {
          return lyricKey.value = 0;
        }
        let i = lyricInfo.value.keys.findIndex((k) => (k - 300) >= currentTime * 1000);
        i = Math.max(0, (i < 0 ? lyricInfo.value.keys.length : i) - 1);
        lyricKey.value = lyricInfo.value.keys[i];
      })

      watch(lyricKey, (k) => {
        const dom = lyricRefMap[k];
        if (dom && !baseMoveY.value && !moveY.value) {
          top.value = lyricContainer.value.clientHeight / 2 - 35 - dom.offsetTop;
        }
      })

      watch(() => playNow.aId, () => {
        Object.keys(lyricRefMap).forEach((k) => delete lyricRefMap[k]);
        lyricContainer.value && (top.value = lyricContainer.value.clientHeight / 2 - 35);
      });

      return {
        ...state,
        grab,
        lyricKey,
        lyricInfo,
        lyricContainer,
        top,
        moveY,
        baseMoveY,
        centerTime,

        // 修改抓取状态
        changeGrab: (val) => {
          grab.value = val;
          if (val) {
            clickY.value = window.event.clientY;
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
          } else {
            clickY.value = 0;
            baseMoveY.value = moveY.value;
            timeout = setTimeout(() => {
              if (timeout) {
                timeout = null;
                baseMoveY.value = 0;
                moveY.value = 0;
              }
            }, 3000)
          }
        },

        timeToStr,
        dragLyric: (e) => grab.value && (moveY.value = e.clientY - clickY.value + baseMoveY.value),
        setLyricRef(index, el) {
          lyricRefMap[index] = el;
        },
        playAtCenter() {
          playerStatus.pDom.currentTime = centerTime.value;
          playerStatus.playing = true;
          top.value += baseMoveY.value + moveY.value;
          baseMoveY.value = 0;
          moveY.value = 0;
          clearTimeout(timeout);
          timeout = null;
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .lyric-content-container {
    height: $mainHeight;
    overflow: hidden;
    position: absolute;
    left: calc(60% - 20px);
    top: 0;
    width: 40%;
    opacity: 1;
    transition: 1s;

    .lyric-list-container {
      cursor: grab;

      &.grabbing {
        cursor: grabbing;

        .lyric-list {
          transition: 0s !important;
        }
      }

      .lyric-list {
        height: calc(100vh - 200px);
        position: absolute;
        width: 100%;
        transition: 0.3s top;
      }
      .lyric-item {
        color: rgba(255,255,255,0.5);
        text-align: center;
        font-size: 16px;
        padding: 5px 0;
        transition: 0.5s;
        min-height: 15px;
        line-height: 30px;

        &.lyric-item-now {
          color: rgba(255,255,255,0.8);
          font-size: 20px;
        }
      }
    }
  }

  .play-line-center {
    position: absolute;
    top: 50%;
    width: 100%;
    height: 0;
    hr {
      border: 1px dashed #fff6;
      position: absolute;
      z-index: -1;
      width: 60%;
      left: 15%;
    }
    .p-time-btn {
      color: #fff6;
      position: absolute;
      right: 10%;
      bottom: -11px;
      cursor: pointer;
      opacity: 0.7;
      transition: 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }
</style>