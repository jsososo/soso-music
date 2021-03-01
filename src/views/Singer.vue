<template>
  <div class="singer-page">
    <info-box :pic="singerInfo.picUrl" :list="infoList" />
    <div class="singer-desc hide-scroll">{{singerInfo.desc}}</div>
    <page-right-container>
      <book-mark :tabs="tabs || []" v-model="type" />
      <song-list v-if="type === 'song'" :songs="singerInfo.songs || []" />
      <album-list v-if="type === 'album'" :albums="singerInfo.albums || []" />
      <singer-list v-if="type === 'sim'" :singers="singerInfo.sims || []" />
      <div v-if="type === 'info'">
        <div v-if="!(singerInfo.intro || []).length" class="text-center mt_40 op_8">没什么好说的</div>
        <div v-else class="intro-content">
          <div v-for="({ ti, txt }, i) in singerInfo.intro" :key="`${ti}-${i}`">
            <div class="intro-ti">{{ti}}</div>
            <div class="intro-txt">{{txt}}</div>
          </div>
        </div>
      </div>
    </page-right-container>
  </div>
</template>

<script>
  import PageRightContainer from "../components/PageRightContainer";
  import InfoBox from "../components/InfoBox";
  import BookMark from "../components/BookMark";
  import SongList from '../components/list/song';
  import SingerList from '../components/list/singer';
  import AlbumList from '../components/list/album';

  import { ref, reactive, computed, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import request from "../utils/request";
  import { replaceObj } from "../utils/util";
  import {handleSongs} from "../utils/store/action";

  export default {
    name: "Singer",
    components: {
      InfoBox,
      BookMark,
      PageRightContainer,
      SingerList,
      SongList,
      AlbumList,
    },
    setup() {

      const type = ref('song');

      const route = useRoute();

      const singerInfo = reactive({});

      const infoList = computed(() => [
        { text: singerInfo.name, className: 'text-title' },
        { text: (singerInfo.alias || []).join('、'), className: 'text-small' },
      ])

      // 获取歌手的专辑、热门信息、相似歌手等信息
      const getMoreInfo = async () => {
        const { id, mid, platform } = route.query;
        if (type.value === 'info' || singerInfo[`${type.value}s`] || (!mid && !id)) {
          return;
        }
        const { data } = await request({
          api: `SINGER_${type.value.toUpperCase()}`,
          data: { id: mid || id, platform },
        })
        switch (type.value) {
          case 'song':
            singerInfo.songs = handleSongs(data);
            break;
          default:
            singerInfo[`${type.value}s`] = data;
            break;
        }
      }

      // 获取歌手信息
      const updateSinger = async () => {
        const { id, mid, platform } = route.query;
        if (!id && !mid) {
          return;
        }
        const { data } = await request({
          api: 'SINGER_INFO',
          data: { id: mid || id, platform },
        })
        replaceObj(singerInfo, data);
        getMoreInfo();
      }

      watch(() => route.query, updateSinger);
      watch(() => type.value, getMoreInfo);

      updateSinger();

      return {
        tabs: [
          { icon: 'song', val: 'song', color: 'red', text: '热门歌曲' },
          { icon: 'album', val: 'album', color: 'blue', text: '专辑' },
          { icon: 'info', val: 'info', color: 'green', text: '简介' },
          { icon: 'link', val: 'sim', color: 'yellow', text: '相似歌手' },
        ],
        type,
        infoList,
        singerInfo,
      }
    }
  }
</script>

<style scoped lang="scss">
  .singer-page {
    .singer-desc {
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

    .intro-content {
      padding: 20px;

      .intro-ti {
        font-size: 18px;
        font-weight: 900;
        margin: 10px 0;
      }
      .intro-txt {
        font-size: 14px;
        margin-bottom: 20px;
        line-height: 1.5em;
        text-indent: 2em;
      }
    }
  }
</style>