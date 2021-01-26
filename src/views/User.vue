<template>
  <div class="user-page">
    <div v-if="!u.logined" class="login-container">
      <div v-if="setting.platform === '163'">
        <page-title title="网易云 LOGIN" />
        <div class="input-line">
          <div class="input-label">账号</div>
          <div class="input-content">
            <input type="text" v-model="inputUser" placeholder="邮箱/手机号" />
          </div>
        </div>
        <div class="input-line">
          <div class="input-label">密码</div>
          <div class="input-content">
            <input type="password" v-model="inputPassword" />
          </div>
        </div>
        <div :class="`login-btn ${isLogin && 'actived'}`" @click="login163">
          登 录
        </div>
      </div>

      <div v-if="setting.platform === 'qq'">
        <page-title title="QQ LOGIN" />
        <webview ref="webView" id="login-qq" src="https://y.qq.com" />
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
        />
        <div class="page-right-container">
          <playlist :list="u.playlist || []" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mixInject} from "../utils/store/state";
  import { computed, ref, watch, nextTick } from "vue";
  import PageTitle from "../components/PageTitle";
  import request from "../utils/request";
  import { ElMessage } from 'element-plus';
  import {get163LoginStatus, getQQLoginStatus, getUserList} from "../utils/store/action";
  import InfoBox from "../components/InfoBox";
  import Playlist from "../components/list/playlist";

  export default {
    name: "User",
    components: {
      PageTitle,
      InfoBox,
      Playlist,
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
      const loadWebView = () => {
        isLoginQQ.value && nextTick(() => {
          const onReady = () => {
            webView.value.insertCSS('.popup_guide { display: none !important;}')
              .then(res => console.log('css ', res))
            webView.value.executeJavaScript('document.cookie')
              .then(cookie => {
                console.log(cookie);
                return cookie
              })
              .then(cookie => getQQLoginStatus(cookie))
          }
          webView.value && (webView.value.addEventListener('dom-ready', onReady) && onReady());
        })
      }
      watch([isLoginQQ, webView], loadWebView)
      loadWebView();
      watch(() => setting.platform, () => u.value.logined && getUserList())

      u.value.logined && getUserList();

      return {
        ...state,
        u,
        inputUser,
        inputPassword,
        isLogin,
        webView,

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
      }
    },
    methods: {
      updateDownloadInfo() {
        this.downloadInfo.count += 1;
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/style/value";

  .user-page {
    .login-container {
      text-align: center;
      padding-top: 50px;

      .input-line {
        line-height: 48px;
        font-size: 20px;

        input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          width: 250px;
          font-size: 20px;

          &::-webkit-input-placeholder {
            color: #fff5;
          }
        }

        .input-content, .input-label {
          display: inline-block;
          padding: 6px;
          position: relative;
          vertical-align: top;

          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            display: inline-block;
            transition: 0.4s;
          }
        }
        .input-label {
          &:before {
            height: 40px;
            top: 8px;
            width: 0;
            background: #{$blue}cc;
            z-index: -1;
            opacity: 0.5;
          }
        }
        .input-content {
          width: 250px;
          overflow: hidden;
          margin-left: 15px;

          &:before {
            width: 650px;
            background: linear-gradient(to right, $blue, $blue 50%, #fffc 51% , #fffc);
            height: 2px;
            top: 40px;
            transform: translateX(-330px);
            opacity: 0.6;
          }
        }

        &:hover {
          .input-label:before {
            width: 10px;
          }
        }

        &:focus-within {
          .input-label:before {
            opacity: 1;
            width: 20px;
          }
          .input-content:before {
            transform: translateX(0);
          }
        }
      }

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
      .right-container {

      }
    }
  }
</style>