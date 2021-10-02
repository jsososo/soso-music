<template>
  <div class="feed-back-page">
    <page-title title="FEEDBACK" />
    <div class="feedback-input-container">
      <div class="info-input-container">
        <span
          v-if="user.soso.logined"
          class="input-user"
          @click="goToMixUser"
        >{{ user.soso.nick }}</span>
        <div v-else>
          游客
        </div>
      </div>
      <hr>
      <div
        v-if="inputContent.replyId"
        class="reply-info"
      >
        回复 @{{ inputContent.replyNick }}：
        <span class="reply-content">{{ shortString(inputContent.replyContent) }}</span>
        <i
          class="iconfont icon-cancel"
          @click="setReply()"
        />
      </div>
      <textarea
        v-model="inputContent.content"
        class="feedback-textarea"
        placeholder="说些啥呢"
        cols="30"
        rows="10"
      />
      <i
        class="iconfont icon-plane"
        @click="addFeedback"
      />
    </div>
    <div
      v-if="list.length"
      class="feedback-list"
    >
      <div
        v-for="item in list"
        :key="item.id"
        class="feedback-content-item"
      >
        <div class="nick">
          {{ item.user ? item.user.nick : '游客' }}
          <span
            v-if="item.user"
            class="email"
          >{{ item.user.email }}</span>
          <span
            v-if="item.version"
            class="version"
          >v{{ item.version }}</span>
        </div>
        <div class="content">
          {{ item.content }}
        </div>
        <blockquote
          v-if="item.replyId && item.replyContent"
          class="reply-info"
        >
          <span class="reply-nick">@{{ item.replyUser ? item.replyUser.nick : '游客' }}：</span>
          <span>{{ item.replyContent }}</span>
        </blockquote>
        <div class="time">
          {{ timeStr(item.created) }}
          <el-popconfirm
            v-if="canDelete(item)"
            title="确定删除评论？"
            placement="top"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="delFeedback(item.id)"
          >
            <template #reference>
              <i class="iconfont icon-delete ft_14 ml_10"/>
            </template>
          </el-popconfirm>
          <i
            class="iconfont icon-reply ml_10"
            @click="setReply(item)"
          />
        </div>
      </div>
    </div>
    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="page.pageNo"
      :page-size="10"
      class="mb_20"
      :total="page.total"
      @current-change="(v) => page.pageNo = v"
    />
  </div>
</template>

