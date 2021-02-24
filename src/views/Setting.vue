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
          <div class="input-label">看见音乐：</div>
          <div class="input-content">
            <el-switch v-model="setting.DRAW_MUSIC" />
          </div>
        </div>
        <block v-if="setting.DRAW_MUSIC">
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
        </block>
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

  export default {
    name: "Setting",
    components: {
      PageTitle,
      Tab,
    },
    setup() {
      const state = mixInject(['setting', 'user']);

      const { setting, user } = state;

      const serverPort = ref(setting.SERVER_PORT);

      const mixNick = ref(user.soso.nick || '');
      const mixEmail = ref(user.soso.email || '');

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
          ipcRenderer.send('SHOW_SELECT_DIR', 'download');
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
        }
      }
    }
  }
</script>

<style scoped lang="scss">
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
  }
</style>