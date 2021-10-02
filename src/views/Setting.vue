<template>
  <div class="setting-page">
    <page-title title="SETTING"/>
    <Tab
      v-model="setting.tab"
      :tabs="tabList"
    />
    <div class="setting-content pt_15">
      <div v-if="setting.tab === 'default'">
        <setting-line label="服务端口">
          <input
            v-model="serverPort"
            placeholder="1000 ~ 9999"
            type="text"
          >
          <el-button
            v-if="serverPort !== setting.SERVER_PORT"
            size="small"
            class="ml_15"
            @click="savePort"
          >
            重启
          </el-button>
        </setting-line>
        <setting-line label="性能模式">
          <el-switch v-model="setting.PERFORMANCE_MODE"/>
        </setting-line>
        <setting-line label="订阅测试版">
          <el-switch v-model="setting.SUBSCRIBE_TEST_VERSION"/>
        </setting-line>
        <setting-line label="资源替换">
          <div
            class="input-txt-info"
            @click="goTo('#/find')"
          >
            前往设置
          </div>
        </setting-line>
        <setting-line
          v-if="setting.PERFORMANCE_MODE"
          label="看见音乐"
        >
          <el-switch v-model="setting.DRAW_MUSIC"/>
        </setting-line>

        <template v-if="setting.DRAW_MUSIC && setting.PERFORMANCE_MODE">
          <setting-line label="频谱设置">
            <el-radio-group
              v-model="setting.DRAW_MUSIC_TYPE"
              size="small"
            >
              <el-radio-button label="1">
                低频 => 高频
              </el-radio-button>
              <el-radio-button label="2">
                高频 => 低频 => 高频
              </el-radio-button>
            </el-radio-group>
          </setting-line>
          <setting-line label="音频样式">
            <el-radio-group
              v-model="setting.DRAW_MUSIC_STYLE"
              size="small"
            >
              <el-radio-button label="rect">
                柱状图
              </el-radio-button>
              <el-radio-button label="line">
                曲线
              </el-radio-button>
              <el-radio-button label="particle">
                泡泡
              </el-radio-button>
              <el-radio-button label="circle">
                圈圈
              </el-radio-button>
              <el-radio-button label="circle2">
                海螺
              </el-radio-button>
              <el-radio-button label="voice">
                音柱
              </el-radio-button>
            </el-radio-group>
          </setting-line>
        </template>
        <!--        <div class="input-line">-->
        <!--          <div class="input-label">播放格式：</div>-->
        <!--          <div class="input-content">-->
        <!--            <el-radio-group v-model="setting.DOWN_SIZE" size="small">-->
        <!--              <el-radio-button label="128">128k</el-radio-button>-->
        <!--              <el-radio-button label="320">320k</el-radio-button>-->
        <!--              <el-radio-button label="flac">无损</el-radio-button>-->
        <!--            </el-radio-group>-->
        <!--            <div class="explain">-->
        <!--              网易云非会员可能无法播放无损格式，任何无法播放对应格式的歌曲会向下获取音质-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
        <setting-line label="默认列表">
          <el-radio-group
            v-model="setting.INIT_LIST"
            size="small"
          >
            <el-radio-button label="0">
              推荐歌单
            </el-radio-button>
            <el-radio-button label="1">
              上次播放
            </el-radio-button>
            <el-radio-button label="2">
              网易云日推
            </el-radio-button>
          </el-radio-group>
        </setting-line>
        <setting-line label="缓存文件">
          {{ cacheSize }}
          <el-button
            class="ml_20"
            size="mini"
            @click="clearCache"
          >
            清除
          </el-button>
        </setting-line>
        <setting-line label="恢复默认">
          <el-button
            type="danger"
            @click="resetSetting"
          >
            恢复默认设置
          </el-button>
        </setting-line>
      </div>

      <div
        v-if="setting.tab === 'style'"
        class="style-tab-content"
      >
        <setting-line label="主区域内容">
          <el-radio-group
            v-model="setting.MAIN_CONTENT"
            size="small"
          >
            <el-radio-button label="info">
              歌曲信息
            </el-radio-button>
            <el-radio-button label="lyric">
              歌词
            </el-radio-button>
          </el-radio-group>
        </setting-line>
        <setting-line label="自定义背景">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onChangeBgImg"
          >
            <div :class="`upload-box ${bgInfo.img ? 'has-img' : ''}`">
              <img
                class="preview-bg"
                :src="bgInfo.img"
              >
              <div class="cover">
                <i class="el-icon-plus"/>
              </div>
            </div>
            <el-button
              v-if="bgInfo.img"
              class="del-bg-btn"
              type="danger"
              @click="delBg"
            >
              删除
            </el-button>
          </el-upload>
        </setting-line>
        <setting-line label="背景模糊">
          <el-slider
            v-model="bgInfo.blur"
            :min="0"
            :max="100"
            :step="1"
          />
        </setting-line>
        <setting-line label="背景亮度">
          <el-slider
            v-model="bgInfo.brightness"
            :min="0"
            :max="100"
            :step="1"
          />
        </setting-line>
        <setting-line label="背景灰度">
          <el-slider
            v-model="bgInfo.grayscale"
            :min="0"
            :max="100"
            :step="1"
          />
        </setting-line>
        <!--        <div class="input-line">-->
        <!--          <div class="input-label">背景褐度：</div>-->
        <!--          <div class="input-content">-->
        <!--            <el-slider :min="0" :max="100" :step="1" v-model="bgInfo.sepia" />-->
        <!--          </div>-->
        <!--        </div>-->
        <setting-line label="背景对比度">
          <el-slider
            v-model="bgInfo.contrast"
            :min="50"
            :max="300"
            :step="1"
          />
        </setting-line>
        <setting-line label="背景饱和度">
          <el-slider
            v-model="bgInfo.saturate"
            :min="50"
            :max="300"
            :step="1"
          />
        </setting-line>
      </div>

      <div v-if="setting.tab === 'download'">
        <setting-line label="下载路径">
          <div
            class="input-txt-info"
            @click="selectDir"
          >
            {{ setting.DOWN_DIR || '选择地址' }}
          </div>
        </setting-line>
        <setting-line label="下载格式">
          <el-radio-group
            v-model="setting.DOWN_SIZE"
            size="small"
          >
            <el-radio-button label="128">
              128k
            </el-radio-button>
            <el-radio-button label="320">
              320k
            </el-radio-button>
            <el-radio-button label="flac">
              无损
            </el-radio-button>
          </el-radio-group>
          <div class="explain">
            网易云非会员可能无法下载无损格式，任何无法下载对应格式的歌曲会向下获取音质
          </div>
        </setting-line>
        <setting-line label="歌曲名">
          <el-radio-group
            v-model="setting.DOWN_NAME"
            size="small"
          >
            <el-radio-button label="1">
              歌手-歌名
            </el-radio-button>
            <el-radio-button label="2">
              歌名-歌手
            </el-radio-button>
            <el-radio-button label="3">
              歌名
            </el-radio-button>
          </el-radio-group>
        </setting-line>
        <setting-line label="下载歌词">
          <el-switch v-model="setting.DOWN_LYRIC"/>
        </setting-line>
        <setting-line label="歌词翻译">
          <el-switch v-model="setting.DOWN_TRANS"/>
        </setting-line>
      </div>

      <div v-if="setting.tab === 'user'">
        <div class="input-line">
          <div class="input-label"/>
          <div class="input-content">
            登陆任意平台即代表完成登陆 & 账号绑定操作，更换登陆账号即代表重新绑定
          </div>
        </div>
        <setting-line label="混合账号昵称">
          <input
            v-model="mixNick"
            type="text"
            style="width: 200px"
          >
          <el-button
            v-if="mixNick && mixNick !== user.soso.nick"
            size="small"
            class="ml_15"
            @click="saveUser({ nick: mixNick }, 'MIX_USER_UPDATE')"
          >
            更新
          </el-button>
        </setting-line>
        <setting-line label="混合账号邮箱">
          <input
            v-model="mixEmail"
            type="text"
            style="width: 200px"
          >
          <el-button
            v-if="mixEmail && mixEmail !== user.soso.email"
            size="small"
            class="ml_15"
            @click="saveUser({ email: mixEmail }, 'MIX_USER_UPDATE')"
          >
            更新
          </el-button>
        </setting-line>
        <setting-line label="绑定网易云">
          <input
            v-if="user.soso.netId"
            v-model="user.soso.netId"
            type="text"
            style="width: 200px"
            disabled
          >
          <span v-else>未绑定</span>
          <block v-if="user['163'].logined && user.soso.netId !== `163_${user['163'].id}`">
            <input
              disabled
              style="width: 200px"
              :value="`qq_${user['163'].id}`"
              type="text"
              class="ml_20"
            >
            <el-button
              size="small"
              class="ml_10"
              @click="saveUser({ netId: `163_${user['163'].id}` }, 'MIX_USER_BIND')"
            >
              绑定这个
            </el-button>
          </block>
        </setting-line>
        <setting-line label="绑定QQ">
          <input
            v-if="user.soso.qqId"
            v-model="user.soso.qqId"
            type="text"
            style="width: 200px"
            disabled
          >
          <span v-else>未绑定</span>
          <block v-if="user.qq.logined && user.soso.qqId !== `qq_${user.qq.id}`">
            <input
              disabled
              style="width: 200px"
              :value="`qq_${user.qq.id}`"
              type="text"
              class="ml_20"
            >
            <el-button
              size="small"
              class="ml_10"
              @click="saveUser({ qqId: `qq_${user.qq.id}` }, 'MIX_USER_BIND')"
            >
              绑定这个
            </el-button>
          </block>
        </setting-line>
      </div>

      <div v-if="setting.tab === 'lyric'">
        <setting-line label="重置歌词">
          <el-button
            size="small"
            type="primary"
            @click="resetWinLyric"
          >
            恢复默认设置
          </el-button>
        </setting-line>
        <setting-line label="歌词颜色1">
          <el-color-picker
            v-model="winLyricSetting.COLOR_1"
            popper-class="color-picker-popper"
            :predefine="predefineColor"
            show-alpha
            size="mini"
          />
        </setting-line>
        <setting-line label="歌词颜色2">
          <el-color-picker
            v-model="winLyricSetting.COLOR_2"
            popper-class="color-picker-popper"
            :predefine="predefineColor"
            show-alpha
            size="mini"
          />
        </setting-line>
        <setting-line label="渐变色方向">
          <el-radio-group
            v-model="winLyricSetting.COLOR_ARROW"
            size="small"
          >
            <el-radio-button label="right">
              左右
            </el-radio-button>
            <el-radio-button label="bottom">
              上下
            </el-radio-button>
          </el-radio-group>
        </setting-line>
        <setting-line label="字体大小">
          <el-slider
            v-model="winLyricSetting.FONT_SIZE"
            :min="10"
            :max="40"
            :step="1"
            size="small"
          />
        </setting-line>
        <setting-line label="显示翻译">
          <el-switch v-model="winLyricSetting.TRANS"/>
        </setting-line>
        <setting-line
          v-if="!winLyricSetting.TRANS"
          label="行数显示"
        >
          <el-radio-group
            v-model="winLyricSetting.ROWS"
            size="small"
          >
            <el-radio-button :label="1">
              单行
            </el-radio-button>
            <el-radio-button :label="2">
              双行
            </el-radio-button>
          </el-radio-group>
        </setting-line>
        <setting-line
          v-if="winLyricSetting.TRANS || (!winLyricSetting.TRANS && (winLyricSetting.ROWS === 1))"
          label="文本位置"
        >
          <el-radio-group
            v-model="winLyricSetting.TEXT_ALIGN"
            size="small"
          >
            <el-radio-button label="left">
              居左
            </el-radio-button>
            <el-radio-button label="center">
              居中
            </el-radio-button>
            <el-radio-button label="right">
              居右
            </el-radio-button>
          </el-radio-group>
        </setting-line>
        <div class="mt_10"/>
        <setting-line label="预览">
          <div :style="`text-align: ${winLyricSetting.TEXT_ALIGN};width: 60%;`">
            <div
              :style="lyricStyle"
              class="lyric-item"
            >
              soso 音乐
            </div>
            <br>
            <div
              v-if="winLyricSetting.TRANS"
              :style="lyricStyle"
              class="lyric-item"
            >
              soso music
            </div>
            <div
              v-if="!winLyricSetting.TRANS && (winLyricSetting.ROWS > 1)"
              :style="`${lyricStyle}margin-left: 30%;`"
              class="lyric-item"
            >
              soso music
            </div>
          </div>
        </setting-line>
      </div>
    </div>
  </div>
