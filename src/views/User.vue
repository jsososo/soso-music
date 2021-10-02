<template>
  <div class="user-page">
    <div
      v-if="!u.logined"
      class="login-container"
    >
      <div v-if="setting.platform === '163'">
        <page-title title="网易云 LOGIN"/>
        <div class="input-line so-input">
          <div class="input-label">
            账号
          </div>
          <div class="input-content">
            <input
              v-model="inputUser"
              type="text"
              placeholder="邮箱/手机号"
            >
          </div>
        </div>
        <div class="input-line so-input">
          <div class="input-label">
            密码
          </div>
          <div class="input-content">
            <input
              v-model="inputPassword"
              type="password"
              @keydown="passwordKeyDown"
            >
          </div>
        </div>
        <div
          :class="`so-btn login-btn ${isLogin && 'actived'}`"
          @click="login163"
        >
          登 录
        </div>
      </div>

      <div v-if="setting.platform === 'qq'">
        <page-title title="QQ LOGIN"/>
        <div class="text-left">
          登录后如果没有自动跳转可以尝试切换一下其他平台再切换回来
        </div>
        <webview
          id="login-qq"
          ref="webView"
          src="https://y.qq.com"
        />
      </div>
    </div>
    <div v-else>
      <div class="user-info">
        <info-box
          :pic="u.avatar"
          :list="[
            { text: u.nick, className: 'text-title' },
            { text: u.desc, className: 'text-small' },
          ]"
        >
          <div
            class="log-out-btn"
            @click="logOut"
          >
            <i class="iconfont icon-logout"/>
            <span class="pl_5">退出</span>
          </div>
        </info-box>
        <page-right-container>
          <book-mark
            v-model="selectedTab"
            :tabs="tabs"
          />
          <playlist
            v-if="selectedTab === 'playlist'"
            :list="u.playlist || []"
          />
          <song-list
            v-if="selectedTab === 'rank' || selectedTab === 'week'"
            show-index
            :songs="songs"
            :count-map="countMap"
          />
        </page-right-container>
      </div>
    </div>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import { computed, ref, watch, nextTick, reactive } from "vue";
  import PageTitle from "../components/PageTitle";
  import request from "../utils/request";
  import { ElMessage } from 'element-plus';
  import {get163LoginStatus, getQQLoginStatus, getUserList, handleSongs} from "../utils/store/action";
  import InfoBox from "../components/InfoBox";
  import Playlist from "../components/list/playlist";
  import SongList from '../components/list/song';
  import docCookie from '../utils/cookie';
  import PageRightContainer from "../components/PageRightContainer";
  import Storage from "../utils/Storage";
  import BookMark from "../components/BookMark";
  import {replaceObj} from "../utils/util";

  export default {
    name: "User",
    components: {
      PageTitle,
      InfoBox,
      Playlist,
      PageRightContainer,
      BookMark,
      SongList,
    },
    setup() {
      const state = mixInject(['user', 'downloadInfo', 'setting'])

      const { setting, user } = state;
      const u = computed(() => user[setting.platform])

      const [
        inputUser,
        inputPassword,
        isLogin,
        webView,
      ] = [
        ref(''),
        ref(''),
        ref(false),
        ref(),
      ]
      const isLoginQQ = computed(() => !u.logined && setting.platform === 'qq');

      // qq 的登录逻辑
      watch(
        [isLoginQQ, webView],
        () => {
          isLoginQQ.value && nextTick(() => {
            const onReady = () => {
              webView.value.insertCSS('.popup_guide { display: none !important;}')
                .then(res => console.log('css ', res))
              webView.value.executeJavaScript('document.cookie')
                .then(cookie => getQQLoginStatus(cookie))
            }
            webView.value && (webView.value.addEventListener('dom-ready', onReady) && onReady());
          })
        },
        { immediate: true }
      )
      watch(() => setting.platform, () => {
        u.value.logined && getUserList();
        if (!tabs.value[selectedTab]) {
          selectedTab.value = tabs.value[0].val;
        }
      })

      u.value.logined && getUserList();

      // 书签tab
      const tabs = computed(() => {
        const list = [
          { icon: 'playlist', val: 'playlist', text: '歌单', color: 'red' },
          { icon: 'week', val: 'week', text: '最近', color: 'green', noqq: true },
          { icon: 'history', val: 'rank', text: '历史', color: 'blue', noqq: true },
        ]

        return new Proxy(list.filter((v) => !v[`no${setting.platform}`]), {
          get(target, key) {
            return target[key] ?
              target[key] :
              target.find(({ val }) => val === key)
          }
        });
      })

      const selectedTab = ref(tabs.value[0].val);

      // 最近听歌的次数/比例
      const countMap = reactive({});
      const songs = reactive([]);

      watch(selectedTab, async (v) => {
        const type = {
          rank: 0,
          week: 1,
        }[v];
        if (type !== undefined) {
          const { data = []} = await request({
            api: 'SONG_RECORD',
            data: { uid: u.value.id, _p: setting.platform, type }
          }).catch(() => ({}))
          const s = [];
          data.forEach(({ playCount, score, song }) => {
            s.push(song);
            countMap[song.aId] = {
              count: playCount,
              score,
            }
          })
          replaceObj(songs, handleSongs(s));
        }
      })
      return {
        ...state,
        u,
        inputUser,
        inputPassword,
        isLogin,
        webView,
        tabs,
        selectedTab,
        songs,
        countMap,

        async login163() {
          if (isLogin.value) {
            return ElMessage.warning('别催');
          }
          isLogin.value = true;
          let api = '163_LOGIN_PHONE';
          const params = {
            password: inputPassword.value,
          };
          const username = inputUser.value;
          if (username.match(/@/)) {
            api = '163_LOGIN_EMAIL';
            params.email = username;
          } else {
            params.phone = username;
          }

          const res = await request({ api, data: params, method: 'post' })
            .catch((err) => {
              ElMessage.error(err.message || '登录失败');
              return null;
            });

          isLogin.value = false;

          res && get163LoginStatus();
        },

        async logOut() {
          const { platform } = setting;
          switch (platform) {
            case '163':
              await request('163_LOGOUT');
              break;
            case 'qq':
              setting.oldQmKeyst = docCookie.getItem('qm_keyst');
              Storage.set('q_cookie', '');
              Storage.set('q_cookie_time', 0);
              break;
          }
          user[platform] = {};
        },

        passwordKeyDown({ key }) {
          key.toUpperCase() === 'ENTER' && this.login163();
        }
      }
    },
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .user-page {
    .login-container {
      text-align: center;
      padding-top: 50px;

      .login-btn {
        padding: 12px 0;
        width: 280px;
        display: inline-block;
        border: 1px solid #fff3;
        border-radius: 10px;
        margin-top: 20px;
        cursor: pointer;
        letter-spacing: 10px;
        background: transparent;
        transition: 0.3s;

        &:hover {
          background: #fff1;
          border-radius: 5px;
        }

        &.actived {
          animation: loginBtn 0.5s;
        }

        @keyframes loginBtn {
          0% {
            box-shadow: 0 0 0 #fff4;
          }
          100% {
            box-shadow: 0 0 15px 10px #fff0;
          }
        }
      }

      #login-qq {
        min-height: 500px;
        margin-bottom: 30px;
      }
    }

    .user-info {
      .log-out-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        line-height: 24px;
        font-size: 12px;
        padding: 0 5px;
        background: #0003;
        display: inline-block;
        color: #fff;
        cursor: pointer;
        transition: 0.3s;


        &:hover {
          color: $red;
          background: #0006;
        }

        .iconfont {
          font-size: 12px;
        }
      }
      .right-container {

      }
    }
  }
</style>