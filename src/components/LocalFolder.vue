<template>
  <div :class="`local-fold-item ${open && 'opened'}`">
    <div class="fold-head">
      <i
        class="iconfont icon-folder"
        @dblclick="openFolder"
      />
      <div class="local-path">
        <el-tooltip
          class="item"
          effect="dark"
          :content="path"
          placement="top"
        >
          <span @dblclick="openFolder">{{ getFileName(path) }}</span>
        </el-tooltip>
      </div>
      <div class="operation-btns">
        <el-popconfirm
          v-if="canDelete"
          confirm-button-text="不要了"
          cancel-button-text="再等等"
          icon="el-icon-info"
          icon-color="red"
          title="确定不再听这个文件夹了？"
          @confirm="deleteFolder"
        >
          <template #reference>
            <i class="iconfont icon-cancel"/>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <div>
      <div class="list-count-container">
        <span
          v-if="!open"
          class="list-count ft_14 pl_10"
        >揪出了{{ list.length }}首歌</span>
        <span
          v-else
          :class="`list-count tab-selected-${listTab}`"
        >
          <span
            class="list-tab tab-song"
            @click="listTab = 'song'"
          >
            <span class="list-title">
              <i class="iconfont icon-song"/>{{ list.length }}
            </span>
          </span>
          <span
            class="list-tab tab-black"
            @click="listTab = 'black'"
          >
            <span class="list-title">
              <i class="iconfont icon-blacklist"/>{{ blackList.length }}
            </span>
          </span>
        </span>
        <i
          class="iconfont icon-arrow-down-1"
          @click="open = !open"
        />
      </div>
    </div>
    <div
      v-if="open"
      class="file-list"
    >
      <div
        v-for="path in (listTab === 'song' ? list : blackList)"
        :key="`f_p_${path}`"
        class="file-item"
      >
        <div class="file-name">
          {{ getFileName(path) }}
        </div>
        <i
          v-if="listTab === 'song'"
          class="iconfont icon-blacklist"
          @click="addToBlack(path)"
        />
        <i
          v-if="listTab === 'black'"
          class="iconfont icon-add"
          @click="removeFromBlack(path)"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, computed } from 'vue';
  import { mixInject } from "../utils/store/state";
  import { getFileName } from "../utils/stringHelper";
  import {shell, ipcRenderer} from "electron";
  import { mixSongHandle } from "../utils/store/action";

  export default {
    name: "LocalFold",
    props: {
      path: String,
      canDelete: Boolean,
    },
    setup(props) {
      const state = mixInject(['localFiles', 'setting', 'localBlackList', 'playNow']);

      const { setting, localFiles, localBlackList } = state;

      const open = ref(false);

      const listTab = ref('song');

      const reg = RegExp(`local_${props.path.replace(/\//g, '\\/')}\\/([^\\/])+`);

      const list = computed(() => [...state.localFiles].filter((p) => reg.test(p) && !state.localBlackList.has(p)));

      const blackList = computed(() => [...state.localBlackList].filter((p) => reg.test(p)));

      return {
        ...state,
        open,
        list,
        blackList,
        listTab,
        getFileName,
        deleteFolder() {
          mixSongHandle.removeFromPlayinig(list.value);
          list.value.forEach((aId) => localFiles.delete(aId));
          setting.localFolders = setting.localFolders.filter((v) => v !== props.path);
        },
        addToBlack(aId) {
          mixSongHandle.removeFromPlayinig([aId]);
          localFiles.delete(aId);
          localBlackList.add(aId);
        },
        removeFromBlack(aId) {
          localBlackList.delete(aId);
          ipcRenderer.send('LOAD_LOCAL_SINGLE_FILE', aId)
        },
        openFolder() {
          shell.showItemInFolder(props.path)
        },
      }
    },
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .local-fold-item {
    box-shadow: 0 0 5px 5px #0001;
    margin: 20px;
    border-radius: 8px;
    transition: 0.3s;
    background: transparent;
    opacity: 0.7;

    &:hover {
      box-shadow: 0 0 10px 10px #0001;
      opacity: 0.9;
    }

    &.opened {
      .icon-arrow-down-1 {
        transform: rotate(0) !important;
      }
    }

    .icon-arrow-down-1 {
      transform: rotate(90deg);
      transition:  0.3s;
    }

    .fold-head {
      padding: 8px;
      display: flex;

      .icon-folder {
        font-size: 32px;
        display: inline-block;
        width: 32px;
      }
      .local-path {
        display: inline-block;
        padding: 0 16px;
        vertical-align: top;
        box-sizing: border-box;
        word-break: break-all;
        height: 40px;
        line-height: 20px;
        overflow: hidden;
        flex: 1;
      }
      .operation-btns {
        display: inline-block;
        width: 100px;
        text-align: right;
        box-sizing: border-box;
        vertical-align: top;
        line-height: 20px;
        padding: 4px 16px;
        font-size: 12px;
      }
    }

    .list-count-container {
      .list-count {
        display: inline-block;
        width: 200px;
        box-sizing: border-box;
        margin-bottom: 12px;

        &.tab-selected-song {
          .tab-song {
            border-bottom-color: $blue;
            opacity: 1;
          }
        }

        &.tab-selected-black {
          .tab-black {
            border-bottom-color: $red;
            opacity: 1;
          }
        }

        .list-tab {
          display: inline-block;
          width: 80px;
          margin: 0 10px;
          text-align: center;
          position: relative;
          border-bottom: 10px solid transparent;
          height: 8px;
          cursor: pointer;
          transition: 0.3s;
          opacity: 0.8;

          .list-title {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      }
    }

    .file-list {
      background: #00000009;

      .file-item {
        background: transparent;
        transition: 0.3s;
        padding: 8px 16px;
        opacity: 0.8;
        display: flex;

        &:hover {
          background: #00000009;
          opacity: 1;
        }

        .file-name {
          word-break: break-all;
          padding-right: 8px;
          flex: 1;
        }
        .iconfont {
          width: 20px;
          text-align: center;
        }
      }
    }
  }
</style>