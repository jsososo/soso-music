<template>
  <page-right-container>
    <div v-if="route.path === '/playlist'" class="input-container">
      <div class="so-input input-line">
        <div class="input-content">
          <input
            v-model="inputId"
            :placeholder="{'163': '网易云账号id', 'qq': 'qq号/微信uin'}[setting.platform]"
          />
        </div>
        <div
          v-if="inputId !== uId && inputId"
          @click="setting[`store_${setting.platform}`] = inputId"
          class="update-btn"
        >更新</div>
        <div
          v-if="inputId === uId && inputId !== user[setting.platform].id && user[setting.platform].id"
          @click="setting[`store_${setting.platform}`] = user[setting.platform].id"
          class="update-btn"
        >我的</div>
      </div>
    </div>
    <div v-if="!uId && route.path === '/playlist'" class="text-center mt_40">登录或输入id</div>
    <playlists :list="list" />
  </page-right-container>
</template>

<script>
  import Playlists from "../components/list/playlist";
  import {mixInject} from "../utils/store/state";
  import { computed, reactive, watch, ref } from 'vue';
  import PageRightContainer from "../components/PageRightContainer";
  import { useRoute } from 'vue-router';
  import {getUserList, handlePlayLists, handleSongs} from "../utils/store/action";
  import {replaceObj} from "../utils/util";
  import request from "../utils/request";

  export default {
    name: "Playlist",
    components: {
      Playlists,
      PageRightContainer,
    },
    setup() {
      const state = mixInject(['user', 'setting']);
      const { user, setting } = state;

      const route = useRoute();

      const uId = computed(() => {
        const { platform } = setting;
        return setting[`store_${platform}`] || user[platform].id || '';
      })

      const inputId = ref('');

      const list = reactive([]);

      const getList = async () => {
        const { platform } = setting;

        inputId.value = uId.value;
        list.length = 0;

        let listIds = [];

        switch (route.path) {
          case '/playlist': {
            if (!uId.value) {
              return;
            }
            listIds = uId.value ? await getUserList({ id: uId.value, platform }): [];
            if (uId.value === user[platform].id) {
              const privateRadioId = `${platform}_privateRadio`
              handlePlayLists([{
                aId: privateRadioId,
                listId: privateRadioId,
                id: 'privateRadio',
                name: '私人电台',
                creator: {},
                platform: [],
                list: [],
              }])
              listIds.unshift(privateRadioId);
              replaceObj(list, listIds);

              request('DAILY_PLAYLIST', platform)
                .then(({ data = [] }) => {
                  const songIds = handleSongs(data);
                  const dailyId = `${platform}_daily`;
                  handlePlayLists([{
                    aId: dailyId,
                    id: 'daily',
                    listId: dailyId,
                    list: songIds,
                    name: '每日推荐',
                    trackCount: songIds.length,
                    platform,
                    creator: {},
                  }])
                  listIds.unshift(dailyId);
                  replaceObj(list, listIds);
                })
            }
            break;
          }
          case '/recommend': {
            const { data = [] } = await request('RECOMMEND_PLAYLIST', platform)
            listIds = handlePlayLists(data);
            break;
          }
        }
        replaceObj(list, listIds)
      }

      // 当平台、存储的账号变更时触发
      watch(
        () => [setting.store_qq, setting.store_163, setting.platform, route.path],
        getList,
        { immediate: true}
      )

      return {
        ...state,
        list,
        route,
        inputId,
        uId,
      }
    }
  }
</script>

<style scoped lang="scss">
  .so-input {
    .update-btn {
      padding: 6px 0;
      width: 60px;
      font-size: 14px;
      display: inline-block;
      border: 1px solid #fff3;
      border-radius: 10px;
      cursor: pointer;
      line-height: 20px;
      background: transparent;
      transition: 0.3s;
      text-align: center;
      letter-spacing: 4px;
      padding-left: 4px;
      margin-left: 5px;

      &:hover {
        animation: btnActive 0.8s;
      }

      @keyframes btnActive {
        0% {
          box-shadow: 0 0 0 #fff4;
        }
        100% {
          box-shadow: 0 0 15px 10px #fff0;
        }
      }
    }
  }
</style>