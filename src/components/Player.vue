<template>
  <div class="main-player-container">
    <div class="p-bg"/>
    <!-- 播放，上一首、下一首进度 -->
    <div v-if="pDom" class="control-btn">
      <div class="inline-block">
        <i class="icon-shangyishou1 iconfont" @click="cutSong('prev')"/>
      </div>
      <div class="inline-block">
        <i
          :class="`iconfont ${playerStatus.playing ? 'icon-zanting1' : 'icon-bofang'}`"
          @click="playerStatus.playing = !playerStatus.playing"
        />
      </div>
      <div class="inline-block">
        <i class="icon-xiayishou1 iconfont" @click="cutSong('next')"/>
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info" v-if="pDom">
      <a class="player-song-title pointer" href="#/">
        <i class="el-icon-loading mr_10" v-if="playerStatus.loading"/>
        {{playNow.name}}
      </a>
      <div class="ar-container">
        <a
          v-for="(a, i) in playNow.ar"
          :key="`player-ar-${a.aId}`"
          class="ar-name"
          :href="changeUrlQuery({ id: a.id, mid: a.mid, platform: playNow.platform }, '#/singer', false)"
        >
          {{a.name}}
          <span v-if="i < playNow.ar.length - 1">/</span>
        </a>
      </div>
      <!--        <span-->
      <!--          v-if="favSongMap[playNow.platform]"-->
      <!--          @click="likeMusic(playNow.aId)"-->
      <!--          style="margin-left: 25px; cursor: pointer;"-->
      <!--          :class="(favSongMap[playNow.platform][playNow.aId]) ? 'iconfont icon-like iconfont' : 'iconfont icon-unlike'">-->
      <!--          </span>-->
    </div>

    <!--  播放时间  -->
    <div class="play-time">
      <div class="current-time">{{timeToStr(playerStatus.currentTime)}}</div>
      <div>{{timeToStr(playerStatus.duration)}}</div>
    </div>

    <el-slider
      class="m-progress"
      @change="(v) => pDom.currentTime = v"
      :format-tooltip="timeToStr"
      v-model="playerStatus.currentTime"
      :max="playerStatus.duration || 1"
    />

    <audio
      v-if="playNow.pUrl"
      id="m-player"
      ref="pDom"
      class="m-player"
      crossorigin="anonymous"
      :src="transUrl(playNow.pUrl)"
      controls
      @canplaythrough="canPlayThrough"
      @timeupdate="({ target }) => playerStatus.currentTime = target.currentTime"
      @ended="playEnd"
      @error="playerError"
    />

    <div class="control-btn opt-btn" v-if="playNow.url">
      <span v-if="user[playNow.platform] && user[playNow.platform].logined" class="ml_15 inline-block pd_5" @click="likeMusic(playNow.aId)">
        <i :class="`iconfont icon-${favSongMap[playNow.platform][playNow.aId] ? 'like' : 'unlike'} ft_16 pointer`" />
      </span>

      <handle-song :a-id="playNow.aId" className="pd_5" />

      <!-- 音量控制 -->
      <div class="volume-control" @mouseleave="showVolume = false">
        <div v-if="showVolume" class="volume-slider-container" @mouseleave="showVolume = false"
             @mouseover="showVolume = true">
          <div class="volume-slider">
            <el-slider
              v-model="setting.volume"
              :vertical="true"
              height="80px"
              :max="100"/>
          </div>
        </div>
        <i class="iconfont icon-volume pd_5 ft_18" @mouseover="showVolume = true"/>
      </div>
      <!-- 播放顺序 -->
      <div class="order-control" @mouseleave="showOrder = false">
        <div
          v-if="showOrder"
          class="order-list-container"
          @mouseleave="showOrder = false"
          @mouseover="showOrder = true"
        >
          <div class="order-list">
            <div
              v-for="key in orderList"
              :key="`order-${key}`"
              @click="setting.orderType = key"
            >
              <i :class="`ft_18 iconfont icon-${key}`" />
            </div>
          </div>
        </div>
        <div class="now-order-type" @mouseover="showOrder = true">
          <i :class="`ft_18 iconfont icon-${setting.orderType}`" />
        </div>
      </div>
      <!--下载-->
      <el-tooltip class="item" effect="dark" content="下载" placement="top">
        <div class="inline-block pd_5">
          <span @click="download(playNow.aId)">
            <i class="iconfont icon-download ft_16 pointer" />
          </span>
        </div>
      </el-tooltip>
    </div>

    <div class="control-btn opt-btn right-control">
      <el-tooltip class="item" effect="dark" content="播放历史" placement="top">
        <div @click="changeUrlQuery({}, '#/history')" class="inline-block ml_5 pd_5">
          <span>
            <i class="iconfont icon-history ft_16 pointer" />
          </span>
        </div>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="正在播放" placement="top">
        <div @click="changeUrlQuery({ aId: 'playing' }, '#/playlist/detail')" class="inline-block ml_5 pd_5">
          <span>
            <i class="iconfont icon-list ft_16 pointer" />
          </span>
        </div>
      </el-tooltip>
    </div>

    <!-- 音量、播放顺序、列表等控制 -->
