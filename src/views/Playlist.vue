<template>
  <div class="page-right-container">
    <playlists :list="list" />
  </div>
</template>

<script>
  import Playlists from "../components/list/playlist";
  import {mixInject} from "../utils/store/state";
  import { computed } from 'vue';

  export default {
    name: "Playlist",
    components: {
      Playlists,
    },
    setup() {
      const state = mixInject(['user', 'setting']);
      const { user, setting } = state;

      const list = computed(() => user[setting.platform].playlist || []);



      return {
        ...state,
        list,
      }
    }
  }
</script>

<style scoped>

</style>