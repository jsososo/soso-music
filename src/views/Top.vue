<template>
  <div class="top-page hide-scroll">
    <page-title title="TOP"/>
    <div class="cats-list">
      <div
        v-for="(top, index) in topList"
        :key="`top-${index}`"
      >
        <template v-if="top">
          <div class="top-cat-title">
            {{ top.title }}
          </div>
          <div
            v-for="item in top.list"
            :key="item.id"
            :class="`common-small-box ${selectedId === item.id && 'selected'}`"
          >
            <div
              class="box-img-container pointer"
              @click="selectedId = item.id"
            >
              <img
                v-error
                :src="`${item.cover}?param=200y200`"
              >
            </div>
            <div
              class="box-name pointer"
              @click="selectedId = item.id"
            >
              {{ item.name }}
            </div>
          </div>
        </template>
      </div>
    </div>
    <playlist-info
      :list-info="listInfo"
    />
  </div>
</template>

<script>
  import PageTitle from "../components/PageTitle";
  import PlaylistInfo from "../components/PlaylistInfo";
  import {mixInject} from "../utils/store/state";
  import {watch, reactive, ref} from 'vue';
  import request from "../utils/request";
  import {replaceObj} from "../utils/util";
  import {handleSongs} from "../utils/store/action";

  export default {
    name: "Top",
    components: {
      PageTitle,
      PlaylistInfo,
    },
    setup() {
      const state = mixInject(['setting', 'allList']);

      const {setting} = state;

      const selectedId = ref('');

      const topList = reactive([]);

      const listInfo = reactive({});

      watch(
        () => setting.platform,
        async () => {
          replaceObj(topList, {});
          const {data = []} = await request('TOP_CATEGORY', setting.platform).catch(() => ({}))
          replaceObj(topList, data);
        },
        {immediate: true},
      )

      watch(selectedId, async (id) => {
        const {data} = await request({
          api: 'TOP_SONGS',
          data: {id, _p: setting.platform}
        })
        data.list = handleSongs(data.list);

        if (id === selectedId.value) {
          replaceObj(listInfo, data)
        }

      })

      return {
        ...state,
        topList,
        selectedId,
        listInfo,
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .top-page {
    height: $mainHeight;

    .cats-list {
      height: 100%;
      width: 50%;
      min-width: calc(100% - 750px);

      .top-cat-title {
        font-size: 22px;
        color: #fff9;
        font-weight: bold;
        margin-top: 8px;
      }

      .common-small-box {
        margin-bottom: 0 !important;

        .box-img-container {
          border: 2px solid transparent;
        }

        &.selected {
          .box-img-container {
            border: 2px solid $blue;
          }
        }
      }
    }
  }
</style>