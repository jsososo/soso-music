<template>
  <div class="search-content">
    <page-title title="SEARCH" />
    <tab v-model="searchInfo.type" :tabs="typeList" />
    <div class="search-list inner_tab_content hide-scroll" v-if="searchInfo">
      <SongList v-if="searchInfo.type/1 === 0" show-index :songs="searchInfo.result[0] || []" />
      <AlbumList v-if="searchInfo.type/1 === 2" :albums="searchInfo.result[2] || []" />
      <SingerList v-if="searchInfo.type/1 === 3" :singers="searchInfo.result[3] || []" />
      <Playlist v-if="searchInfo.type /1 === 1" :list="searchInfo.result[1] || []" />
    </div>
  </div>
</template>

<script>
  import PageTitle from "../components/PageTitle";
  import {mixInject} from "../utils/store/state";
  import SongList from '../components/list/song';
  import SingerList from '../components/list/singer';
  import AlbumList from '../components/list/album';
  import Playlist from '../components/list/playlist';
  import Tab from "../components/Tab";
  import { watch, reactive } from 'vue';
  import { useRoute } from 'vue-router';

  export default {
    name: "Search",
    components: {
      PageTitle,
      SongList,
      Tab,
      SingerList,
      AlbumList,
      Playlist,
    },
    setup() {
      const route = useRoute();
      const state = mixInject(['searchInfo', 'setting']);

      const { searchInfo, setting } = state;
      const typeList = reactive([
        {
          val: 0,
          color: 'red',
          icon: 'song',
          text: '歌曲',
        },
        {
          val: 2,
          color: 'blue',
          icon: 'album',
          text: '专辑',
        },
        {
          val: 3,
          color: 'green',
          icon: 'singer',
          text: '歌手',
        },
        {
          val: 1,
          color: 'yellow',
          icon: 'playlist',
          text: '歌单',
        },
      ])
      searchInfo.keyword = route.query.keyword;

      // 监听搜索词和平台变化
      watch(() => [route.query.keyword, setting.platform],
        (([keyword, v]) => {
          searchInfo.keyword = keyword;
          searchInfo.platform = v;
        }));
      return {
        ...state,
        route,
        typeList,
      };
    }
  }
</script>

<style scoped lang="scss">

</style>