<template>
  <div :class="`list-songs ${className || ''}`">
    <div v-if="allSongs">
      <div
        v-for="(s, i) in songs"
        :key="s"
        :class="`song-item ${!allSongs[s].url ? 'disabled' : 'hasUrl'}`"
        @click="playMusic({ id: s, arr: songs })"
      >
        <div v-if="showIndex" class="song-order">{{i+1}}</div>
        <div v-if="(favSongMap[allSongs[s].platform] && favSongMap[allSongs[s].platform][s])" class="liked-item" />
        <div v-if="playNow.aId === s" class="playing-bg" :style="`width: ${playerStatus.percentage * 100}%`">
          <div class="wave-bg" />
          <div class="wave-bg2" />
        </div>
        <div
          v-if="countMap && countMap[s]"
          class="count-bg"
          :style="`width: ${countMap[s].score}%`"
        />
        <div
          v-if="showCover"
          v-error
          class="song-album-img"
          :style="`background-image: url('${allSongs[s].al && `${allSongs[s].al.picUrl}?param=50y50`}')`"
        />
        <div class="song-name">
          {{allSongs[s].name}}

<!--          <a-->
<!--            :href="changeUrlQuery({ id: allSongs[s].mvId, from: allSongs[s].platform }, '#/mv', false)"-->
<!--            class="inline-block ml_5 iconfont icon-mv"-->
<!--            style="font-size: 14px;font-weight: 100"-->
<!--            v-if="showCover && allSongs[s].mvId"-->
<!--          />-->
        </div>
        <div>
          <div class="song-ar">
            <a
              v-if="!showCover && allSongs[s].mvId"
              :href="changeUrlQuery({ id: allSongs[s].mvId, from: allSongs[s].platform }, '#/mv', false)"
              class="inline-block mr_5 iconfont icon-mv"
            />
            {{allSongs[s].ar.map((a) => a.name).join('/')}}
          </div>
          <div class="song-operation">
            <i
              :class="`operation-icon operation-icon-1 iconfont icon-${(favSongMap[allSongs[s].platform][s]) ? 'like' : 'unlike'}`"
              @click="likeMusic(s)"
            />
            <handle-song :a-id="s" class-name="operation operation-icon-2" />
            <i
              v-if="!!allSongs[s].url && playingList[s]"
              class="operation-icon operation-icon-3 iconfont icon-list-reomve"
              @click="removeFromPlayinig([s])"
            />
            <i
              v-if="!!allSongs[s].url && !playingList[s]"
              class="operation-icon operation-icon-3 iconfont icon-list-add"
              @click="addToPlaying([s])"
            />
            <i
              v-if="!!allSongs[s].url"
              class="operation-icon operation-icon-4 iconfont icon-download"
              @click="download(s)"
            />
            <span v-if="countMap && countMap[s]" class="played-count-num">{{countMap[s].count}}</span>
          </div>
        </div>
      </div>
      <div v-if="(songs || []).length === 0" class="text-center mt_40">{{emptyText || '没啥歌曲哟'}}</div>
    </div>
    <div v-if="(songs || []).length && songs.find((s) => allSongs[s].url)" class="fix-play-btn" @click="playList">
      <i class="iconfont icon-play"/>
      <span class="btn-txt">播放列表</span>
    </div>
  </div>
</template>

<script>
  import {mixInject} from "../../utils/store/state";
  import {mixSongHandle, updatePlaying} from "../../utils/store/action";
  import HandleSong from "../HandleSong";
  import { changeUrlQuery } from "../../utils/stringHelper";

  export default {
    name: "Song",
    components: {HandleSong},
    props: {
      songs: Array,
      className: String,
      emptyText: String,
      countMap: Object,
      showIndex: Boolean,
      showCover: Boolean,
    },
    setup(props) {
      const state = mixInject(['allSongs', 'playNow', 'favSongMap', 'playingList', 'playerStatus', 'favSongMap']);
      return {
        ...state,

        playList() {
         const { songs } = props;
          const { allSongs, playerStatus } = state;
          const aId = songs.find((s) => allSongs[s].url);
          updatePlaying(aId, songs);
          playerStatus.playing = true;
        },

        playMusic({ id }) {
          const { allSongs, playerStatus } = state;
          allSongs[id].url && (state.playNow.aId = id);
          playerStatus.playing = true;
        },

        changeUrlQuery,

        ...mixSongHandle,
      };
    },
  }
</script>

<style lang="scss">
  .list-songs {
    color: #fff9;

    .song-item {
      height: 55px;
      position: relative;
      /*border-bottom: 1px solid #fff3;*/
      overflow: hidden;
      transition: 0.3s;
      box-sizing: border-box;

      .song-order {
        position: absolute;
        top: 20px;
        left: 6px;
        font-size: 40px;
        font-weight: bold;
        color: #fff3;
        transition: 0.3s;
        transform: translate(0, 0);
      }

      &.disabled {
        opacity: 0.3;

        &:hover {
          .song-name {
            font-size: 16px;
            font-weight: normal;
          }
        }
      }

      .count-bg {
        height: 100%;
        position: absolute;
        background: #67C23A33;
        left: 0;
        top: 0;
        z-index: 0;
      }

      .liked-item {
        position: absolute;
        height: 100%;
        width: 1px;
        left: 0;
        top: 0;
        box-shadow: 0 0 10px 4px #F56C6C;
      }

      &:hover {
        background: #0003;

        .song-order {
          transform: translate(0, -6px);
        }

        .song-ar {
          opacity: 0.3;
        }

        .operation-icon {
          font-size: 16px;
        }
      }

      div {
        box-sizing: border-box;
      }

      .song-name {
        display: inline-block;
        width: 60%;
        vertical-align: top;
        position: absolute;
        top: 10px;
        left: 40px;
        transition: 0.3s;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: bold;
      }

      .song-ar {
        vertical-align: top;
        display: inline-block;
        width: 30%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        position: absolute;
        bottom: 5px;
        opacity: 0.6;
        left: 40px;
        font-size: 12px;
        transition: 0.3s;
      }
    }

    @for $i from 1 to 5 {
      .operation-icon-#{$i} {
        position: absolute;
        bottom: 20px;
        left: calc(60% + #{$i * 30}px);
        cursor: pointer;
        font-size: 14px !important;
        transition: 0.3s;
      }
    }

    .played-count-num {
      position: absolute;
      bottom: 15px;
      font-weight: bold;
      right: 10px;
      color: #fff8;
    }

    .fix-play-btn {
      position: fixed;
      bottom: 120px;
      right: 40px;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: #F23C3C;
      border: 2px solid #F23C3C;
      opacity: 0.3;
      cursor: pointer;
      box-shadow: 0 0 20px #333;
      transition: 0.3s;
      overflow: hidden;
      z-index: 10;
      text-align: center;
      white-space: nowrap;

      .iconfont {
        font-size: 20px;
        color: #fff;
        line-height: 40px;
        padding-left: 10px;
        transition: 0.3s;
      }

      .btn-txt {
        width: 0;
        overflow: hidden;
        font-size: 14px;
        vertical-align: top;
        padding-left: 10px;
        opacity: 0;
      }

      &:hover {
        opacity: 0.7;
        width: 130px;
        font-size: 14px;
        line-height: 40px;

        .iconfont {
          padding-left: 0;
        }

        .btn-txt {
          width: 100px;
          opacity: 1;
        }
      }

    }
  }
</style>