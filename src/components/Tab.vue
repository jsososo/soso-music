<template>
  <div class="tab-type-container">
    <div
      v-for="item in tabs"
      :key="`type-${item.val}`"
      :class="`tab-type ${modelValue === item.val && 'selected'}`"
      @click="$emit('update:modelValue', item.val)"
    >
      <i :class="`iconfont color-${item.color} icon-${item.icon}`" />
      <span>{{item.text}}</span>
      <div class="bottom-border-container">
        <div :class="`bottom-border-content background-${item.color}`" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
  export default {
    name: "Tab",
    props: {
      modelValue: String,
      tabs: Array,
    }
  }
</script>

<style scoped lang="scss">
  .tab-type-container {
    border-bottom: 1px solid #fff3;
    .tab-type {
      display: inline-block;
      margin: 5px 10px;
      cursor: pointer;
      opacity: 0.6;
      transition: 0.3s;
      position: relative;
      text-align: center;


      &:hover {
        opacity: 0.9;

        .bottom-border-content {
          width: 100%;
          opacity: 0.8;
        }
      }
      &.selected {
        opacity: 0.9;

        .bottom-border-content {
          width: 100%;
          opacity: 1;
        }
      }
      .iconfont {
        font-weight: bold;
        padding-right: 4px;
      }
      .bottom-border-container {
        position: absolute;
        width: 140%;
        transform: translate(-20%, -9px);
      }
      .bottom-border-content {
        height: 3px;
        display: inline-block;
        width: 0;
        border-radius: 5px;
        /*transform: translate(0, 3px);*/
        transition: 0.3s;
      }
    }
  }
</style>