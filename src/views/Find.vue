<template>
  <div class="find-setting-page hide-scroll">
    <div class="find-input so-input input-line">
      <input
        v-model="keyword"
        placeholder="歌曲/专辑/歌手。。。"
      >
    </div>
    <div class="find-list">
      <div
        v-for="aId in list"
        :key="`find-${aId}`"
        :class="`find-item ${activeAId === aId && 'actived'}`"
        @mouseenter="activeAId = aId"
      >
        <div class="find-left">
          <div class="song-info">
            <div
              class="song-name"
              @click="playMusic(aId)"
            >
              {{ allSongs[aId].name }} - {{ (allSongs[aId].ar || []).map(({ name }) => name).join('/') }}
            </div>
            <template v-if="activeAId === aId">
              <img
                v-error
                class="song-img"
                :src="allSongs[aId].al.picUrl"
              >
              <div class="album-name">
                <i class="iconfont icon-album"/>
                {{ allSongs[aId].al.name }}
              </div>
            </template>
          </div>
        </div>
        <div class="find-right">
          <div class="song-info">
            <template v-if="miguFind[aId].url">
              <div
                class="song-name"
                @click="playMusic(aId)"
              >
                {{ miguFind[aId].name }} - {{ (miguFind[aId].artists || []).map(({ name }) => name).join('/') }}
              </div>
              <img
                v-if="activeAId === aId"
                v-error
                class="song-img"
                :src="miguFind[aId].picUrl"
              >
            </template>
            <div
              v-else
              class="song-name"
            >
              找不到 = =
            </div>
            <div class="bottom-btn">
              <el-popover
                v-if="(miguFindBlack[aId] || []).length"
                ref="popover"
                :width="200"
              >
                <div class="handle-black-container">
                  <div><b>黑名单</b></div>
                  <div class="blacklist-container">
                    <div
                      v-for="cid in miguFindBlack[aId]"
                      :key="`${aId}-${cid}`"
                      class="black-item"
                    >
                      <span>{{ cid }}</span>
                      <i
                        class="iconfont icon-delete"
                        @click="removeFromBlack(aId, cid)"
                      />
                    </div>
                  </div>
                </div>
                <template #reference>
                  <span class="black-btn">
                    <i class="iconfont icon-blacklist"/>
                    {{ miguFindBlack[aId].length }}
                  </span>
                </template>
              </el-popover>

              <el-popconfirm
                v-if="activeAId === aId && miguFind[aId].url"
                title="确定匹配错误并拉入匹配黑名单"
                placement="top"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="reFind(aId, true)"
              >
                <template #reference>
                  <span class="delete-btn">
                    <i class="iconfont icon-delete"/>
                    匹配错误
                  </span>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import {computed, ref} from 'vue';
  import {ElMessage, ElNotification} from 'element-plus';
  import { findMusic } from "../utils/store/action";
  import { useRoute } from 'vue-router'

  export default {
    name: "Find",
    setup() {
      const state = mixInject(['miguFind', 'miguFindBlack', 'allSongs', 'playNow']);

      const {allSongs, miguFind, miguFindBlack} = state;

      const route = useRoute();

      const keyword = ref(route.query.keyword || '');

      const activeAId = ref('');

      !window.shoedFindNotifi && ElNotification({
        title: '替换说明',
        message: '会员/无版权歌曲会从咪咕音乐进行搜索替换，当然这是存在精确度问题，也是存在找不到的可能的，如果发现搜索到的资源不对，' +
          '可以删除错误的匹配结果，会自动进行重新查找匹配',
      })

      window.shoedFindNotifi = true;

      const list = computed(() => {
        const key = keyword.value.replace(/\/|\s|\t|,|，|-|/g, '').toLowerCase();
        const l = Object.keys(miguFind)
          .filter((aId) => allSongs[aId])
          .filter((s) => (
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
              .indexOf(key) > -1
          ));
        if (!activeAId.value) {
          activeAId.value = l[0];
        }
        return l;
      })

      return {
        ...state,
        keyword,
        list,
        activeAId,
        reFind(aId, add2Black = false) {
          miguFindBlack[aId] = miguFindBlack[aId] || [];
          add2Black && miguFindBlack[aId].push(miguFind[aId].cid);
          miguFind[aId] = {};
          delete allSongs[aId].pUrl;
          delete allSongs[aId].url;
          delete allSongs[aId][128];
          delete allSongs[aId][320];
          delete allSongs[aId].flac;
          delete allSongs[aId].br;
          delete allSongs[aId].lyric;
          delete allSongs[aId].rawLyric;
          delete allSongs[aId].bId;
          delete allSongs[aId].bPlatform;
          allSongs[aId].noUrl = true;

          findMusic.push(aId);
        },
        playMusic(aId) {
          if (allSongs[aId].url) {
            state.playNow.aId = aId;
          } else {
            ElMessage.warning('这首歌匹配不到 =。=');
          }
        },
        removeFromBlack(aId, cid) {
          miguFindBlack[aId] = miguFindBlack[aId].filter((c) => c !== cid);
          this.reFind(aId);
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .find-setting-page {
    padding-top: 60px;
    height: $mainHeight;
    box-sizing: border-box;

    .find-input {
      position: absolute;
      top: 0;
      width: 100%;
      height: 40px;
      background: #0006;
      padding: 8px 12px;
      transition: 0.3s;
      z-index: 9;

      input {
        width: 60vw !important;
      }

      &:hover {
        background: #000c;
      }
    }

    .find-list {
      .find-item {
        display: flex;
        padding: 0 8px;
        opacity: 0.6;
        transition: 0.3s opacity, 0.3s background;
        height: 25px;
        overflow: hidden;
        word-break: break-all;
        background: transparent;

        &:hover {
          opacity: 0.8;
          background: #0003;
        }

        &.actived {
          height: 100px;

          .song-name, .album-name, .bottom-btn {
            transform: translateX(14%) !important;
          }
        }

        .find-left, .find-right {
          flex: 1;
        }

        .song-info {
          position: relative;
          height: 100px;

          .song-name {
            width: 80%;
            transition: 0.3s;
            transform: translateX(0);
            cursor: pointer;
          }

          .album-name, .bottom-btn {
            position: absolute;
            bottom: 12px;
            left: 0;
            width: 80%;
            transition: 0.3s;
            transform: translateX(0);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            .icon-album {
              padding-right: 8px;
              cursor: default !important;
            }
          }

          .delete-btn {
            color: $red;
            cursor: pointer;
          }

          .black-btn {
            display: inline-block;
            vertical-align: baseline;
            margin-right: 12px;
            cursor: pointer;
          }

          .song-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100px;
            height: 100px;
            z-index: -1;
            opacity: 0.4;
          }
        }
      }
    }
  }

  .handle-black-container {
    .blacklist-container {
      max-height: 165px;
      overflow: auto;
      margin: 5px 0;
      &::-webkit-scrollbar
      {
        width: 0;
        height: 0;
      }

      .black-item {
        font-size: 13px;
        line-height: 24px;
        cursor: pointer;
        border: 1px solid transparent;
        padding: 0 8px;
        border-radius: 4px;
        &:nth-child(2n) {
          background: #{$blue}11;
        }
        &:hover {
          background: #{$blue}22;
        }
        .icon-delete {
          color: $red;
          float: right;
        }
      }
    }
  }
</style>