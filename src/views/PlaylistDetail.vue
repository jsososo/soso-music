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
      const state = mixInject(['setting', 'allList'])
      const route = useRoute();

      const [platform, id, listInfo] = [ref(''), ref(''), reactive({})];
      const updateRouter = async (aId) => {
        if (!aId) {
          return;
        }
        const idArr = aId.split('_');
        idArr.length < 2 && idArr.unshift('');
        [platform.value, id.value] = idArr;
        switch (id.value) {
          case 'playing':
            break;
          default: {
            const data = await queryPlayListDetail(aId);
            replaceObj(listInfo, data);
            break;
          }
        }
      }
      updateRouter(route.query.aId)


      watch(() => route.query.aId, updateRouter);

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