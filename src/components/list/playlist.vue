<template>
  <div>
    <div
      v-for="aId in list"
      :key="`playlist-${aId}`"
      class="playlist-item"
      @click="changeUrlQuery({ aId, id: allList[aId].id }, '#/playlist/detail')"
    >
      <!--    <div v-if="playingListId == item.listId && isPlaying" class="playing-item-bg">-->
      <!--      <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">-->
      <!--        <div class="bg-item-inside" />-->
      <!--      </div>-->
      <!--    </div>-->
      <template v-if="allList[aId].id === 'daily'">
        <div class="list-img daily-img">{{date}}</div>
      </template>
      <template v-else>
        <img v-if="setting.PERFORMANCE_MODE" v-error :src="`${allList[aId].cover}?param=50y50`" class="list-bg-img"/>
        <img v-error :src="`${allList[aId].cover}?param=200y200`" class="list-img"/>
      </template>
      <span class="list-name" v-html="allList[aId].name" />
      <span v-if="allList[aId].trackCount" class="list-count">{{allList[aId].trackCount}}</span>
      <div class="bottom-text">
        <el-tooltip
          v-if="setting.platform === '163' && user.id && user.favId === aId"
          class="item"
          effect="dark"
          content="心动模式"
          placement="top"
        >
          <i :class="`iconfont icon-heart heart-btn ${playerStatus.heartMode && 'hearting'}`"
             @click="toHeartMode(aId)"/>
        </el-tooltip>
        <el-tooltip
          v-if="user.id && !user.myList[aId] && !noFavList.has(aId)"
          class="item"
          effect="dark"
          :content="user.subList[aId] ? '已收藏' : '收藏'"
          placement="top"
        >
          <i :class="`collect-btn iconfont icon-${user.subList[aId] ? 'collected' : 'collect'}`"
             @click="collectPlaylist(aId)"/>
        </el-tooltip>
        <span v-if="allList[aId].creator && allList[aId].creator.nick" class="list-creator">
          By: <span v-html="allList[aId].creator.nick"/>
          <span v-if="allList[aId].playCount" class="pl_20"><i class="iconfont icon-yinyue"/>: {{numToStr(allList[aId].playCount)}}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import {changeUrlQuery as updateUrl, numToStr} from "../../utils/stringHelper";
  import {mixInject} from "../../utils/store/state";
  import {getMoreRadioList, handleSongs, updatePlaying} from "../../utils/store/action";
  import {computed} from 'vue';
  import request from "../../utils/request";
  import {ElMessage} from 'element-plus';

  export default {
    name: "Playlist",
    props: {
      list: Object,
    },
    setup() {
      const state = mixInject(['allList', 'setting', 'playerStatus', 'user', 'favSongMap'])

      const {favSongMap, setting, playerStatus} = state;
      const user = computed(() => state.user[setting.platform]);

      return {
        ...state,

        user,

        noFavList: new Set(['163', 'qq'].map((p) => ['daily', 'privateRadio'].map((v) => `${p}_${v}`)).flat()),

        changeUrlQuery({id, aId}) {
          const {playerStatus} = state;
          if (id === 'privateRadio') {
            playerStatus.radioId = aId;
            playerStatus.playing = true;
            return getMoreRadioList(true);
          }
          updateUrl(...arguments);
        },

        toHeartMode(aId) {
          window.event.stopPropagation();
          const [platform, pid] = aId.split('_');
          const firstFavId = Object.keys(favSongMap[setting.platform])[0];
          if (!firstFavId) return ElMessage.warning('没有喜欢的歌曲 = =||');
          request({
            api: 'MIX_RADIO_HEART',
            data: {
              pid,
              id: firstFavId.split('_')[1],
            }
          }, platform)
          .then(({ data = []}) => {
            const list = handleSongs(data);
            if (list.length) {
              updatePlaying(list[0], list, true);
              playerStatus.heartMode = true;
              playerStatus.playing = true;
              ElMessage.success('心动模式！');
            } else {
              ElMessage.warning('没有找到心动的歌曲 = =||');
            }
          })
        },

        collectPlaylist(aId) {
          window.event.stopPropagation();
          const [platform, id] = aId.split('_');
          console.log(user, user.value.subList, id, aId);
          const isSub = user.value.subList[aId];
          request({
            api: 'MIX_COLLECT_PLAYLIST',
            data: { id, sub: Number(!isSub) },
          }, platform).then(({ result }) => {
            if (result === 100) {
              user.value.subList[aId] = Number(!isSub);
              ElMessage.success('操作成功');
            } else {
              ElMessage.error('操作失败');
            }
          })
        },

        numToStr,

        date: new Date().getDate(),
      }
    }
  }
</script>

<style scoped lang="scss">

  .playlist-item {
    position: relative;
    height: 60px;
    overflow: hidden;
    padding: 10px;
    opacity: 0.8;
    transition: 0.4s;
    box-shadow: 0 0 0 #0003;

    .bottom-text {
      position: absolute;
      bottom: 0;
      color: #fff3;
      font-weight: bold;
      cursor: pointer;
      font-size: 16px;
      transition: 0.3s;
      left: 90px;

      .collect-btn, .heart-btn {
        margin-right: 15px;

        &.heart-btn {

          &.hearting {
            color: #F56C6C88;
            animation: hearting 1.4s infinite;

            @keyframes hearting {
              from, to, 40%, 50%, 60%, 70% {
                transform: scale(1);
              }
              45%, 65% {
                transform: scale(1.2);
              }
            }
          }
        }
      }
    }

    .list-creator {
      font-size: 14px;
      color: #fff5;
      transition: 0.3s;

      a {
        color: #fff5;
        transition: 0.3s;
      }
    }

    .list-img {
      border-radius: 5px;
      display: inline-block;
      transition: 0.3s;
      position: absolute;
      transform: rotate(0) scale(0.38) translate(-138px, -156px);
      top: 10px;
      left: 10px;
      width: 175px;
      height: 175px;
      font-size: 100px;
      line-height: 200px;
      font-weight: bold;
      color: #fff5;
      text-align: center;

      &.daily-img {
        border: 1px solid #fff6;
      }
    }

    .list-name {
      display: inline-block;
      vertical-align: top;
      font-size: 20px;
      color: #fffc;
      margin-left: 20px;
      transition: 0.3s;
      padding-left: 60px;
      white-space: nowrap;
    }

    .list-count {
      position: absolute;
      right: 10px;
      font-weight: bold;
      font-size: 44px;
      width: 80px;
      text-align: right;
      bottom: 5px;
      color: #fff4;
      transform: rotate(0) translate(0, 20px);
      transform-origin: bottom left;
      transition: 0.3s;
    }

    &:hover {
      opacity: 1;

      .list-name {
        transform: scale(1.1) translate(5px);
      }

      .list-img {
        transform: rotate(-30deg) scale(0.7) translate(-70px, -150px);
        opacity: 0.7;
      }
    }
  }

  .high-performance-mode {
    .playlist-item {
      .list-bg-img {
        position: absolute;
        z-index: 0;
        opacity: 0.2;
        filter: blur(30px);
        width: 170px;
        height: 170px;
        top: -60px;
        transition: 0.3s;
      }

      &:hover {
        box-shadow: 0 4px 20px #0004;

        .bottom-text {
          color: #fffc;

          .hearting {
            color: #F56C6C;
          }
        }

        .list-creator {
          transform: translate(10px);
          color: #fffc;
        }

        .list-count {
          transform: rotate(-90deg) translate(-20px, 150%);
          text-align: center;
        }
      }
    }
  }

</style>