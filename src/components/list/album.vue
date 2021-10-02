<template>
  <div :class="`list-albums ${className || ''}`">
    <div
      v-for="a in albums"
      :key="a.id"
      class="common-small-box"
    >
      <div
        class="box-img-container pointer"
        @click="goTo(a)"
      >
        <img
          v-error
          :src="`${a.picUrl}?param=200y200`"
        >
      </div>
      <div
        class="box-name pointer"
        @click="goTo(a)"
      >
        {{ a.name }}
      </div>
    </div>
    <div
      v-if="(albums || []).length === 0"
      class="text-center mt_40"
    >
      {{ emptyText || '没啥专辑哟' }}
    </div>
  </div>
</template>

<script>
  import { changeUrlQuery } from "../../utils/stringHelper";

  export default {
    name: "Album",
    props: {
      albums: Array,
      className: String,
      emptyText: String,
    },
    setup() {
      return {
        goTo({id, mid, platform}) {
          changeUrlQuery({
            id, mid, platform
          }, '#/album')
        },
      }
    }
  }
</script>

<style lang="scss">
  .list-albums {
    color: #fff9;
  }
</style>