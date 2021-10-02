<template>
  <div
    class="comment-container hide-scroll"
    @scroll="onScroll"
  >
    <div
      v-for="({ title, arr }) in comments"
      :key="`list-${title}`"
    >
      <div
        v-if="arr.length"
        class="comment-type-block"
      >
        <div class="comment-type-title">
          {{ title }}
        </div>
        <div class="comments-list">
          <div
            v-for="item in arr"
            :key="item.id"
            class="comment-item"
          >
            <img
              v-error="`https://y.gtimg.cn/mediastyle/global/img/singer_300.png`"
              class="user-avatar"
              :src="`${item.creator.avatar}?param=50y50`"
            >
            <div class="comment-content">
              <div class="user-name-block">
                <a :href="`#/user?id=${item.creator.id}`"><b class="user-name">{{ item.creator.nick }}</b></a>
                <span class="pl_20 comment-time">{{ timeStr(item.time) }}</span>
              </div>
              <div
                class="content"
                v-html="item.content"
              />
              <blockquote
                v-if="item.beReplied && item.beReplied[0]"
                class="be-replied"
              >
                <a
                  :href="`#/user?id=${item.creator.id}`"
                  class="user-name"
                >@{{ item.beReplied[0].creator.nick }}</a>
                ：<span v-html="item.beReplied[0].content"/>
              </blockquote>
              <div class="mt_10">
                <i
                  :class="`iconfont pointer ${item.newLike && 'new-like'} icon-zan${item.liked ? '' : '-o'}`"
                  @click="likeComment(item)"
                />
                <span class="pl_10 ft_12">{{ numToStr(item.likedCount) }}</span>
                <i
                  v-if="item.platform === '163'"
                  class="iconfont icon-reply ml_20 pointer"
                  style="vertical-align: -1px;"
                  @click="reply(item)"
                />
                <el-popconfirm
                  v-if="item.canDelete || item.creator.id === user[item.creator.platform].id"
                  title="删除评论？"
                  placement="top"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  @confirm="delComment(item.id)"
                >
                  <template #reference>
                    <i class="iconfont icon-delete ml_20 pointer"/>
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <send-comment
      v-if="info.platform !== 'local'"
      :info="info"
      :type="type"
      :on-send-success="() => getList(1)"
    />
  </div>
</template>

<script>
  import { computed } from 'vue';
  import { numToStr } from "../utils/stringHelper";
  import timer from '../utils/timer';
  import SendComment from "./SendComment";
  import {mixInject} from "../utils/store/state";
  import request from "../utils/request";
  import { ElMessage } from 'element-plus';

  export default {
    name: "CommentInfo",
    components: {
      SendComment,
    },
    props: {
      type: String,
      hot: Object,
      list: Object,
      info: Object,
      page: Object,
      getList: Function,
    },
    setup(props) {
      const state = mixInject(['commentInfo', 'user']);
      const comments = computed(() => [
        {
          title: 'HOT',
          arr: props.hot || [],
        },
        {
          title: 'LATEST',
          arr: props.list || [],
        }
      ])

      return {
        ...state,
        comments,
        numToStr,
        likeComment(item) {
          const { info } = props;
          request({
            api: 'COMMENT_LIKE',
            data: {
              id: info.songid || info.id,
              commentId: item.id,
              type: Number(!item.liked),
              platform: info.platform,
            }
          }).then(() => {
            item.liked = !item.liked;
            item.newLike = item.liked;
            item.likedCount += item.liked ? 1 : -1;
          })
        },
        delComment(commentId) {
          const { info, getList } = props;
          request({
            api: 'COMMENT_DEL',
            data: {
              id: info.songid || info.id,
              commentId,
              platform: info.platform,
            }
          }).then(() => {
            ElMessage.success('删除成功！');
            getList(1, { del: `${commentId}` });
          }).catch(() => ElMessage.error('删除失败！'));
        },
        timeStr: (v) => timer(v).str('YY-MM-DD HH:mm:ss'),
        onScroll(e) {
          const { target } = e;
          const { list, page } = props;

          if (!page && list.length >= page.total) {
            return;
          }
          if (page.pageNo * 20 > list.length) {
            return;
          }
          (target.scrollTop + target.offsetHeight > (target.children[0].offsetHeight - 100)) &&
            props.getList &&
            props.getList(page.pageNo + 1);
        },
        reply(v) {
          const { commentInfo } = state;
          commentInfo.open = true;
          commentInfo.loading = false;
          commentInfo.content = '';
          commentInfo.reply = v;
          commentInfo.info = props.info;
          commentInfo.name = props.info.name;
        },
      }
    }
  }
</script>

<style lang="scss" scoped>
  .comment-container {
    height: 100%;

    .comment-type-block {
      .comment-type-title {
        height: 20px;
        font-size: 100px;
        color: #fff2;
        font-weight: bold;
      }

      .comments-list {
        padding-top: 50px;
        .comment-item {
          margin-bottom: 10px;
          color: #fffa;
          padding: 15px 10px;
          background: #0002;
          width: calc(100% - 60px);
          margin-left: 20px;
          border-radius: 10px;
          transition: 0.5s;

          &:hover {
            background: #0004;
            color: #fffc;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }

          .comment-content {
            width: calc(100% - 50px);
            display: inline-block;
            vertical-align: top;
            padding-left: 10px;

            .user-name {
              cursor: pointer;
              &:hover {
                text-decoration: underline;
              }
            }

            .user-name-block {
              font-weight: bold;
              font-size: 16px;
              opacity: 0.7;

              .comment-time {
                font-size: 12px;
                font-weight: normal;
              }
            }
            .content {
              margin-top: 10px;
              opacity: 0.7;
              font-size: 14px;
            }
            .be-replied {
              margin-top: 5px;
              padding: 5px 10px;
              border-left: 5px solid #fff8;
              opacity: 0.7;
              font-size: 14px;
            }
          }

          .iconfont.new-like {
            animation: likeAnimation 0.5s;

            @keyframes likeAnimation {
              from, to {
                transform: rotate(0deg);
              }
              50% {
                transform: rotate(-30deg);
              }
            }
          }
        }
      }
    }
  }
</style>