<!--        <div class="other-control inline-block">-->

<!--          <input id="cp-share-input" :value="changeUrlQuery({ shareId: playNow.id, from: playNow.platform, shareCid: playNow.cid }, 'http://music.jsososo.com/#/', false)">-->

<!--          &lt;!&ndash; 更多 &ndash;&gt;-->
<!--          <div class="more-control"  @mouseleave="showMore = false">-->
<!--            <div v-if="showMore" class="more-list-container" @mouseleave="showMore = false" @mouseover="showMore = true">-->
<!--              <div class="more-list">-->
<!--                <div v-for="more in moreList" @click="handleClickMore(more.key)" :key="`more-key-${more.key}`">-->
<!--                  <i :class="`iconfont icon-${more.key}`" />-->
<!--                  <span style="padding-left: 5px;">{{more.text}}</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="ml_10" @mouseover="showMore = true" >-->
<!--              <i class="iconfont icon-more" />-->
<!--            </div>-->
<!--            <div class="rate-slider" v-if="showRateSlider" @mouseleave="showRateSlider = false">-->
<!--              <el-slider-->
<!--                @input="(v) => playerDom.playbackRate = v"-->
<!--                v-model="rate"-->
<!--                :max="3"-->
<!--                :min="0.3"-->
<!--                :step="0.1"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->
<!--          -->
<!--        </div>-->
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import {cutSong, mixSongHandle, likeMusic, getSingleUrl} from "../utils/store/action";
  import {changeUrlQuery, transUrl, timeToStr} from '../utils/stringHelper';
  import {ref, computed} from 'vue';
  import HandleSong from "./HandleSong";
  import { ipcRenderer } from 'electron';
  import DrawMusic from "../utils/drawMusic";

  export default {
    name: "Player",
    components: { HandleSong },
    setup() {
      const state = mixInject([
        'playNow',
        'setting',
        'playerStatus',
        'allSongs',
        'user',
        'playerList',
        'favSongMap',
      ])

      const pDom = ref();

      const { playerStatus, playNow } = state;
      playerStatus.pDom = pDom;

      let errorId = '';

      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => playerStatus.playing = true);
        navigator.mediaSession.setActionHandler('pause', () => playerStatus.playing = false);
        navigator.mediaSession.setActionHandler('previoustrack', () => cutSong('prev'));
        navigator.mediaSession.setActionHandler('nexttrack', () => cutSong('next'));
      }

      ipcRenderer.on('PLAY_MUSIC', () => playerStatus.playing = !playerStatus.playing);
      ipcRenderer.on('PLAY_PREV', () => cutSong('prev'));
      ipcRenderer.on('PLAY_NEXT', () => cutSong('next'));
      ipcRenderer.on('LIKE_MUSIC', () => likeMusic(playNow.aId));

      return {
        ...state,

        showVolume: ref(false),
        showOrder: ref(false),
        orderList: computed(() => ['suiji', 'liebiao', 'danquxunhuan'].filter((k) => k !== state.setting.orderType)),

        pDom,

        // 加载完成
        canPlayThrough: ({target}) => {

          if (!window.drawMusic && (window.AudioContext || window.webkitAudioContext)) {
            window.drawMusic = new DrawMusic();
            const draw = () => {
              window.drawMusic && window.drawMusic.draw();
              window.requestAnimationFrame(draw);
            }
            window.requestAnimationFrame(draw);
          }

          errorId = '';
          state.playerStatus.loading = false;
          state.playerStatus.duration = target.duration;
          state.playerStatus.playing && pDom.value.play();
        },

        playEnd() {
          const { setting,  } = state;
          setting.orderType === 'danquxunhuan' ?
            (pDom  && pDom.value.play()):
            cutSong('next');
        },

        ...mixSongHandle,

        async playerError() {
          if (errorId && errorId === state.playNow.aId) {
            cutSong('next');
          } else if (state.playNow.aId) {
            const { url } = await getSingleUrl(state.playNow.aId);
            state.playNow.pUrl = url;
          }
        },

        cutSong,

        changeUrlQuery,

        transUrl,

        timeToStr,

        likeMusic,

      }
    },
    mounted() {

    }
  }
