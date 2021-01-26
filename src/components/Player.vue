<template>
  <div class="main-player-container">
    <div class="p-bg" />
    <!-- 播放，上一首、下一首进度 -->
    <div v-if="pDom" class="control-btn">
      <div class="inline-block">
        <i class="icon-shangyishou1 iconfont" @click="cutSong('prev')" />
      </div>
      <div class="inline-block">
        <i
          :class="`iconfont ${playerStatus.playing ? 'icon-zanting1' : 'icon-bofang'}`"
          @click="playerStatus.playing = !playerStatus.playing"
        />
      </div>
      <div class="inline-block">
        <i class="icon-xiayishou1 iconfont" @click="cutSong('next')" />
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info" v-if="pDom">
      <span class="player-song-title pointer" @click="changeUrlQuery({}, '#/')">
        <i class="el-icon-loading mr_10" v-if="playerStatus.loading" />
        {{playNow.name}}
      </span>
      <div class="ar-container">
        <a
          v-for="a in playNow.ar"
          :key="`player-ar-${a.aId}`"
          class="ar-name"
          :href="changeUrlQuery({ id: a.id, mid: a.mid, from: playNow.platform }, '#/singer', false)"
        >
          {{a.name}}
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
      id="m-player"
      ref="pDom"
      class="m-player"
      crossorigin="anonymous"
      :src="transUrl(playNow.pUrl)"
      controls
      @canplaythrough="canPlayThrough"
      @timeupdate="({ target }) => playerStatus.currentTime = target.currentTime"
      @ended="cutSong('next')"
    />

    <div class="control-btn opt-btn" v-if="playNow.url">
      <!--下载-->
      <el-tooltip class="item" effect="dark" content="下载" placement="top">
        <div class="inline-block ml_5 pd_5">
            <span @click="download(playNow.aId)">
              <i class="iconfont icon-download ft_16 pointer" />
            </span>
        </div>
      </el-tooltip>
    </div>

    <!-- 音量、播放顺序、列表等控制 -->
<!--    <div class="other-control inline-block">-->
<!--      &lt;!&ndash; 音量控制 &ndash;&gt;-->
<!--      <div class="volume-control"  @mouseleave="showVolume = false">-->
<!--        <div v-if="showVolume" class="volume-slider-container" @mouseleave="showVolume = false" @mouseover="showVolume = true">-->
<!--          <div class="volume-slider" >-->
<!--            <el-slider-->
<!--              v-model="volume"-->
<!--              @input="changeVolume"-->
<!--              :vertical="true"-->
<!--              height="80px"-->
<!--              :max="100"/>-->
<!--          </div>-->
<!--        </div>-->
<!--        <i class="iconfont icon-volume" @mouseover="showVolume = true" />-->
<!--      </div>-->
<!--      &lt;!&ndash; 播放顺序 &ndash;&gt;-->
<!--      <div class="order-control"  @mouseleave="showOrder = false">-->
<!--        <div v-if="showOrder" class="order-list-container" @mouseleave="showOrder = false" @mouseover="showOrder = true">-->
<!--          <div class="order-list">-->
<!--            <div v-for="key in orderList" v-if="orderType !== key" :key="`order-${key}`" @click="changeOrderType(key)">-->
<!--              <i :class="`iconfont icon-${key}`" />-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="now-order-type" @mouseover="showOrder = true" >-->
<!--          <i :class="`iconfont icon-${orderType}`" />-->
<!--        </div>-->
<!--      </div>-->

<!--      &lt;!&ndash; 添加到歌单 &ndash;&gt;-->
<!--      <el-tooltip class="item" effect="dark" content="添加到歌单" placement="top">-->
<!--        <div class="inline-block ml_5 pd_5" v-if="playNow.platform !== 'migu'">-->
<!--            <span @click="playlistTracks(playNow.aId, 'add', 'ADD_SONG_2_LIST')">-->
<!--              <i class="iconfont icon-add ft_16 pointer" />-->
<!--            </span>-->
<!--        </div>-->
<!--      </el-tooltip>-->

<!--      <input id="cp-share-input" :value="changeUrlQuery({ shareId: playNow.id, from: playNow.platform, shareCid: playNow.cid }, 'http://music.jsososo.com/#/', false)">-->

<!--      <el-tooltip class="item" effect="dark" content="正在播放" placement="top">-->
<!--        <div @click="goTo('#/playlist/detail?id=playing')" class="inline-block ml_5 pd_5">-->
<!--            <span>-->
<!--              <i class="iconfont icon-list ft_16 pointer" />-->
<!--            </span>-->
<!--        </div>-->
<!--      </el-tooltip>-->

<!--      &lt;!&ndash; 更多 &ndash;&gt;-->
<!--      <div class="more-control"  @mouseleave="showMore = false">-->
<!--        <div v-if="showMore" class="more-list-container" @mouseleave="showMore = false" @mouseover="showMore = true">-->
<!--          <div class="more-list">-->
<!--            <div v-for="more in moreList" @click="handleClickMore(more.key)" :key="`more-key-${more.key}`">-->
<!--              <i :class="`iconfont icon-${more.key}`" />-->
<!--              <span style="padding-left: 5px;">{{more.text}}</span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="ml_10" @mouseover="showMore = true" >-->
<!--          <i class="iconfont icon-more" />-->
<!--        </div>-->
<!--        <div class="rate-slider" v-if="showRateSlider" @mouseleave="showRateSlider = false">-->
<!--          <el-slider-->
<!--            @input="(v) => playerDom.playbackRate = v"-->
<!--            v-model="rate"-->
<!--            :max="3"-->
<!--            :min="0.3"-->
<!--            :step="0.1"-->
<!--          />-->
<!--        </div>-->
<!--      </div>-->
<!--      -->
<!--    </div>-->
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import {cutSong, mixSongHandle} from "../utils/store/action";
  import { changeUrlQuery, transUrl, timeToStr } from '../utils/stringHelper';
  import { ref } from 'vue';

  export default {
    name: "Player",
    setup() {
      const state = mixInject([
        'playNow',
        'setting',
        'playerStatus',
        'allSongs',
        'user',
        'playerList',
      ])

      const pDom = ref();

      state.playerStatus.pDom = pDom;

      return {
        ...state,

        pDom,

        // 加载完成
        canPlayThrough: ({ target }) => {
          state.playerStatus.loading = false;
          state.playerStatus.duration = target.duration;
          state.playerStatus.playing && pDom.value.play();
        },

        ...mixSongHandle,

        cutSong,

        changeUrlQuery,

        transUrl,

        timeToStr,

      }
    },
  }
</script>

<style lang="scss">
  @import "../assets/style/value";

  .main-player-container {
    position: absolute;
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

    .el-slider__button-wrapper {
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
          height: 18px;

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

  }
</style>