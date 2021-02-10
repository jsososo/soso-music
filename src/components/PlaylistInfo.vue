<template>
  <page-right-container className="list-detail-container">
    <div class="scroll-content" ref="containerDom" @scroll="getShowIndex">
      <div v-if="!listInfo && loading && list.length === 0" class="text-center fc_fff ft_20"
           style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">拼命查找了！
      </div>
      <div v-if="!loading" class="list-info-detail">
        <div v-if="listInfo.name">
          <img class="list-info-cover" :src="listInfo.cover">
          <div class="list-info-txt">
            <div class="list-info-name">{{listInfo.name}}</div>
            <div class="list-info-creator">
              <!--            <el-tooltip-->
              <!--              v-if="user[platform].listMap && !user[platform].listMap[listId]"-->
              <!--              class="item"-->
              <!--              effect="dark"-->
              <!--              :content="user[platform].subMap[listId] ? '已收藏' : '收藏'"-->
              <!--              placement="top"-->
              <!--            >-->
              <!--              <i @click="collectPlaylist(listInfo)" :class="`collect-btn mr_10 iconfont icon-${user[platform].subMap[listId] ? 'collected' : 'collect'}`" />-->
              <!--            </el-tooltip>-->
              <span v-if="listInfo.creator">By <span class="creator-name">{{listInfo.creator.nick}}</span></span>
            </div>
            <div class="list-desc" v-html="listInfo.desc"/>
          </div>
        </div>
        <div class="search-container" ref="searchDom">
          <div :class="`search-content ${searchFix && 'fixed'}`">
            <input v-model="search" class="search-input" type="text" placeholder="找呀找呀找歌曲">
            <div class="inline-block pt_5">下列歌曲：</div>
            <el-tooltip class="item" effect="dark" content="播放" placement="top">
              <div @click="playListShow(true)" class="inline-block pt_5 pointer play" style="line-height: 20px;">
                <i class="iconfont icon-play pl_10 pr_10"/>
              </div>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="添加到播放列表" placement="top">
              <div @click="playListShow()" class="inline-block pt_5 pointer play" style="line-height: 20px;">
                <i class="iconfont icon-list-add pl_10 pr_10"/>
              </div>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="下载" placement="top">
              <div @click="downShow" class="inline-block pt_5 pointer play" style="line-height: 20px;">
                <i class="iconfont icon-download pl_10 pr_10"/>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="song-list" ref="listDom" v-if="list.list && list.list.length">
        <div :style="`height:${smallIndex*71}px;`"></div>
        <div
          v-for="(s, i) in list.list"
          :key="`${s}-${i}`"
          :class="`song-item ${playNow.aId === s ? 'played' : ''} ${!allSongs[s].url ? 'disabled' : ''}`"
          @click="playMusic({ aId: s, list: listInfo.list, listId })"
        >
          <div class="playing-bg" v-if="playNow.aId === s" :style="`width: ${playerStatus.percentage * 100}%`">
            <div class="wave-bg"></div>
            <div class="wave-bg2"></div>
          </div>
          <span class="song-order">{{smallIndex+i+1}}</span>
          <img class="song-cover" :src="`${allSongs[s].al && allSongs[s].al.picUrl}?param=50y50`" alt=""/>
          <span class="song-name">{{allSongs[s].name}}</span>
          <!--        <el-tooltip class="item" effect="dark" content="mv" placement="top" v-if="allSongs[s].mvId">-->
          <!--          <a :href="changeUrlQuery({ id: allSongs[s].mvId, from: allSongs[s].platform }, '#/mv', false)" class="song-mv iconfont icon-mv"></a>-->
          <!--        </el-tooltip>-->
          <span class="song-artist">{{(allSongs[s].ar || []).map((a) => a.name).join('/')}}</span>
          <div class="icon-container">
            <!--            <el-tooltip class="item" effect="dark" content="喜欢" placement="top">-->
            <!--              <i-->
            <!--                :class="`operation-icon operation-icon-1 iconfont icon-${true ? 'like' : 'unlike'}`"-->
            <!--              />-->
            <!--            </el-tooltip>-->
            <!--            <el-tooltip v-if="allSongs[s].from !== 'migu'"-->
            <!--                        class="item" effect="dark" content="添加到歌单" placement="top">-->
            <!--              <i-->
            <!--                @click="playlistTracks(s, listId, 'add', 'ADD_SONG_2_LIST', allSongs[s].platform)"-->
            <!--                class="operation-icon operation-icon-2 iconfont icon-add"-->
            <!--              />-->
            <!--            </el-tooltip>-->
            <el-tooltip v-if="playingList.map[s]" class="item" effect="dark" content="移出播放列表" placement="top">
              <i
                @click="removeFromPlayinig([s])"
                class="operation-icon operation-icon-3 iconfont icon-list-reomve"
              />
            </el-tooltip>
            <el-tooltip v-if="allSongs[s].url && !playingList.map[s]" class="item" effect="dark" content="加入播放列表" placement="top">
              <i
                @click="addToPlaying([s])"
                class="operation-icon operation-icon-3 iconfont icon-list-add"
              />
            </el-tooltip>
            <el-tooltip v-if="!!allSongs[s].url" class="item" effect="dark" content="下载" placement="top">
              <i
                @click="download(s)"
                class="operation-icon operation-icon-4 iconfont icon-download"
              />
            </el-tooltip>
            <!--          <el-tooltip class="item" effect="dark" content="从歌单中删除" placement="top">-->
            <!--            <i-->
            <!--              @click="playlistTracks(s, aId, 'del', 'DEL_SONG')"-->
            <!--              v-if="isMineList"-->
            <!--              class="operation-icon operation-icon-5 iconfont icon-delete"-->
            <!--            />-->
            <!--          </el-tooltip>-->
          </div>
        </div>
        <div :style="`min-height:0;height:${list.hideBigHeight}px;`"></div>
        <!--      <div class="focus-btn" v-if="list.indexOf(playNow.aId) > -1" @click="scrollToPlayNow">-->
        <!--        <i class="iconfont icon-focus" />-->
        <!--      </div>-->
        <!--      <div class="clear-btn" v-if="id === 'playing' && playNow && list.length > 1" @click="clearPlaying">-->
        <!--        <i class="iconfont icon-delete" />-->
        <!--      </div>-->
      </div>
    </div>
  </page-right-container>
