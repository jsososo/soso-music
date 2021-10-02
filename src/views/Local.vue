<template>
  <div class="local-page hide-scroll">
    <PageTitle title="LOCAL" />
    <div class="folder-list">
      <LocalFolder :path="setting.DOWN_DIR"/>
      <LocalFolder
        v-for="path in setting.localFolders"
        :key="`local-folder-${path}`"
        can-delete
        :path="path"
      />
      <div
        class="add-btn"
        @click="addFolder"
      >
        <i class="iconfont icon-add"/>
      </div>
    </div>
    <playlist-info
      :list-info="{ list }"
    />
  </div>
</template>

<script>
  import PlaylistInfo from "../components/PlaylistInfo";
  import { mixInject } from "../utils/store/state";
  import { computed } from 'vue';
  import { loadLocalFile } from "../utils/store/action";
  import PageTitle from "../components/PageTitle";
  import LocalFolder from "../components/LocalFolder";
  import {ipcRenderer} from "electron";

  export default {
    name: "Local",
    components: { PlaylistInfo, PageTitle, LocalFolder },
    setup() {
      const state = mixInject(['allSongs', 'localFiles', 'setting', 'allSongs']);

      const { setting, localFiles, allSongs } = state;

      const list = computed(() =>
        [...localFiles]
          .filter((v) => allSongs[v] && allSongs[v].name)
          .sort((a, b) => (a > b) - 0.5)
      );

      loadLocalFile([setting.DOWN_DIR, ...setting.localFolders]);

      return {
        ...state,
        list,
        addFolder() {
          ipcRenderer.send('SHOW_SELECT_DIR', { type: 'local_folder' });
        },
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";
  .local-page {
    height: $mainHeight;
    width: 45%;

    .folder-list {
      .add-btn {
        width: 50px;
        height: 50px;
        border-radius: 5px;
        text-align: center;
        line-height: 50px;
        cursor: pointer;
        opacity: 0.6;
        border: 1px solid #fff9;
        transition: 0.3s;
        margin-left: 20px;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
</style>