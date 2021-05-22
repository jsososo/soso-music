<template>
  <div class="setting-page">
    <page-title title="SETTING" />
    <Tab v-model="setting.tab" :tabs="tabList" />
    <div class="setting-content pt_15">
      <div v-if="setting.tab === 'default'">
        <div class="input-line">
          <div class="input-label">服务端口：</div>
          <div class="input-content">
            <input placeholder="1000 ~ 9999" type="text" v-model="serverPort" />
            <el-button v-if="serverPort !== setting.SERVER_PORT" size="small" class="ml_15" @click="savePort">重启</el-button>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">性能模式：</div>
          <div class="input-content">
            <el-switch v-model="setting.PERFORMANCE_MODE" />
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">订阅测试版：</div>
          <div class="input-content">
            <el-switch v-model="setting.SUBSCRIBE_TEST_VERSION" />
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">资源替换：</div>
          <div class="input-content">
            <div class="input-txt-info" @click="goTo('#/find')">前往设置</div>
          </div>
        </div>

        <div class="input-line" v-if="setting.PERFORMANCE_MODE">
          <div class="input-label">看见音乐：</div>
          <div class="input-content">
            <el-switch v-model="setting.DRAW_MUSIC" />
          </div>
        </div>
        <template v-if="setting.DRAW_MUSIC && setting.PERFORMANCE_MODE">
          <div class="input-line">
            <div class="input-label">频谱设置：</div>
            <div class="input-content">
              <el-radio-group size="small" v-model="setting.DRAW_MUSIC_TYPE">
                <el-radio-button label="1">低频 => 高频</el-radio-button>
                <el-radio-button label="2">高频 => 低频 => 高频</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="input-line">
            <div class="input-label">音频样式：</div>
            <div class="input-content">
              <el-radio-group size="small" v-model="setting.DRAW_MUSIC_STYLE">
                <el-radio-button label="rect">柱状图</el-radio-button>
                <el-radio-button label="line">曲线</el-radio-button>
                <el-radio-button label="particle">泡泡</el-radio-button>
                <el-radio-button label="circle">圈圈</el-radio-button>
                <el-radio-button label="circle2">海螺</el-radio-button>
                <el-radio-button label="voice">音柱</el-radio-button>
              </el-radio-group>
            </div>
          </div>
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
        <div class="input-line">
          <div class="input-label">默认列表：</div>
          <div class="input-content">
            <el-radio-group size="small" v-model="setting.INIT_LIST">
              <el-radio-button label="0">推荐歌单</el-radio-button>
              <el-radio-button label="1">上次播放</el-radio-button>
              <el-radio-button label="2">网易云日推</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="input-line">
          <div class="input-label">缓存文件：</div>
          <div class="input-content">
            {{cacheSize}}
            <el-button class="ml_20" @click="clearCache" size="mini">清除</el-button>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">恢复默认：</div>
          <div class="input-content">
            <el-button type="danger" @click="resetSetting">恢复默认设置</el-button>
          </div>
        </div>
      </div>

      <div v-if="setting.tab === 'style'" class="style-tab-content">
        <div class="input-line">
          <div class="input-label">主区域内容：</div>
          <div class="input-content">
            <el-radio-group size="small" v-model="setting.MAIN_CONTENT">
              <el-radio-button label="info">歌曲信息</el-radio-button>
              <el-radio-button label="lyric">歌词</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">自定义背景：</div>
          <div class="input-content">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="onChangeBgImg"
            >
              <div :class="`upload-box ${bgInfo.img ? 'has-img' : ''}`">
                <img class="preview-bg" :src="bgInfo.img" />
                <div class="cover">
                  <i class="el-icon-plus" />
                </div>
              </div>
              <el-button @click="delBg" v-if="bgInfo.img" class="del-bg-btn" type="danger">删除</el-button>
            </el-upload>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">背景模糊：</div>
          <div class="input-content">
            <el-slider :min="0" :max="100" :step="1" v-model="bgInfo.blur" />
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">背景亮度：</div>
          <div class="input-content">
            <el-slider :min="0" :max="100" :step="1" v-model="bgInfo.brightness" />
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">背景灰度：</div>
          <div class="input-content">
            <el-slider :min="0" :max="100" :step="1" v-model="bgInfo.grayscale" />
          </div>
        </div>