<script>
  import request from "../utils/request";
  import { reactive, watch } from 'vue';
  import {replaceObj} from "../utils/util";
  import PageTitle from "../components/PageTitle";
  import {mixInject} from "../utils/store/state";
  import { shortString } from "../utils/stringHelper";
  import { ElMessage } from 'element-plus';
  import timer from '../utils/timer';
  import { mixDomain as domain } from "../utils/store/action";

  export default {
    name: "Feedback",
    components: { PageTitle },
    setup() {

      const state = mixInject(['user', 'setting']);

      const { setting, user } = state;

      const page = reactive({
        pageNo: 1,
        total: 0,
      })

      const inputContent = reactive({
        content: '',
        replyId: '',
        replyNick: '',
      })

      const list = reactive([]);

      const getFeedback = async () => {
        const { data: { list: fList, total } } = await request({
          domain,
          api: 'MIX_FEEDBACK',
          data: { pageNo: page.pageNo }
        }, '163')

        list.length = 0;
        replaceObj(list, fList);
        page.total = total;
      }

      watch(() => page.pageNo, getFeedback)

      getFeedback();

      let loading = false;

      return {
        ...state,
        list,
        page,
        inputContent,
        shortString,

        timeStr(v) {
          return timer(v).str('YY-MM-DD HH:mm:ss')
        },

        goToMixUser() {
          setting.tab = 'user';
          window.location = '#/setting';
        },

        setReply({ id, uId, user = {}, content } = {}) {
          inputContent.replyId = id;
          inputContent.replyNick = user.nick || '游客';
          inputContent.replyUId = uId;
          inputContent.replyContent = content;
        },

        canDelete(item) {
          if (user.soso.logined && user.soso.root) {
            return true;
          }
          if (user.soso.logined && user.soso.id === item.uId) {
            return true
          }
          if (!item.user && item.appId === setting.appId) {
            return true;
          }
          if (item.user && !item.user.qqId && !item.user.netId) {
            return item.appId === setting.appId;
          }
          return false;
        },

        async addFeedback() {
          if (loading) {
            return ElMessage.warning('别急')
          }
          if (!inputContent.content) {
            return ElMessage.warning('说点啥呀')
          }

          loading = true;
          const data = {
            content: inputContent.content,
            appId: setting.appId,
            uId: user.soso.logined ? user.soso.id : undefined,
            version: setting.version,
          };
          if (inputContent.replyId) {
            data.replyId = inputContent.replyId;
            data.replyUId = inputContent.replyUId;
          }
          await request({
            domain,
            api: 'MIX_FEEDBACK_ADD',
            data,
          }).catch(() => {});
          this.setReply();
          inputContent.content = '';
          loading = false;
          getFeedback()
        },

        async delFeedback(id) {
          await request({
            domain,
            api: 'MIX_FEEDBACK_DEL',
            data: { id },
          })
          if (list.length === 1) {
            page.pageNo -= 1;
          }
          getFeedback();
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .feed-back-page {
    padding-top: 20px;
    position: relative;

    h1, h2 {
      color: #fff6;
      margin-bottom: 30px;
    }

    .top-qa {
      position: absolute;
      width: 45%;
      top: 100px;
      right: 0;
    }

    .feedback-input-container {
      background: #0005 !important;
      width: 50%;
      border-radius: 10px;
      font-size: 14px;
      color: #fffc;
      overflow: hidden;
      padding: 10px;
      position: relative;

      .info-input-container {
        color: #fff8;
        margin-top: 5px;
        margin-bottom: 5px;
        padding-left: 10px;

        .input-user {
          cursor: pointer;
          transition: 0.3s;

          &:hover {
            text-decoration: underline #fffc;
            color: #fffc;
          }
        }
      }

      hr {
        border: none;
        border-top: 1px dashed #fff8;
      }

      .reply-info {
        padding: 5px 10px;
        padding-bottom: 0;
        color: #fff8;

        .reply-content {
          font-size: 12px;
          color: #fffc;
          background: #fff4;
          padding: 0 10px;
          border-radius: 4px;
          word-break: break-all;
        }
        .icon-cancel {
          cursor: pointer;
          margin-left: 10px;
          font-size: 14px;
        }
      }

      .feedback-textarea {
        background: transparent;
        box-sizing: border-box;
        color: #fffc;
        width: 100%;
        padding: 10px;
        height: 100px;
        border: none;
        outline: none !important;
        resize: none;
        font-size: 16px;

        &::-webkit-scrollbar {
          width: 0;
          height:8px;
          background-color:rgba(0,0,0,0);
        }
      }

      .icon-plane {
        position: absolute;
        bottom: 15px;
        right: 15px;
        font-size: 20px;
        cursor: pointer;
      }
    }

    .feedback-list, .qa-list {
      margin-top: 20px;
      .feedback-content-item, .top-qa-content {
        width: 50%;
        background: #0003;
        border-radius: 10px;
        color: #fffc;
        padding: 10px;
        font-size: 14px;
        margin-bottom: 10px;

        &.top-qa-content {
          width: 80%;
        }

        .nick {
          font-weight: bold;
          font-size: 16px;
          padding: 0 12px;
          .email, .version {
            font-weight: normal;
            color: #fff6;
            font-size: 12px;
            padding-left: 20px;
          }
        }

        .content {
          padding: 10px 12px;
          word-break: break-all;
        }
        .time {
          font-size: 12px;
          color: #fff8;
          padding-left: 12px;
          padding-bottom: 5px;

          .icon-reply {
            font-size: 12px;
            color: #fffa;
            cursor: pointer;
            font-weight: bold;
          }
        }

        .reply-info {
          padding: 5px 10px;
          border-left: 5px solid #fff8;
          opacity: 0.7;
          margin-left: 12px;
          margin-bottom: 10px;

          span {
            word-break: break-all;
          }
        }
      }
    }
  }
</style>