<template>
  <div :class="`info-box-container ${className}`">
    <div class="pic-container">
      <div class="pic-content" v-error="errPic" :style="`background-image: url('${pic}')`" />
    </div>
    <div class="text-info">
      <div v-for="(item, index) in list" :key="`${id}-${index}`">
        <div v-if="item.text" :class="`text-content ${item.className}`">
          <i v-if="item.icon" :class="`iconfont ${item.icon}`" />
          <component
            :is="item.link ? 'a' : 'span'"
            v-if="isString(item.text)"
            :href="item.link"
            @click="onClick({ index, item })"
          >
            {{item.text}}
          </component>
          <span v-else>
            <component
              :is="t.link ? 'a' : 'span'"
              v-for="(t, j) in item.text"
              :key="`${t.text}-${j}`"
              :href="t.link"
              @click="onClick({ index, j, item: t })"
            >
              {{t.text}}
            </component>
          </span>
        </div>
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
  import { ref } from 'vue';
  export default {
    name: "InfoBox",
    props: {
      pic: {
        type: String,
        default: '',
      },
      className: {
        type: String,
        default: '',
      },
      errPic: {
        type: String,
        default: 'https://y.gtimg.cn/mediastyle/global/img/singer_300.png'
      },
      list: {
        type: Array,
        default: () => [],
      },
      onClick: {
        type: Function,
        default: () => {},
      }
    },
    setup() {
      return {
        id: ref(Math.random()),

        isString(text) {
          return (typeof text).toLowerCase() === 'string';
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .info-box-container {
    position: relative;
    font-size: 0;

    .pic-container {
      display: inline-block;
      background: #fff7;
      border-radius: 0 0 20px 0;
      font-size: 0;

      .pic-content {
        width: 230px;
        height: 230px;
        background-position: center;
        background-size: cover;
        border-radius: 0 0 20px 0;
        opacity: 0.8;
      }
    }
    .text-info {
      position: absolute;
      max-width: 210px;
      left: 170px;
      top: 12px;

      .text-content {
        background: #0006;
        padding: 8px;
        margin-bottom: 8px;
        word-break: break-all;
        font-size: 15px;
        border-radius: 5px;
        display: inline-block;
        transition: 0.3s;
        box-shadow: 0 0 15px #0000;
        transform: translate(0, 0);
        min-width: 60px;

        &.text-title {
          font-size: 18px;
          font-weight: bolder;
          background: #0009;
        }

        &.text-small {
          font-size: 12px;
          padding: 4px 8px;
        }


        &:hover {
          box-shadow: -5px 5px 20px #0003;
          transform: translate(4px, 0);
        }

        span {
          cursor: pointer;
        }

        .iconfont {
          margin-right: 8px;
          cursor: default !important;
        }
      }
    }
  }
</style>