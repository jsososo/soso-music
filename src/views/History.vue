<template>
  <div>
    <playlist-info
      :list-info="{ list }"
      :right-info="rightInfo"
    >
      <book-mark v-model="setting.HISTORY_TAB" :tabs="tabs" />
    </playlist-info>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import {handleSongs} from "../utils/store/action";
  import PlaylistInfo from "../components/PlaylistInfo";
  import BookMark from "../components/BookMark";
  import { watch, reactive } from 'vue';
  import {replaceObj} from "../utils/util";

  export default {
    name: "History",
    components: { PlaylistInfo, BookMark },
    setup() {
      const state = mixInject(['playHistory', 'setting', 'playNow']);

      const { playHistory, setting, playNow } = state;
      const list = reactive(handleSongs(playHistory[setting.HISTORY_TAB]));
      const rightInfo = reactive([]);

      watch(
        () => [setting.HISTORY_TAB, playNow.aId],
        ([v]) => {
        const newList = playHistory[v]
        let times = [];

        switch (v) {
          case 'list':
          case 'times':
            times = newList.map(({ historyCount }) => historyCount);
            break;
          case 'week':
            times = newList.map(({ weekListen }) => weekListen.length);
            break;
        }
        replaceObj(rightInfo, times);
        replaceObj(list, handleSongs(newList))
      },
        { deep: true }
      )
      return {
        ...state,
        list,
        rightInfo,
        tabs: [
          { icon: 'song', color: 'red', val: 'list', text: '最近播放' },
          { icon: 'history', color: 'blue', val: 'times', text: '播放次数' },
          { icon: 'week', color: 'green', val: 'week', text: '最近一周' },
        ]
      }
    }
  }
</script>

<style scoped lang="scss">

</style>