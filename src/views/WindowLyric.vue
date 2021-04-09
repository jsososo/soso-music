<template>
  <div
    @mouseleave="ignoreMouse(true, true)"
    :class="`win-lyric ${setting.ROWS === 1 && 'single'} ${!setting.LOCK && 'unlock'}`">
    <div
      class="opts-btn"
      @mouseover="ignoreMouse(false, true)"
      @mouseleave="ignoreMouse(true)"
    >
      <div class="btn-container">
        <span v-for="item in btnList" :key="item.key">
          <i v-if="!item.hide" :class="`iconfont icon-${item.icon}`" @click="handleOpt(item.key)" />
        </span>
      </div>
      <div class="more-opts" @mouseover="ignoreMouse(false)">
        <div v-if="openType === 'color'" @mouseenter="ignoreMouse(false)">
          <el-color-picker popper-class="color-picker-popper" v-model="setting.COLOR_1" :predefine="predefine" show-alpha size="mini" />
          <el-color-picker popper-class="color-picker-popper" v-model="setting.COLOR_2" :predefine="predefine" show-alpha size="mini" />
        </div>
        <div v-if="openType === 'fontSize'" class="font-size-slider" @mouseenter="ignoreMouse(false)">
          <el-slider :min="10" :max="40" :step="1" v-model="setting.FONT_SIZE" size="small" />
        </div>
      </div>
    </div>
    <!--  单行 & 翻译  -->
    <div
      v-if="setting.ROWS === 1 || setting.TRANS"
      class="single-lyric"
      :style="`text-align:${setting.TEXT_ALIGN || 'left'};`"
    >
      <div
        @mouseenter="ignoreMouse(false)"
        @mouseleave="ignoreMouse(true)"
        :style="`background-image:-webkit-linear-gradient(${setting.COLOR_ARROW || 'bottom'},${setting.COLOR_1}, ${setting.COLOR_2});
        font-size:${setting.FONT_SIZE}px;`"
        :class="`lyric-item lyric-0 actived ${!setting.TRANS && 'mt_15'}`"
      >
        <div v-if="info.list[info.index%2]">{{info.list[info.index%2].str}}</div>
      </div>
      <br />
      <div
        v-if="setting.TRANS"
        @mouseenter="ignoreMouse(false)"
        @mouseleave="ignoreMouse(true)"
        :style="`background-image:-webkit-linear-gradient(${setting.COLOR_ARROW || 'bottom'},${setting.COLOR_1}, ${setting.COLOR_2});
        font-size:${setting.FONT_SIZE}px;`"
        class="lyric-item lyric-0 actived"
      >
        <div v-if="info.list[info.index%2]">{{info.list[info.index%2].trans}}</div>
      </div>
    </div>
    <!--  多行  -->
    <div v-else>
      <div
        v-for="(item, index) in info.list"
        :key="item ? item.str : index"
      >
        <div
          @mouseenter="ignoreMouse(false)"
          @mouseleave="ignoreMouse(true)"
          :style="`background-image:-webkit-linear-gradient(${setting.COLOR_ARROW || 'bottom'},${setting.COLOR_1}, ${setting.COLOR_2});font-size:${setting.FONT_SIZE}px;`"
          :class="`lyric-item lyric-${index} ${(info.index % 2) === index && 'actived'}`"
        >
          <div v-if="item">{{item.str}}</div>
        </div>
    </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref, computed, watch, toRaw } from 'vue';
  import Storage from "../utils/Storage";
  import {ipcRenderer} from "electron";

  const win = require('electron').remote.getCurrentWindow()
  export default {
    name: "WindowLyric",
    setup() {
      const info = ref(Storage.get('soso_music_win_lyric', true, {
        index: 0,
        list: [],
        keys: [],
      }))

      window.addEventListener('storage', (e) => {
        if (e.key === 'soso_music_win_lyric') {
          info.value = JSON.parse(e.newValue);
        }
      })

      const setting = reactive(Storage.get('win_lyric_setting', true, {
        LOCK: false,
        COLOR_1: '#409EFF',
        COLOR_2: '#67C23A',
        FONT_SIZE: 30,
        ROWS: 2,
        COLOR_ARROW: 'bottom',
        TEXT_ALIGN: 'text-left',
        TRANS: false,
      }))

      const openType = ref('');

      watch(() => Object.values(setting), () => Storage.set('win_lyric_setting', toRaw(setting), true))

      const ignore = ref();

      // 是否忽略鼠标
      const ignoreMouse = (val, force) => {
        const ig = (val) => {
          win.autoFocus = win[val ? 'blur' : 'focus']();
          win.setIgnoreMouseEvents(val, { forward: true });
        }
        if (!force && setting.LOCK) {
          ig(true);
          return;
        }
        if (val) {
          ignore.value = setTimeout(() => {
            if (openType.value && !force) {
              return;
            }
            openType.value = '';
            ig(true)
          }, 500)
        } else {
          ignore.value && clearTimeout(ignore.value)
          ig(false);
        }
      }

      // 监听是否出现toolTip，如果出现那就不要忽略鼠标
      const showToolTip = () => {
        const opened = document.querySelector('[aria-hidden="false"]');
        if (opened) {
          ignoreMouse(false);
        }
        requestAnimationFrame(showToolTip)
      }

      showToolTip();

      const btnList = computed(() => [
        { icon: 'close', key: 'close', showLock: true },
        { icon: setting.LOCK ? 'lock' : 'unlock', key: 'lock', showLock: true },
        { icon: 'color', key: 'color' },
        { icon: setting.ROWS === 1 ? 'single' : 'doubble', key: 'rows' },
        { icon: setting.TRANS ? 'trans' : 'trans-1', key: 'trans' },
        { icon: setting.COLOR_ARROW === 'right' ? 'arrow-right-1' : 'arrow-down-1', key: 'colorArrow' },
        { icon: 'font', key: 'fontSize' },
        {
          icon: { left: 'text-left', center: 'text-center', right: 'text-right' }[setting.TEXT_ALIGN] || 'text-left',
          key: 'textAlign',
          hide: !(setting.ROWS === 1 || setting.TRANS)
        },
      ].filter(({ showLock }) => !setting.LOCK || showLock))

      return {
        predefine: ['#F56C6C', '#409EFF', '#67C23A', '#E6A23C', '#666666'],
        btnList,
        info,
        ignore,
        openType,
        setting,
        ignoreMouse,
        handleOpt(key) {
          switch (key) {
            case 'close':
              ipcRenderer.send('SHOW_LYRIC_WINDOW', false);
              break;
            case 'fontSize':
            case 'color':
              openType.value = openType.value === key ? '' : key;
              break;
            case 'lock':
              setting.LOCK = !setting.LOCK;
              break;
            case 'colorArrow':
              setting.COLOR_ARROW = setting.COLOR_ARROW === 'right' ? 'bottom' : 'right';
              break;
            case 'rows':
              setting.ROWS = setting.ROWS === 1 ? 2 : 1;
              break;
            case 'trans':
              setting.TRANS = !setting.TRANS;
              break;
            case 'textAlign': {
              const arr = ['left', 'center', 'right'];
              let i = arr.indexOf(setting.TEXT_ALIGN || 'left');
              i = (i >= (arr.length - 1)) ? 0 : (i + 1);
              setting.TEXT_ALIGN = arr[i];
              break;
            }
          }
        },
      }
    },
  }
</script>

<style lang="scss">
  .bg-img, .main-player-container, .page-left-nav, .page-top-nav {
    display: none;
  }
  .win-lyric {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: #000;
    font-size: 30px;

    &.unlock {
      .lyric-item {
        -webkit-app-region: drag !important;
      }
    }

    .lyric-item {
      -webkit-background-clip:text;
      font-weight: 900;
      -webkit-text-fill-color:transparent;
      white-space: nowrap;
      overflow: hidden;
      max-width: 60%;
      display: inline-block;
      cursor: default;
      opacity: 0.4;
      transition: 0.3s;
      user-select: none;

      &.actived {
        opacity: 0.7;
      }

      &.lyric-1 {
        margin-left: 40%;
      }
    }

    .single-lyric {
      .lyric-item {
        max-width: 100%;
      }
    }

    .opts-btn {
      display: inline-block;
      opacity: 0;
      transition: 0.3s;
      margin-top: -10px;
      margin-bottom: 20px;

      .iconfont {
        cursor: pointer;
        display: inline-block;
        color: #fff;
        text-shadow: 0 0 2px #000;
        padding: 5px;
        margin: 0 5px;
      }

    }

    &:hover {
      .opts-btn {
        opacity: 0.8;
      }
    }
    .more-opts {
      position: fixed;
      top: 34px;
      width: 100%;

      .font-size-slider {
        max-width: 40%;
      }
    }
  }
  .el-slider__button-wrapper {
    transform: translateX(-10px) translateY(-5px);
  }
  .color-picker-popper {
    transform: scale(0.8);
    transform-origin: 50% 0;
  }
</style>