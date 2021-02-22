<template>
  <div>
    <playlist-info
      :id="id"
      :platform="platform"
      :list-id="route.query.aId"
      :list-info="listInfo"
    />
  </div>
</template>

<script>
  import { useRoute } from 'vue-router';
  import { watch, ref } from 'vue';
  import {mixInject} from "../utils/store/state";
  import { queryPlayListDetail } from "../utils/store/action";
  import PlaylistInfo from "../components/PlaylistInfo";
  import { replaceObj } from "../utils/util";

  export default {
    name: "PlaylistDetail",
    components: {
      PlaylistInfo,
    },
    setup() {
      const state = mixInject(['setting', 'allList', 'playingList', 'listInfo'])
      const route = useRoute();
      const { setting, allList, playingList, listInfo } = state;

      const [platform, id] = [ref(''), ref('')];
      const updateRouter = async ([aId, trueList]) => {
        if (!aId) {
          return;
        }
        const idArr = aId.split('_');
        idArr.length < 2 && idArr.unshift('');
        [platform.value, id.value] = idArr;
        switch (id.value) {
          case 'playing':
            replaceObj(listInfo, { list: trueList, aId: '_playing' })
            break;
          case 'daily':
            replaceObj(listInfo, { list: (allList[`${setting.platform}_daily`] || {}).list || [], aId: `${setting.platform}_daily` });
            break;
          default: {
            replaceObj(listInfo, allList[aId] || {});
            const data = await queryPlayListDetail(aId);
            replaceObj(listInfo, data);
            break;
          }
        }
      }
      updateRouter([route.query.aId, playingList.trueList])

      watch(() => [route.query.aId, playingList.trueList], updateRouter);

      return {
        ...state,
        route,
        listInfo,
        platform,
        id,
      }
    },
  }
</script>

<style scoped lang="scss">

</style>