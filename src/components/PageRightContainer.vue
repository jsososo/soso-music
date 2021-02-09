<template>
  <div :class="`page-right-container ${className}`">
    <slot name="extends" />
    <div class="page-right-content">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: "PageRightContainer",
    props: {
      className: String,
    },
  }
</script>

<style scoped lang="scss">
  .page-right-container {
    width: 50%;
    min-width: 425px;
    max-width: 750px;
    position: absolute;
    right: 0;
    height: 100%;
    top: 0;

    .page-right-content {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      background: #0001;
      border-left: 1px solid #fff5;
      &::-webkit-scrollbar
      {
        width: 0;
        height: 0;
      }
    }
  }
</style>