<template>
  <div class="local-page">
    <playlist-info
      :list-info="{ list }"
    />
  </div>
</template>

<script>
  import PlaylistInfo from "../components/PlaylistInfo";
  import { mixInject } from "../utils/store/state";
  import { computed } from 'vue';
  import { loadLocalFile } from "../utils/store/action";

  export default {
    name: "Local",
    components: { PlaylistInfo },
    setup() {
      const state = mixInject(['allSongs', 'localFiles']);

      const list = computed(() => [...state.localFiles]);

      loadLocalFile();

      console.log(list);

      return {
        ...state,
        list,
      }
    }
  }
</script>

<style scoped>

</style>