<!--        <div class="input-line">-->
<!--          <div class="input-label">背景褐度：</div>-->
<!--          <div class="input-content">-->
<!--            <el-slider :min="0" :max="100" :step="1" v-model="bgInfo.sepia" />-->
<!--          </div>-->
<!--        </div>-->

        <div class="input-line">
          <div class="input-label">背景对比度：</div>
          <div class="input-content">
            <el-slider :min="50" :max="300" :step="1" v-model="bgInfo.contrast" />
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">背景饱和度：</div>
          <div class="input-content">
            <el-slider :min="50" :max="300" :step="1" v-model="bgInfo.saturate" />
          </div>
        </div>
      </div>

      <div v-if="setting.tab === 'download'">
        <div class="input-line">
          <div class="input-label">下载路径：</div>
          <div class="input-content">
            <div class="input-txt-info" @click="selectDir">{{setting.DOWN_DIR || '选择地址'}}</div>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">下载格式：</div>
          <div class="input-content">
            <el-radio-group v-model="setting.DOWN_SIZE" size="small">
              <el-radio-button label="128">128k</el-radio-button>
              <el-radio-button label="320">320k</el-radio-button>
              <el-radio-button label="flac">无损</el-radio-button>
            </el-radio-group>
            <div class="explain">
              网易云非会员可能无法下载无损格式，任何无法下载对应格式的歌曲会向下获取音质
            </div>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">歌曲名：</div>
          <div class="input-content">
            <el-radio-group v-model="setting.DOWN_NAME" size="small">
              <el-radio-button label="1">歌手-歌名</el-radio-button>
              <el-radio-button label="2">歌名-歌手</el-radio-button>
              <el-radio-button label="3">歌名</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="input-line">
          <div class="input-label">下载歌词：</div>
          <div class="input-content">
            <el-switch v-model="setting.DOWN_LYRIC" />
          </div>
        </div>

        <div class="input-line" v-if="setting.DOWN_LYRIC">
          <div class="input-label">歌词翻译：</div>
          <div class="input-content">
            <el-switch v-model="setting.DOWN_TRANS" />
          </div>
        </div>

      </div>

      <div v-if="setting.tab === 'user'">
        <div class="input-line">
          <div class="input-label" />
          <div class="input-content">
            登陆任意平台即代表完成登陆 & 账号绑定操作，更换登陆账号即代表重新绑定
          </div>
        </div>
        <div class="input-line">
          <div class="input-label">混合账号昵称：</div>
          <div class="input-content">
            <input type="text" style="width: 200px" v-model="mixNick" />
            <el-button v-if="mixNick && mixNick !== user.soso.nick" size="small" class="ml_15" @click="saveUser({ nick: mixNick }, 'MIX_USER_UPDATE')">更新</el-button>
          </div>
        </div>
        <div class="input-line">
          <div class="input-label">混合账号邮箱：</div>
          <div class="input-content">
            <input type="text" style="width: 200px" v-model="mixEmail" />
            <el-button v-if="mixEmail && mixEmail !== user.soso.email" size="small" class="ml_15" @click="saveUser({ email: mixEmail }, 'MIX_USER_UPDATE')">更新</el-button>
          </div>
        </div>
        <div class="input-line">
          <div class="input-label">绑定网易云：</div>
          <div class="input-content">
            <input v-if="user.soso.netId" type="text" style="width: 200px" disabled v-model="user.soso.netId" />
            <span v-else>未绑定</span>
            <block v-if="user['163'].logined && user.soso.netId !== `163_${user['163'].id}`">
              <input disabled style="width: 200px" :value="`qq_${user['163'].id}`" type="text" class="ml_20" />
              <el-button size="small" class="ml_10" @click="saveUser({ netId: `163_${user['163'].id}` }, 'MIX_USER_BIND')">绑定这个</el-button>
            </block>
          </div>
        </div>
        <div class="input-line">
          <div class="input-label">绑定QQ：</div>
          <div class="input-content">
            <input v-if="user.soso.qqId" type="text" style="width: 200px" disabled v-model="user.soso.qqId" />
            <span v-else>未绑定</span>
            <block v-if="user.qq.logined && user.soso.qqId !== `qq_${user.qq.id}`">
              <input disabled style="width: 200px" :value="`qq_${user.qq.id}`" type="text" class="ml_20" />
              <el-button size="small" class="ml_10" @click="saveUser({ qqId: `qq_${user.qq.id}` }, 'MIX_USER_BIND')">绑定这个</el-button>
            </block>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PageTitle from "../components/PageTitle";
  import Tab from "../components/Tab";
  import { ref } from 'vue';
  import {mixInject} from "../utils/store/state";
  import { ElMessage } from 'element-plus';
  import { ipcRenderer } from 'electron';
  import request from "../utils/request";
  import { mixDomain as domain } from "../utils/store/action";
  import { numToStr } from "../utils/stringHelper";
  import Storage from "../utils/Storage";

  export default {
    name: "Setting",
    components: {
      PageTitle,
      Tab,
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

      return {
        ...state,
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
            val: 'user',
            color: 'green',
            icon: 'user',
            text: '账号',
          }
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
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .setting-page {
    .input-line {
      display: flex;
      line-height: 28px;
      margin-bottom: 16px;

      .input-label {
        flex: 2;
        text-align: right;
      }
      .input-content {
        flex: 10;
        padding-left: 12px;

        .input-txt-info {
          text-decoration: underline;
          cursor: pointer;
        }

        .explain {
          color: #fff9;
          font-size: 12px;
        }
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
    }

    .style-tab-content {
      .input-content {
        .el-slider {
          width: 240px;
        }
      }
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
</style>