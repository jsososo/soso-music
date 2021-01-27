<template>
  <div class="downlaod-page">
    <page-title title="DOWNLOAD" />
    <tab v-model="type" :tabs="tabs" />
    <div class="download-list">
      <div
        v-for="(item, index) in list"
        :key="`${item.filename}-${index}`"
        :class="`download-item ${item.finished && (item.successed ? 'status-success' : 'status-fail')}`"
      >
        <div class="song-order">{{index + 1}}</div>
        <div class="inline-block" style="width: 45%">
          <div class="song-name">{{item.filename}}</div>
        </div>
        <div class="down-status">
          <span class="color-red" v-if="item.errMsg">{{item.errMsg}}</span>
          <span v-if="!item.finished && !item.waiting">{{item.progress}}%</span>
          <span v-if="item.waiting">waiting...</span>
        </div>
        <div class="song-bg" v-if="!item.finished && !item.waiting" :style="`transform: translateX(${item.progress - 100}%)`" />

        <el-tooltip class="item" effect="dark" content="重新下载" placement="left">
          <div class="re-down-btn"><i class="iconfont icon-download" /></div>
        </el-tooltip>

      </div>
    </div>
  </div>
</template>

<script>
  import PageTitle from "../components/PageTitle";
  import Tab from "../components/Tab";
  import { computed, ref } from 'vue';
  import {mixInject} from "../utils/store/state";

  export default {
    name: "Download",
    components: {
      PageTitle,
      Tab,
    },
    setup() {
      const state = mixInject(['downloadList']);

      const { downloadList } = state;

      const type = ref('all');

      const tabs = computed(() => ([
        {
          text: `全部（${downloadList.length}）`,
          val: 'all',
          color: 'blue',
        },
        {
          text: `下载中（${downloadList.filter((d) => !d.finished).length}）`,
          val: 'downloading',
          color: 'yellow',
        },
        {
          text: `成功（${downloadList.filter((d) => d.successed).length}）`,
          val: 'success',
          color: 'green',
        },
        {
          text: `失败（${downloadList.filter((d) => !d.successed && d.finished).length}）`,
          val: 'fail',
          color: 'red',
        }
      ]))

      const list = computed(() => downloadList.filter((d) => {
        switch (type.value) {
          case 'success':
            return d.successed;
          case 'fail':
            return !d.successed && d.finished;
          case 'downloading':
            return !d.finished;
          default:
            return true;
        }
      }))

      return {
        tabs,
        type,
        list,
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";
  .downlaod-page {
    .download-list {
      .download-item {
        height: 50px;
        width: 100%;
        overflow: hidden;
        position: relative;
        transition: 0.3s;
        opacity: 0.6;

        &:hover {
          opacity: 0.9;
        }

        &.status-success .song-name:before {
          background: $green;
        }
        &.status-fail .song-name:before {
          background: $red;
        }

        .song-order {
          position: absolute;
          font-weight: bold;
          font-size: 65px;
          color: #fff3;
          top: 0;
          pointer-events: none;
        }
        .song-name {
          line-height: 50px;
          display: inline-block;
          vertical-align: top;
          margin-left: 30px;
          position: relative;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;

          &:before {
            content: '';
            display: inline-block;
            position: absolute;
            width: calc(100% - 25px);
            background: #fff;
            opacity: 0.2;
            height: 15px;
            top:25px;
          }
        }

        .down-status {
          display: inline-block;
          width: 30%;
          line-height: 50px;
          font-size: 14px;
          padding-left: 8px;
        }

        .re-down-btn {
          float: right;
          font-size: 14px;
          cursor: pointer;
          line-height: 20px;
          margin-top: 15px;
          margin-right: 20px;

          .iconfont {
            padding-right: 6px;
          }
        }

        .song-bg {
          position: absolute;
          width: 100%;
          height: 50px;
          border-right: 2px solid #{$blue}99;
          background: linear-gradient(to left, #{$blue}33, #{$green}33 500px, #{$yellow}33 1000px);
          top: 0;
          left: 0;
        }
      }
    }
  }
</style>