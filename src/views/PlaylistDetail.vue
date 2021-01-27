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
  import { watch, ref, reactive } from 'vue';
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
      const state = mixInject(['setting', 'allList', 'playingList'])
      const route = useRoute();

      const [platform, id, listInfo] = [ref(''), ref(''), reactive({})];
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
          default: {
            const data = await queryPlayListDetail(aId);
            replaceObj(listInfo, data);
            break;
          }
        }
      }
      updateRouter([route.query.aId, state.playingList.trueList])


      watch(() => [route.query.aId, state.playingList.trueList], updateRouter);

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