<template>
  <div :class="`write-comment-container ${commentInfo.open && 'open'}`">
    <div class="comment-main">
      <div class="ft_14 pl_5" style="color: #fff9; line-height: 20px">
        <span v-if="commentInfo.reply">回复 @<span class="comment-title">{{commentInfo.reply.creator.nick}}</span></span>
        <span v-else>为 <span class="comment-title">{{commentInfo.name}}</span> 献上评论</span>
      </div>
      <textarea
        class="comment-input"
        :rows="2"
        placeholder="说些啥呢"
        v-model="commentInfo.content"
      />
    </div>
    <i class="iconfont icon-cancel pointer" @click="commentInfo.open = false" />
    <div class="plane-icon" @click="onOpen">
      <i class="iconfont icon-plane pointer" />
    </div>
  </div>
</template>

<script>
  import { mixInject } from "../utils/store/state";
  import { ElMessage } from 'element-plus';
  import request from "../utils/request";

  export default {
    name: "SendComment",
    props: {
      info: Object,
      type: String,
      onSendSuccess: Function,
    },
    setup(props) {
      const state = mixInject(['commentInfo']);
      const { commentInfo } = state;

      const onSend = async () => {
        const { content, reply, info, loading } = commentInfo;
        let c = content.trim();
        if (loading) {
          return ElMessage.warning('别急');
        }
        if (!c) {
          return ElMessage.warning('说点啥吧');
        }
        if (c.length > 300) {
          return ElMessage.warning('话太多了，删到300字以下');
        }
        let id;
        switch (props.type) {
          case 'song':
            id = info.songid || info.id;
            break;
        }

        const data = {
          id,
          content: c,
          platform: info.platform,
        };
        reply && (data.commentId = reply.id);
        commentInfo.loading = true;
        request({
          api: 'COMMENT_SEND',
          data,
        })
          .then(() => {
            commentInfo.loading = false;
            ElMessage.success('发送成功!');
            setTimeout(() => {
              props.onSendSuccess && props.onSendSuccess();
              commentInfo.open = false;
            }, 500);
          })
          .catch(() => {
            ElMessage.error('有点小问题');
          });
      }
      return {
        ...state,
        onOpen() {
          if (commentInfo.open) {
            return onSend();
          }
          commentInfo.loading = false;
          commentInfo.info = props.info;
          commentInfo.open = true;
          commentInfo.content = '';
          commentInfo.reply = null;
          commentInfo.name = props.info.name;
        },
      }
    },
  }
</script>

<style lang="scss" scoped>
  .write-comment-container {
    position: fixed;
    bottom: 120px;
    right: 40px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #F23C3C;
    border: 2px solid #F23C3C;
    opacity: 0.3;
    font-size: 0;
    cursor: pointer;
    box-shadow: 0 0 20px #333;
    transition: 0.3s;
    overflow: hidden;
    z-index: 10;

    &:hover {
      opacity: 0.8;
    }

    &.open {
      opacity: 0.8;
      width: calc(45% - 80px);
      height: 120px;
      background: #000d;
      border: 2px solid #fff3;
      border-radius: 20px;
      cursor: default;
      z-index: 10;

      .comment-main, .icon-cancel {
        opacity: 1;
      }
      .plane-icon {
        bottom: 5px;
      }
    }

    .plane-icon {
      color: #fff;
      text-align: center;
      position: absolute;
      right: 0;
      bottom: 0;
      width: 50px;
      transition: 0.3s;

      .icon-plane {
        line-height: 50px;
        font-size: 24px !important;
      }
    }

    .icon-cancel {
      position: absolute;
      bottom: 80px;
      right: 20px;
      color: #fffc;
      font-size: 14px !important;
      transition: 0.3s;
      opacity: 0;
    }

    .comment-main {
      position: absolute;
      right: 65px;
      bottom: 15px;
      width: calc(100% - 80px);
      color: #fffc;
      transition: 0.3s;
      opacity: 0;

      .comment-title {
        display: inline-block;
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: -6px;
      }

      .comment-input {
        background: transparent !important;
        width: 100%;
        height: 70px;
        font-size: 14px;
        border: none !important;
        color: #fffc;
        outline: none !important;
        resize: none;
      }
    }
  }
</style>