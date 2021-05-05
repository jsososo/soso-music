<template>
  <div
    :class="`win-lyric ${setting.ROWS === 1 && 'single'} ${!setting.LOCK && 'unlock'}`">
    <div
      class="opts-btn"
    >
      <div class="btn-container">
        <span v-for="item in btnList" :key="item.key">
          <i v-if="!item.hide" :class="`iconfont icon-${item.icon}`" @click="handleOpt(item.key)" />
        </span>
      </div>
      <div class="more-opts">
        <div v-if="openType === 'color'">
          <el-color-picker popper-class="color-picker-popper" v-model="setting.COLOR_1" :predefine="predefine" show-alpha size="mini" />
          <el-color-picker popper-class="color-picker-popper" v-model="setting.COLOR_2" :predefine="predefine" show-alpha size="mini" />
        </div>
        <div v-if="openType === 'fontSize'" class="font-size-slider">
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
        :style="`background-image:-webkit-linear-gradient(${setting.COLOR_ARROW || 'bottom'},${setting.COLOR_1}, ${setting.COLOR_2});
        font-size:${setting.FONT_SIZE}px;`"
        class="lyric-item lyric-0 actived"
      >
        <div v-if="info.list[info.index%2]" v-html="info.list[info.index%2].str" />
      </div>
      <br />
      <div
        v-if="setting.TRANS"
        :style="`background-image:-webkit-linear-gradient(${setting.COLOR_ARROW || 'bottom'},${setting.COLOR_1}, ${setting.COLOR_2});
        font-size:${setting.FONT_SIZE}px;`"
        class="lyric-item lyric-0 actived"
      >
        <div v-if="info.list[info.index%2]" v-html="info.list[info.index%2].trans" />
      </div>
    </div>
    <!--  多行  -->
    <div v-else>
      <div
        v-for="(item, index) in info.list"
        :key="item ? item.str : index"
      >
        <div
          :style="`background-image:-webkit-linear-gradient(${setting.COLOR_ARROW || 'bottom'},${setting.COLOR_1}, ${setting.COLOR_2});font-size:${setting.FONT_SIZE}px;`"
          :class="`lyric-item lyric-${index} ${(info.index % 2) === index && 'actived'}`"
        >
          <div v-if="item" v-html="item.str" />
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

      const handleUpdateStorage = (e) => {
        if (e.key === 'soso_music_win_lyric') {
          info.value = JSON.parse(e.newValue);
        }
        if (e.key === 'win_lyric_setting') {
          Object.assign(setting, Storage.get('win_lyric_setting', true));
        }
      }
      window.addEventListener('storage', handleUpdateStorage)

      const setSize = (init) => {
        const { x, y, width } = win.getBounds();
        let newY = y;
        if (init === true) {
          newY = y * 2 + 162;
        }
        win.setBounds({ x, y: newY, width });
        setting.width = width;
        setting.x = x;
        setting.y = y;
      }
      win.on('move', setSize);
      win.on('resize', setSize);

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

      if (!setting.y) {
        win.center();
        setSize(true);
      } else {
        const { x, y, width } = setting;
        win.setBounds({ x, y, width });
      }

      const openType = ref('');

      watch(setting, () => Storage.set('win_lyric_setting', toRaw(setting), true), { deep: true })

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
      ])

      watch(() => [setting.FONT_SIZE, setting.LOCK, setting.ROWS, setting.TRANS, openType.value], (
        [ft, lock, rows, trans, open]
      ) => {
        let width = win.getSize()[0];
        if (openType.value === 'fontSize') {
          width = Math.max(40 * 30, 40 * ft);
        }
        const r = trans ? 2 : rows;
        let height = r * (ft * 1.2 + 20) + 60 + ({ fontSize: 20, color: 130 }[open] || 0)
        win.setSize(width, Math.floor(height));
        win.setIgnoreMouseEvents(lock)
        lock && (openType.value = '');
      }, { immediate: true })

      return {
        predefine: ['#F56C6C', '#409EFF', '#67C23A', '#E6A23C', '#666666'],
        btnList,
        info,
        openType,
        setting,
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
    width: calc(100% - 50px);
    height: 100%;
    color: #000;
    font-size: 30px;
    transition: 0.3s;
    padding: 0 24px;
    border-radius: 12px;
    box-sizing: content-box;

    .btn-container {
      visibility: hidden;
    }

    &.unlock {
      .btn-container {
        visibility: visible;
      }
      .lyric-item {
        -webkit-app-region: drag !important;
        cursor: move;
      }

      &:hover {
        background: #0003;
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