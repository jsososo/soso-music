<template>
  <page-right-container class-name="list-detail-container">
    <slot/>
    <div ref="containerDom" class="scroll-content" @scroll="getShowIndex">
      <div v-if="!listInfo && loading && list.length === 0" class="text-center fc_fff ft_20"
           style="padding-top: 100px;opacity: 0.8;letter-spacing: 2px;">拼命查找了！
      </div>
      <!--   歌单信息   -->
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
        <div ref="searchDom" class="search-container">
          <div :class="`search-content ${searchFix && 'fixed'}`">
            <input v-model="search" class="search-input" type="text" placeholder="找呀找呀找歌曲">
            <div class="inline-block pt_5">下列歌曲：</div>
            <el-tooltip class="item" effect="dark" content="播放" placement="top">
              <div class="inline-block pt_5 pointer play" style="line-height: 20px;" @click="playListShow(true)">
                <i class="iconfont icon-play pl_10 pr_10"/>
              </div>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="添加到播放列表" placement="top">
              <div class="inline-block pt_5 pointer play" style="line-height: 20px;" @click="playListShow()">
                <i class="iconfont icon-list-add pl_10 pr_10"/>
              </div>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="下载" placement="top">
              <div class="inline-block pt_5 pointer play" style="line-height: 20px;" @click="downShow">
                <i class="iconfont icon-download pl_10 pr_10"/>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div v-if="list.filterList && list.filterList.length" ref="listDom" class="song-list">
        <div :style="`height:${smallIndex*71}px;`"></div>
        <div
          v-for="(s, i) in list.list"
          :key="`${s}-${i}`"
          :class="`song-item
            ${playNow.aId === s ? 'played' : ''}
            ${!(allSongs[s].url || allSongs[s].localPath) ? 'disabled' : ''}
            ${showAnimate ? 'show-animate' : ''}
           `"
          @click="(allSongs[s].url || allSongs[s].localPath) && playMusic({ aId: s, list: list.trueList, listId })"
        >
          <div v-if="playNow.pUrl && playNow.pUrl === allSongs[s].pUrl" class="playing-bg"
               :style="`width: ${playerStatus.percentage * 100}%`">
            <div class="wave-bg"/>
            <div class="wave-bg2"/>
          </div>
          <span class="song-order">{{smallIndex+i+1}}</span>
          <img v-error class="song-cover" :src="`${allSongs[s].al && allSongs[s].al.picUrl}`" alt=""/>
          <span class="song-name">{{allSongs[s].name}}</span>
          <span class="song-artist">{{(allSongs[s].ar || []).map((a) => a.name).join('/')}}</span>
          <div v-if="allSongs[s].platform !== 'local'" class="icon-container">
            <el-tooltip class="item" effect="dark" content="喜欢" placement="top">
              <i
                :class="`operation-icon operation-icon-1 iconfont icon-${favSongMap[allSongs[s].platform][s] ? 'like' : 'unlike'}`"
                @click="likeMusic(s)"
              />
            </el-tooltip>
            <handle-song :a-id="s" class-name="operation-icon operation-icon-2 ft_14"/>
            <el-tooltip v-if="playingList[s]" class="item" effect="dark" content="移出播放列表" placement="top">
              <i
                class="operation-icon operation-icon-3 iconfont icon-list-reomve"
                @click="removeFromPlayinig([s])"
              />
            </el-tooltip>
            <el-tooltip v-if="allSongs[s].url && !playingList[s]" class="item" effect="dark" content="加入播放列表"
                        placement="top">
              <i
                class="operation-icon operation-icon-3 iconfont icon-list-add"
                @click="addToPlaying([s])"
              />
            </el-tooltip>
            <el-tooltip v-if="!!allSongs[s].url" class="item" effect="dark" content="下载" placement="top">
              <i
                class="operation-icon operation-icon-4 iconfont icon-download"
                @click="download(s)"
              />
            </el-tooltip>
            <el-tooltip
              v-if="user[listInfo.platform] && user[listInfo.platform].myList && user[listInfo.platform].myList[listId]"
              class="item"
              effect="dark"
              content="从歌单中删除"
              placement="top"
            >
              <i
                class="operation-icon operation-icon-5 iconfont icon-delete"
                @click="delSongFromList(s, listInfo.id)"
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

          <div v-if="rightInfo && rightInfo[i]" class="right-info">{{rightInfo[i]}}</div>
        </div>
        <div :style="`min-height:0;height:${list.hideBigHeight}px;`" />
      </div>
      <div class="fix-btn-list">
        <div v-if="list.trueList.indexOf(playNow.aId) > -1" class="fix-btn" @click="scrollToPlayNow">
          <i class="iconfont icon-focus"/>
        </div>
        <el-popconfirm
          v-if="id === 'playing'"
          title="清空播放列表？"
          placement="left"
          @confirm="clearPlaying()"
        >
          <template #reference>
            <div class="fix-btn">
              <i class="iconfont icon-delete" />
            </div>
          </template>
        </el-popconfirm>

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
  import HandleSong from "./HandleSong";
  import { throttle } from "../utils/util";

  export default {
    name: "PlayListInfo",
    components: {
      PageRightContainer,
      HandleSong,
    },
    props: {
      id: String,
      listId: String,
      platform: String,
      loading: Boolean,
      listInfo: Object,
      rightInfo: Object,
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
        'favSongMap',
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
        showAnimate,
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
        ref(true),
      ];

      const list = computed(() => {
        const {list: trueList = []} = props.listInfo;
        const {allSongs} = state;
        const rex = search.value.replace(/\/|\s|\t|,|，|-|/g, '').toLowerCase();

        let filterList = trueList;

        rex && (filterList = trueList.filter((s) => (
          allSongs[s] &&
          `${allSongs[s].name}
          ${(allSongs[s].ar || []).map((a) => a.name).join('')}
          ${allSongs[s].al.name}
          ${allSongs[s].name}
          ${allSongs[s].al.name}
          ${(allSongs[s].ar || []).map((a) => a.name).join('')}
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
          filterList,
          trueList,
          list: filterList.filter((id, i) => state.allSongs[id] && i >= smallIndex.value && i <= bigIndex.value),
        }
      })

      let scrollTimeout;

      // const getShowIndex = () => {
      //   const dom = containerDom.value;
      //   if (!dom) {
      //     return nextTick(getShowIndex)
      //   }
      //   const smallHeight = Math.max(dom.scrollTop - 700, 0);
      //   if (Math.abs(smallHeight / 71 - smallIndex.value) > 3) {
      //     smallIndex.value = Math.floor(smallHeight / 71);
      //   }
      //   const bigHeight = dom.clientHeight + dom.scrollTop + 500;
      //   if (Math.abs(Math.min(Math.floor(bigHeight / 71), list.value.listNum) - bigIndex.value) > 3) {
      //     bigIndex.value = Math.min(Math.floor(bigHeight / 71), list.value.listNum);
      //   }
      //   searchFix.value = (containerDom.value && searchDom.value) && (containerDom.value.scrollTop > searchDom.value.offsetTop)
      // }
      const getShowIndex = throttle(() => {
        const dom = containerDom.value;
        if (!dom) {
          return nextTick(getShowIndex)
        }
        const smallHeight = Math.max(dom.scrollTop - 1200, 0);


        if (Math.abs(smallHeight / 71 - smallIndex.value) > 10 || smallHeight === 0) {
          smallIndex.value = Math.floor(smallHeight / 71);
        }
        const bigHeight = dom.clientHeight + dom.scrollTop + 1000;
        if (Math.abs(Math.min(Math.floor(bigHeight / 71), list.value.listNum) - bigIndex.value) > 10 || (bigHeight > list.value.listNum * 71)) {
          bigIndex.value = Math.min(Math.floor(bigHeight / 71), list.value.listNum);
        }
        searchFix.value = (containerDom.value && searchDom.value) && (containerDom.value.scrollTop > searchDom.value.offsetTop)

        clearTimeout(scrollTimeout);
        showAnimate.value = false;
        // 滚动过程移除 hover 动画
        scrollTimeout = setTimeout(() => {
          showAnimate.value = true;
        }, 500)

      }, 70)

      watch(() => list.value.listNum, getShowIndex, { immediate: true });

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
        showAnimate,

        changeUrlQuery,

        getShowIndex,

        // 播放展示的歌曲
        playListShow(force) {
          const {allSongs, playerStatus, playNow} = state;
          const aId = list.value.filterList.find((s) => allSongs[s].url);
          if (!aId) {
            return ElMessage.error('无可播放歌曲');
          }
          updatePlayingList(list.value.filterList, force);
          force ?
            (playNow.aId = aId) :
            ElMessage.success('已添加至播放列表');
          playerStatus.playing = true;
        },

        downShow() {
          const {allSongs} = state;
          const ids = list.value.filterList.filter((s) => allSongs[s].url);
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
          const index = list.value.trueList.findIndex((v) => v === aId);
          (index > -1) && containerDom.value.scrollTo(0, index * 71 + listDom.value.offsetTop - 50);
        },

        playMusic({aId, list}) {
          updatePlaying(aId, list);
          state.playerStatus.playing = true;
        },

        ...mixSongHandle,
      }
    },
  }
