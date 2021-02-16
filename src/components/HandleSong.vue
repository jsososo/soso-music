<template>
  <el-popover
    :placement="placement"
    :width="200"
    ref="popover"
    @show="handleSong.aId = aId"
    @hide="handleSong.aId = ''"
  >
    <div class="handle-song-container">
      <div><b>添加到</b></div>
      <div class="playlist-container" v-if="handleSong.aId">
        <div
          v-for="(val, id) in handleSong.list"
          :key="id"
          :class="`playlist-item ${(allList[id].dirid || allList[id].id) === handleSong.selected && 'selected'}`"
          @click="handleSong.selected = allList[id].dirid || allList[id].id"
        >
          {{allList[id].name}}
        </div>
      </div>
      <el-button
        class="pull-right"
        :disabled="!handleSong.selected"
        type="primary"
        size="mini"
        @click="handleAddSong"
      >
        确定
      </el-button>
    </div>
    <template #reference>
      <i :class="`iconfont icon-add ft_12 ${className}`" />
    </template>
  </el-popover>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import { watch, ref } from 'vue';
  import { addSong2Playlist } from "../utils/store/action";

  export default {
    name: "HandleSong",
    props: {
      placement: {
        type: String,
        default: 'bottom',
      },
      aId: String,
      className: String,
    },
    setup(props) {
      const state = mixInject(['handleSong', 'user', 'allList', 'allSongs'])

      const { handleSong, allSongs, user } = state;

      const visible = ref(false);

      const popover = ref();

      watch(() => handleSong.aId, (v) => {
        visible.value = (v === props.aId);
        if (visible.value) {
          const { platform } = allSongs[v];
          const { myList = {} } = user[platform];
          handleSong.list = myList;
          if (!myList[handleSong.selected]) {
            handleSong.selected = '';
          }
        }
      })

      return {
        ...state,
        visible,
        popover,
        async handleAddSong() {
          await addSong2Playlist({ aId: props.aId, pId: handleSong.selected, type: 1 });
          handleSong.visible = false;
          popover.value.hide();
        },
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";
  .handle-song-container {
    .playlist-container {
      max-height: 165px;
      overflow: auto;
      margin: 5px 0;
      &::-webkit-scrollbar
      {
        width: 0;
        height: 0;
      }

      .playlist-item {
        font-size: 13px;
        line-height: 24px;
        cursor: pointer;
        border: 1px solid transparent;
        padding: 0 8px;
        border-radius: 4px;
        &.selected {
          border-color: #{$blue}99;
        }
        &:nth-child(2n) {
          background: #{$blue}11;
        }
        &:hover {
          background: #{$blue}22;
        }
      }
    }
  }
</style>