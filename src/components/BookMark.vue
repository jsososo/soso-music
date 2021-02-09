<template>
  <div class="book-mark-container">
    <div
      v-for="(t, i) in tabs"
      :key="`${t.icon}-${i}`"
      :class="`tab-item-${i} c-${t.color} ${modelValue === t.val && 'selected'}`"
      @click="$emit('update:modelValue', t.val)"
    >
      <i :class="`iconfont icon-${t.icon}`" />
      {{t.text}}
    </div>
  </div>
</template>

<script>
  export default {
    name: "BookMark",
    props: {
      modelValue: String,
      tabs: Array,
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";
  /* 部分页面的书签式tab */
  .book-mark-container {
    position: absolute;
    left: -120px;
    color: #fff;

    @for $i from 0 to 10 {
      .tab-item-#{$i} {
        position: absolute;
        white-space: nowrap;
        overflow: hidden;
        right: -120px;
        top: #{$i * 45 + 15}px;
        width: 40px;
        padding: 5px;
        float: right;
        transition: 0.3s linear;
        box-sizing: border-box;
        box-shadow: -5px 5px 5px #0003;

        .iconfont {
          margin-right: 10px;
          transition: 0.3s linear;
        }
      }
    }

    @each $c,$v in $colors {
      .c-#{$c} {
        background: #0001;
        border-left: 5px solid #{$v}33;

        &:hover {
          background: #0001;
          width: 120px;
          cursor: pointer;
          color: #{$v}cc;

          &.selected {
            .iconfont {
              color: #{$v}cc;
            }
          }
          .iconfont {
            color: #{$v}cc;
          }
        }

        &.selected {
          background: #{$v}33;
        }
      }
    }
  }
</style>