</script>

<style lang="scss">
  @import "../assets/style/value";

  .high-performance-mode {
    .list-detail-container {
      .song-list {
        .song-item {
          .song-artist {
            width: calc(90% - 100px);
          }
          &.show-animate:hover {
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
              width: calc(50% - 100px);
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

            .right-info {
              transform: translateY(10px);
            }
          }

          .icon-container {
            position: absolute;
            bottom: 5px;
            left: 50%;

            .operation-icon- {
              text-shadow: 0 2px 5px #0008;
            }
          }
        }
      }
    }
  }

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
          transition: 0.4s;
          max-height: 44px;
          margin-top: 5px;
          font-size: 14px;
          opacity: 0.8;

          &:hover {
            max-height: 1000px;
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

        &.show-animate:hover {
          opacity: 1;
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
            opacity: 0.4;
            transform: rotate(-30deg) scale(2) translate(0, 10px);
            user-select: none;
          }

          .song-name {
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

          .right-info {
            transform: translateY(10px);
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

        .right-info {
          position: absolute;
          right: 10px;
          text-align: right;
          font-size: 40px;
          font-weight: bold;
          color: #fff3;
          vertical-align: 30px;
          bottom: 0;
          transform: translateY(20px);
          transition: 0.3s;
        }
      }
    }

    .fix-btn-list {
      position: fixed;
      right: 40px;
      bottom: 100px;
      text-align: center;
      line-height: 42px;

      .fix-btn {
        background: $red;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        margin: 12px 0;
        font-size: 24px;
        box-shadow: 5px 5px 4px #0001;
        opacity: 0.5;
        transition: 0.3s;

        &:hover {
          box-shadow: 5px 5px 10px #0004;
          opacity: 0.8;
        }
      }
    }
  }
</style>