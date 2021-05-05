<template>
  <div>
    <main-info v-if="setting.MAIN_CONTENT === 'lyric'" />
    <lyric v-else />
  </div>
</template>

<script>
  import Lyric from "../components/Lyric";
  import MainInfo from "../components/MainInfo";
  import { mixInject } from "../utils/store/state";

  export default {
    name: "Index",
    components: {
      Lyric,
      MainInfo,
    },
    setup() {
      return {
        ...mixInject(['setting'])
      }
    }
  }
</script>

<style scoped>

</style>