</template>

<script>
  import PageTitle from "../components/PageTitle";
  import Tab from "../components/Tab";
  import {ref, computed} from 'vue';
  import {mixInject} from "../utils/store/state";
  import {ElMessage} from 'element-plus';
  import {ipcRenderer} from 'electron';
  import request from "../utils/request";
  import {mixDomain as domain} from "../utils/store/action";
  import {numToStr} from "../utils/stringHelper";
  import Storage from "../utils/Storage";
  import {resetWinLyric, predefineColor, setting as winLyricSetting} from "../utils/winLyric";
  import SettingLine from '../components/SettingLine';

  export default {
    name: "Setting",
    components: {
      PageTitle,
      Tab,
      SettingLine,
    },
    setup() {
      const state = mixInject(['setting', 'user', 'bgInfo']);

      const { setting, user, bgInfo } = state;

      const serverPort = ref(setting.SERVER_PORT);

      const mixNick = ref(user.soso.nick || '');
      const mixEmail = ref(user.soso.email || '');
      const cacheSize = ref('');

      ipcRenderer.send('GET_CACHE_SIZE')
      ipcRenderer.on('REPLY_CACHE_SIZE', (e, v) => cacheSize.value = `${numToStr(v)}b`.toUpperCase());

      const lyricStyle = computed(() => `background-image:-webkit-linear-gradient(${winLyricSetting.COLOR_ARROW || 'bottom'},${winLyricSetting.COLOR_1}, ${winLyricSetting.COLOR_2});
        font-size:${winLyricSetting.FONT_SIZE}px;`)
      return {
        ...state,
        predefineColor,
        winLyricSetting,
        lyricStyle,
        tabList: [
          {
            val: 'default',
            color: 'blue',
            icon: 'setting',
            text: '常规',
          },
          {
            val: 'style',
            color: 'yellow',
            icon: 'color',
            text: '样式',
          },
          {
            val: 'download',
            color: 'red',
            icon: 'download',
            text: '下载',
          },
          {
            val: 'lyric',
            color: 'cyan',
            icon: 'lyric',
            text: '歌词',
          },
          {
            val: 'user',
            color: 'green',
            icon: 'user',
            text: '账号',
          },
        ],
        serverPort,
        mixNick,
        mixEmail,
        savePort() {
          const port = Number(serverPort.value)
          if (isNaN(port) || port < 1000 || port > 9999) {
            return ElMessage.error('请输入 1000 ～ 9999 数字');
          }
          setting.SERVER_PORT = serverPort.value;
        },

        selectDir() {
          ipcRenderer.send('SHOW_SELECT_DIR', { type: 'download' });
        },

        async saveUser(params, api) {
          params.id = user.soso.id;
          const { data } = await request({
            api,
            domain,
            data: params,
          })
          user.soso = {
            ...data,
            logined: true,
          }
        },

        cacheSize,

        clearCache() {
          ipcRenderer.send('CLEAR_CACHE')
        },

        onChangeBgImg(file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            bgInfo.img = e.target.result;
          };
          if (file.size/1024/1024>2) {
            return ElMessage.error('请选择 2M 以内的图片');
          }
          reader.readAsDataURL(file.raw);
        },

        delBg(e) {
          e.preventDefault();
          e.stopPropagation();
          bgInfo.img = '';
        },

        resetSetting() {
          Storage.set('soso_music_setting', '');
          location.reload();
        },

        goTo(url) {
          window.location.href = url;
        },

        resetWinLyric,
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .setting-page {
    .el-slider {
      width: 240px;
    }

    input {
      background: #fff3;
      padding: 6px;
      outline: none;
      border: none;
      border-radius: 5px;
      color: #fffc;
      font-size: 16px;
      width: 100px;
    }

    .style-tab-content {
      .upload-box {
        text-align: center;
        height: 100px;
        width: 100px;
        overflow: hidden;
        border: 1px dashed #fff7;
        position: relative;
        display: inline-block;

        &.has-img {
          .cover {
            background: #0008;
            opacity: 0;
          }
        }
        .cover {
          position: absolute;
          background: #0000;
          width: 100px;
          height: 100px;
          top: 0;
          left: 0;
          line-height: 100px;
          opacity: 1;
          transition: 0.3s;
        }
        &:hover {
          border-color: $blue;
          .cover {
            opacity: 1;
            color: $blue;
          }
        }
        .preview-bg {
          height: 100px;
        }
      }

      .del-bg-btn {
        vertical-align: 10px;
        margin-left: 24px;
      }

    }
  }

  .lyric-item {
    -webkit-background-clip: text;
    font-weight: 900;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    max-width: 60%;
    display: inline-block;
    cursor: default;
    line-height: 1.4em;
    opacity: 0.7;
    transition: 0.3s;
    user-select: none;
  }
</style>