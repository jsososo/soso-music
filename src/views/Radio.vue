<template>
  <div class="radio-page">
    <div :class="`page-left-container hide-scroll platform-${setting.platform}`">
      <div class="cate-list">
        <div
          v-for="item in cateList[setting.platform]"
          :key="`${item.id}-${item.name}`"
          :class="`cate-item ${activeCate[setting.platform] === item.id && 'actived'}`"
          @click="activeCate[setting.platform] = item.id"
        >
          <div class="cate-bg"/>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div
        v-if="radioList[setting.platform]"
        class="radio-list"
      >
        <div
          v-for="item in radioList[setting.platform]"
          :key="item.id"
          :class="`common-small-box ${activeRadioId === item.id && 'selected'}`"
        >
          <div
            class="box-img-container pointer"
            @click="activeRadioId = item.id"
          >
            <img
              v-error
              :src="`${item.picUrl}?param=200y200`"
            >
          </div>
          <div
            class="box-name pointer"
            @click="activeRadioId = item.id"
          >
            {{ item.name }}
          </div>
        </div>
        <div
          v-if="!radioList[setting.platform].length"
          class="text-center mt_40"
        >
          找不到～
        </div>
      </div>
    </div>
    <playlist-info
      v-if="setting.platform === '163'"
      :list-info="listInfo"
    />
  </div>
</template>

<script>
  import { mixInject } from "../utils/store/state";
  import request from "../utils/request";
  import { ref, watch, reactive } from 'vue';
  import PlaylistInfo from "../components/PlaylistInfo";
  import {handleSongs, updatePlaying} from "../utils/store/action";
  import { ElMessage } from 'element-plus';

  export default {
    name: "Radio",
    components: { PlaylistInfo },
    setup() {
      const state = mixInject(['setting']);

      const [
        cateList,
        radioList,
        activeCate,
        activeRadioId,
        listInfo,
      ] = [
        reactive({}),
        reactive({}),
        reactive({}),
        ref(''),
        reactive({ list: [] }),
      ];

      const { setting } = state;

      const queryCate = async () => {
        const { platform } = setting;
        !cateList[platform] && (cateList[platform] = (await request('MIX_RADIO_CATE', platform)).data);
        !activeCate[platform] && cateList[platform][0] && (activeCate[platform] = cateList[platform][0].id);
      }

      const queryRadioList = async () => {
        const { platform } = setting;
        radioList[platform] = (await request({
          api: 'MIX_RADIO_LIST',
          data: {
            id: activeCate[platform],
            platform,
          }
        })).data || [];
      }

      watch(activeCate, queryRadioList, { deep: true })

      watch(() => setting.platform, queryCate, { immediate: true });

      watch(activeRadioId, async (id) => {
        const { platform } = setting;
        const { data = [] } = await request({
          api: 'MIX_RADIO_SONGS',
          data: { id, platform,}
        }).catch(() => ({}));
        const list = handleSongs(data);
        if (!list.length) {
          return ElMessage.warning('无法获取到歌曲，可能需要登陆');
        }
        switch (platform) {
          case '163':
            listInfo.list = list;
            break;
          case 'qq':
            updatePlaying(list[0], list, true, `${platform}_${id}`);
            break;
        }
      })

      return {
        ...state,
        cateList,
        activeCate,
        radioList,
        activeRadioId,
        listInfo,
      }
    },
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .radio-page {

    .page-left-container {
      max-height: $mainHeight;
      overflow-y: auto;

      &.platform-163 {
        width: 50%;
        min-width: calc(100% - 750px);
      }
    }

    .cate-list {
      .cate-item {
        display: inline-block;
        position: relative;
        margin: 6px 12px;
        cursor: pointer;
        opacity: 0.7;
        transition: 0.3s;

        .cate-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: $blue;
          z-index: -1;
          transform: scale(0, 0.4);
          transform-origin: 50% 90%;
          transition: 0.3s;
          border-radius: 4px;
        }

        &:hover {
          opacity: 0.9;
          .cate-bg {
            opacity: 0.5;
            transform: scale(0.5, 0.4);
          }
        }
        &.actived {
          opacity: 0.9;
          .cate-bg {
            opacity: 0.9;
            transform: scale(1, 0.4);
          }
          &:hover .cate-bg {
            transform: scale(1, 0.6);
          }
        }
      }
    }
  }
</style>