</template>

<script>
  import {changeUrlQuery} from "../utils/stringHelper";
  import {mixInject} from "../utils/store/state";
  import {ref, computed, watch, nextTick} from 'vue';
  import {mixSongHandle, updatePlaying, updatePlayingList, download} from "../utils/store/action";
  import {ElMessage, ElMessageBox} from 'element-plus';
  import PageRightContainer from "./PageRightContainer";

  export default {
    name: "PlayListInfo",
    props: {
      id: String,
      listId: String,
      platform: String,
      loading: Boolean,
      listInfo: Object,
    },
    components: {
      PageRightContainer,
    },
    setup(props) {
      const state = mixInject([
        'allList',
        'playerStatus',
        'allSongs',
        'playNow',
        'playingList',
        'playerStatus',
        'user',
      ]);
      const [
        search,
        smallIndex,
        bigIndex,
        showScrollTo,
        containerDom,
        searchDom,
        listDom,
        hideBigHeight, // 隐藏的底下的高度
        // listNum,
        searchFix,
      ] = [
        ref(''),
        ref(0),
        ref(100),
        ref(false),
        ref(),
        ref(),
        ref(),
        ref(0),
        ref(0),
        ref(false),
      ];

      const list = computed(() => {
        const {list: trueList = []} = props.listInfo;
        const {allSongs} = state;
        const rex = search.value.replace(/\/|\s|\t|,|，|-|/g, '').toLowerCase();

        let filterList = trueList;

        rex && (filterList = trueList.filter((s) => (
          `${allSongs[s].name}
          ${(allSongs[s].ar || []).map((a) => a.name)}
          ${allSongs[s].al.name}
          ${allSongs[s].name}
          ${allSongs[s].al.name}
          ${(allSongs[s].ar || []).map((a) => a.name)}
          ${allSongs[s].name}`
            .replace(/\s/g, '')
            .toLowerCase()
            .indexOf(rex) > -1
        )));
        // hideBigHeight.value = (filterList.length - bigIndex.value) * 71;
        // listNum.value = filterList.length;
        return {
          hideBigHeight: (filterList.length - bigIndex.value) * 71,
          listNum: filterList.length,
          list: filterList.filter((id, i) => state.allSongs[id] && i >= smallIndex.value && i <= bigIndex.value),
        }
      })

      const getShowIndex = () => {
        const dom = containerDom.value;
        if (!dom) {
          return nextTick(getShowIndex)
        }
        const smallHeight = Math.max(dom.scrollTop - 500, 0);
        smallIndex.value = Math.floor(smallHeight / 71);
        const bigHeight = dom.clientHeight + dom.scrollTop + 300;
        bigIndex.value = Math.min(Math.floor(bigHeight / 71), list.value.listNum);
        searchFix.value = (containerDom.value && searchDom.value) && (containerDom.value.scrollTop > searchDom.value.offsetTop)
      }

      watch(list.listNum, getShowIndex);

      return {
        ...state,
        search,
        list,
        smallIndex,
        bigIndex,
        showScrollTo,
        containerDom,
        searchDom,
        listDom,
        hideBigHeight,
        searchFix,

        changeUrlQuery,

        getShowIndex,

        // 播放展示的歌曲
        playListShow(force) {
          const {allSongs, playerStatus, playNow} = state;
          const aId = list.value.find((s) => allSongs[s].url);
          if (!aId) {
            return ElMessage.error('无可播放歌曲');
          }
          updatePlayingList(list.value, force);
          force ?
            (playNow.aId = aId) :
            ElMessage.success('已添加至播放列表');
          playerStatus.playing = true;
        },

        downShow() {
          const {allSongs} = state;
          const ids = list.value.filter((s) => allSongs[s].url);
          if (!ids.length) {
            return ElMessage.info('没有歌呢');
          }
          ElMessageBox.confirm(`批量下载${ids.length}首歌曲？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            ids.forEach((id) => download(id));
          });
        },

        // 清空正在播放列表
        clearPlaying() {
          updatePlayingList([state.playNow.aId], true);
        },

        scrollToPlayNow() {
          const {aId} = state.playNow;
          const index = list.value.findIndex((v) => v === aId);
          (index > -1) && containerDom.value.scrollTo(0, index * 71 + listDom.value.offsetTop);
        },

        playMusic({aId, list}) {
          updatePlaying(aId, list);
          state.playerStatus.playing = true;
        },

        ...mixSongHandle,
      }
    },
    methods: {

      // downShow() {
      //   const { allSongs, list } = this;
      //   const songList = list.filter((id) => !!allSongs[id].url);
      //   if (!songList.length) {
      //     return this.$message.info('没有歌呢');
      //   }
      //
      //   this.$confirm(`批量下载${songList.length}首歌曲？`, '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     this.$message.info('为了防止服务器误封高频ip，批量下载一秒增加一个任务');
      //     songList.forEach((id, i) => {
      //       setTimeout(() => download(id), i * 1000);
      //     })
      //   });
      //
      // },

      // likeMusic,
      // playlistTracks(tracks, pid, op, type, platform) {
      //   window.event.stopPropagation();
      //   this.$store.dispatch('setOperation', {data: {tracks, pid, op}, type, platform});
      // },
      // download,
      // collectPlaylist,

      // ...handlePlayingList,
    }
  }
</script>

<style lang="scss" scoped>
  @import "../assets/style/value";

  .list-detail-container {

    .scroll-content {
      width: 100%;
      overflow-y: auto;
      height: 100%;

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: rgba(0, 0, 0, 0);
      }

      /*定义滚动条轨道
         内阴影+圆角*/
      &::-webkit-scrollbar-track {
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0);
      }

      /*定义滑块
       内阴影+圆角*/
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.5);
      }
    }

    .list-info-detail {
      padding: 15px 5px 0 15px;
      color: #fff9;
      background: #0003;
      box-shadow: 0 2px 10px #0005;
      margin-bottom: 10px;

      .list-info-cover {
        border-radius: 10px;
        opacity: 0.6;
        display: inline-block;
        vertical-align: top;
        width: 100px;
        height: 100px;
      }

      .list-info-txt {
        display: inline-block;
        width: calc(100% - 125px);
        vertical-align: top;
        padding-left: 20px;
        padding-top: 5px;

        .list-info-name {
          font-size: 20px;
          font-weight: bold;
          line-height: 22px;
          padding-bottom: 4px;
        }

        .list-info-creator {
          margin-top: 5px;
          opacity: 0.8;
          transition: 0.3s;
          cursor: pointer;
          font-size: 14px;

          .creator-name:hover {
            text-decoration: underline;
          }

          &:hover {
            opacity: 1;
          }
        }

        .list-desc {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          transition: 0.4s;
          max-height: 44px;
          margin-top: 5px;
          font-size: 14px;
          opacity: 0.8;

          &:hover {
            max-height: 220px;
            -webkit-line-clamp: 10;
            opacity: 1;
          }
        }
      }

      .search-container {
        height: 45px;
        width: 100%;
        font-size: 14px;

        .search-content {
          width: 100%;
          height: 33px;
          padding-top: 12px;

          &.fixed {
            position: absolute;
            top: 0;
            left: 0;
            background: #0009;
            box-sizing: border-box;
            width: calc(100% - 8px);
            height: 50px;
            padding: 12px 15px 0 15px;
            z-index: 5;
            box-shadow: 0 5px 15px #0007;
            transition: background 0.3s;

            &:hover {
              background: #000a;
            }
          }
        }
      }

      .search-input {
        background: transparent;
        border: transparent;
        color: white;
        font-size: 18px;
        padding-top: 5px;
        padding-bottom: 5px;
        outline: none !important;
        border-bottom: 1px solid #0003;
        width: calc(100% - 200px);
        margin-left: 0;

        &::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .loading-skeleton {
      transform: scaleY(0.5) scaleX(0.8);
      height: 71px;
      opacity: 0.8;
    }

    .song-list {
      padding-left: 20px;
      padding-right: 20px;
      position: relative;

      .focus-btn, .clear-btn {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #F23C3C;
        border: 2px solid #F23C3C;
        opacity: 0.3;
        font-size: 0;
        cursor: pointer;
        box-shadow: 0 0 20px #333;
        transition: 0.3s;
        overflow: hidden;
        z-index: 10;
        text-align: center;

        .iconfont {
          font-size: 24px;
          color: #fff;
          line-height: 40px;
        }

        &:hover {
          opacity: 0.7;
        }

      }

      .clear-btn {
        bottom: 145px;
      }

      .song-item {
        color: #fffc;
        opacity: 0.8;
        transition: 0.3s;
        height: 70px;
        border-bottom: 1px solid #fff5;
        overflow: hidden;
        position: relative;
        box-shadow: 0 0 0;

        &.disabled {
          opacity: 0.3;
        }

        &.played {
          opacity: 1;

          .song-order {
            color: #409EFF50;
            text-shadow: 0 0 5px #409EFF50;
          }
        }

        &:hover {
          opacity: 1;
          box-shadow: 0 0 10px #0003;
          border-bottom: 1px solid transparent;

          &.played {
            .song-order {
              color: #409EFF80;
            }
          }

          &.disabled {
            opacity: 0.3;
          }

          .song-artist {
            transform: translate(55px);
          }

          .song-order {
            color: #fff5;
            transform: translate(0, 10px);
            user-select: none;
          }

          .song-cover {
            filter: blur(5px);
            opacity: 0.4;
            transform: rotate(-30deg) scale(2) translate(0, 10px);
            user-select: none;
          }

          .song-name {
            font-weight: bold;
            transform: scale(1.12) translate(45px);
            color: #fff;
          }

          .song-mv {
            transform: translateX(170px);
          }

          .icon-container {
            .operation-icon {
              transform: translate(0, 0);
              opacity: 0.8;
            }
          }
        }

        .song-order {
          font-size: 80px;
          font-weight: bold;
          color: #fff3;
          vertical-align: 30px;
          transition: 0.3s;
          position: absolute;
          letter-spacing: -2px;
          z-index: 2;
        }

        .song-cover {
          width: 50px;
          height: 50px;
          vertical-align: top;
          position: absolute;
          z-index: 0;
          opacity: 0.8;
          filter: blur(0);
          transform: rotate(0) scale(1) translate(55px, 10px);
          transition: 0.4s;
          user-select: none;
        }

        .song-name {
          font-size: 18px;
          display: inline-block;
          vertical-align: top;
          line-height: 50px;
          transform: translate(115px);
          transform-origin: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
          font-weight: normal;
          transition: 0.3s
        }

        .song-mv {
          position: absolute;
          top: 45px;
          left: 150px;
          transform: translateX(0);
          transition: 0.3s;
        }

        .song-artist {
          font-size: 14px;
          position: absolute;
          bottom: 5px;
          left: 0;
          transform: translate(115px);
          display: inline-block;
          vertical-align: top;
          padding-top: 20px;
          transition: 0.3s;
          width: calc(50% - 100px);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .icon-container {
          position: absolute;
          bottom: 5px;
          left: 50%;

          @for $i from 1 through 7 {
            .operation-icon-#{$i} {
              transform: translate(0, 40px);
              transition: 0.3s #{($i - 1) * 0.1}s;
              text-shadow: 0 2px 5px #0008;
              cursor: pointer;
              margin-right: 12px;
              opacity: 0;
            }
          }
        }
      }
    }
  }
</style>