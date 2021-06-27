<template>
  <info-box
    v-if="playNow.al"
    :pic="playNow.al.picUrl"
    err-pic="https://y.gtimg.cn/mediastyle/global/img/album_300.png"
    :list="infoBoxList"
    :align="setting.MAIN_CONTENT === 'lyric' ? 'right' : 'left'"
  >
    <div :class="`platform-icons content-${setting.MAIN_CONTENT}`" >
      <el-tooltip class="item" effect="dark" content="信息" placement="top">
        <i :class="`iconfont icon-${playNow.platform} color-${playNow.platform} ${playNow.bPlatform ? 'op_3' : 'op_7'}`" />
      </el-tooltip>
      <el-tooltip v-if="playNow.bPlatform" class="item" effect="dark" content="音源" placement="top">
        <i @click="goFind()" :class="`iconfont op_7 icon-${playNow.bPlatform} color-${playNow.bPlatform}`" />
      </el-tooltip>
    </div>
    <div class="index-icon-content">
      <a href="#/" class="mg_10 iconfont icon-lyric">
        <i class="fake-icon iconfont icon-lyric" />
      </a>
      <a v-if="playNow.platform !== 'local'" href="#/comment" class="iconfont icon-comment mg_10">
        <i class="fake-icon iconfont icon-comment" />
        <span v-if="playNow.totalComments" style="font-weight: normal;vertical-align: 4px" class="pl_5 ft_12">{{numToStr(playNow.totalComments)}}</span>
      </a>
    </div>
    <div>

    </div>
  </info-box>
</template>

<script>
  import { mixInject } from "../utils/store/state";
  import InfoBox from "./InfoBox";
  import {computed} from "vue";
  import {changeUrlQuery, numToStr} from "../utils/stringHelper";

  export default {
    name: "MainInfo",
    components: { InfoBox },
    setup() {
      const state = mixInject(['playNow', 'setting'])

      const { playNow } = state;
      const infoBoxList = computed(() => ([
        { text: playNow.name, icon: 'icon-song' },
        {
          text: playNow.al.name,
          link: playNow.platform === 'local' ?
            null :
            changeUrlQuery({ id: playNow.al.id, mid: playNow.al.mid, platform: playNow.al.platform
            }, '#/album', false), icon: 'icon-album' },
        {
          text: playNow.ar.map(({ name, id, mid, platform }, i) =>
            ({
              text: `${name}${(i < playNow.ar.length - 1) ? '/' : ''}`,
              link: platform === 'local' ?
                null :
                changeUrlQuery({ id, mid, platform }, '#/singer', false)
            })).filter(({ text }) => text),
          icon: 'icon-singer'
        },
      ]))

      return {
        ...state,
        infoBoxList,
        numToStr,
        goFind() {
          window.location.href = `#/find?keyword=${playNow.name} ${(playNow.ar || []).map(({ name }) => name).join(' ')}`
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .platform-icons {
    position: absolute;
    top: 205px;

    &.content-lyric {
      right: 5px;
    }

    &.content-info {
      left: 5px;
    }

    .iconfont {
      padding: 5px;
    }
  }
</style>