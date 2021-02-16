<template>
  <div class="album-page">
    <info-box :pic="albumInfo.picUrl" :list="infoList" />
    <div class="album-desc hide-scroll">{{albumInfo.desc}}</div>
    <page-right-container>
      <book-mark :tabs="tabs" v-model="type" />
      <song-list :songs="albumInfo.songs || []" />
    </page-right-container>
  </div>
</template>

<script>
  import InfoBox from "../components/InfoBox";
  import BookMark from "../components/BookMark";
  import SongList from '../components/list/song';
  import { ref, reactive, computed } from 'vue';
  import PageRightContainer from "../components/PageRightContainer";
  import { useRoute } from 'vue-router';
  import request from "../utils/request";
  import { replaceObj } from "../utils/util";
  import { handleSongs } from "../utils/store/action";
  import {changeUrlQuery} from "../utils/stringHelper";
  import timer from '../utils/timer';

  export default {
    name: "Album",
    components: { InfoBox, BookMark, PageRightContainer, SongList },
    setup() {

      const type = ref('song');

      const route = useRoute();

      const albumInfo = reactive({});

      const infoList = computed(() => ([
        { text: albumInfo.name, className: 'text-title' },
        { text:
            (albumInfo.ar || []).map(({ name, id, mid, platform }, i) =>
              ({
                text: `${name}${(i < albumInfo.ar.length - 1) ? '/' : ''}`,
                link: changeUrlQuery({ id, mid, platform }, '#/singer', false)
              })),
          icon: 'icon-singer',
          className: 'text-small',
        },
        { text: albumInfo.company, className: 'text-small' },
        { text: timer(albumInfo.publishTime).str(), className: 'text-small' },
      ]))

      // 获取专辑信息
      const getAlbumInfo = async () => {
        const { id, mid, platform } = route.query;

        const { data } = await request({
          api: 'ALBUM',
          data: { id: mid || id, platform }
        })
        data.songs = handleSongs(data.list);
        replaceObj(albumInfo, data)
      }

      getAlbumInfo();

      return {
        tabs: [
          { icon: 'song', val: 'song', color: 'red', text: '歌曲' },
        ],
        type,
        albumInfo,
        infoList,
      }
    }
  }
</script>

<style scoped lang="scss">
  .album-page {
    .album-desc {
      width: 38%;
      font-size: 14px;
      margin-top: 30px;
      text-indent: 2em;
      padding-left: 12px;
      line-height: 1.4em;
      word-break: break-all;
      max-height: calc(100vh - 440px);
      overflow: auto;
    }
  }
</style>