</script>

<style lang="scss">
  @import "../assets/style/value";

  .main-player-container {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 65px;
    min-width: $minWidth;
    padding-top: 15px;

    .p-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      background: #fff5;
      filter: brightness(20%) blur(100px);
    }

    .control-btn {
      padding-left: 20px;
      display: inline-block;
      vertical-align: top;

      &.opt-btn {
        padding-top: 8px;
        padding-left: 0;

        .iconfont {
          line-height: 30px;
        }
      }

      &.right-control {
        float: right;
        margin-right: 80px;
      }

      .iconfont {
        font-size: 30px;
        line-height: 50px;
        margin: 0 5px;

        &.icon-zanting1 {
          font-size: 34px;
        }

        &.icon-bofang {
          margin: 0 7px;
        }
      }
    }

    .song-info {
      display: inline-block;
      vertical-align: top;
      padding-left: 20px;
      max-width: 25%;
      min-width: 15%;

      .player-song-title {
        font-size: 20px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        display: inline-block;
      }

      .ar-container {
        margin-top: -5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .ar-name {
          color: #fff7;
        }
      }
    }

    .play-time {
      position: absolute;
      right: 20px;
      top: 15px;
      width: 50px;
      text-align: center;
      line-height: 20px;
      padding-top: 5px;
      font-size: 14px;
      color: #fff9;

      .current-time {
        border-bottom: 1px solid #fff5;
      }
    }

    .m-progress .el-slider__button-wrapper {
      opacity: 0;
    }

    .m-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      margin: 0;
      height: 8px;
      overflow: hidden;
      transition: 0.3s;

      &:hover {
        height: 26px;
        transform: translateY(-40%);

        .el-slider__runway {
          height: 20px;

          .el-slider__bar:after {
            width: 5px;
          }
        }
      }

      .el-slider__runway {
        margin: 0 !important;
        height: 2px;
        background: linear-gradient(to right, #fff3, #fff5, #fff3) !important;
        box-sizing: content-box;
        transition: 0.3s;

        .el-slider__button-wrapper {
          opacity: 0;
        }

        .el-slider__bar {
          height: 100%;
          transition: 0.3s;
          background: linear-gradient(to left, #{$blue}66, #{$green}66 500px, #{$yellow}66 1000px, #{$red}66 1500px);

          &:after {
            content: '';
            display: inline-block;
            background: $blue;
            opacity: 0.6;
            width: 2px;
            height: 100%;
            position: absolute;
            transform: translateX(50%);
            transition: 0.3s;
            right: 0;
            top: 0;
            box-shadow: 0 0 5px #{$blue};
          }
        }
      }
    }

    #m-player {
      opacity: 0;
      position: fixed;
      bottom: -1000px;
    }

    .volume-control {
      display: inline-block;
      position: relative;

      .volume-slider-container {
        position: absolute;
        padding-bottom: 40px;
        top: -110px;
        opacity: 1;
        transition: opacity 0.4s, top 0.4s;
        z-index: 10;
      }

      .volume-slider {
        background: rgba(255, 255, 255, 0.4);
        border: #eaeaea 1px solid;
        padding: 15px 0;
        border-radius: 10px;
      }
    }

    .order-control {
      display: inline-block;
      position: relative;

      .now-order-type {
        margin-top: -5px;
      }

      .order-list-container {
        padding-bottom: 40px;
        position: absolute;
        top: -91px;
        left: -6px;
        z-index: 10;
      }

      .order-list {
        position: relative;
        padding: 4px 0;
        border-radius: 10px;
        border: 1px solid #eaeaea;
        opacity: 1;
        transition: 0.4s opacity;
        background: rgba(255,255,255,0.4);

        div {
          padding: 3px 5px;
          cursor: pointer;
          &:hover {
            background: rgba(255,255,255,0.3);
          }
        }
      }
    }

  }
</style>