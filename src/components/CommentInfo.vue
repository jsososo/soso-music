<template>
  <div class="comment-container hide-scroll" @scroll="onScroll" ref="listDom">
    <div v-for="({ title, arr }) in comments" :key="`list-${title}`">
      <div class="comment-type-block" v-if="arr.length">
        <div class="comment-type-title">{{title}}</div>
        <div class="comments-list">
          <div class="comment-item" v-for="item in arr" :key="item.id">
            <img class="user-avatar" :src="`${item.creator.avatar}?param=50y50`">
            <div class="comment-content">
              <div class="user-name-block">
                <a :href="`#/user?id=${item.creator.id}`"><b class="user-name">{{item.creator.nick}}</b></a>
                <span class="pl_20 comment-time">{{timeStr(item.time)}}</span>
              </div>
              <div class="content" v-html="item.content"></div>
              <blockquote v-if="item.beReplied && item.beReplied[0]" class="be-replied">
                <a :href="`#/user?id=${item.creator.id}`" class="user-name">@{{item.beReplied[0].creator.nick}}</a>
                ：<span v-html="item.beReplied[0].content"></span>
              </blockquote>
              <div class="mt_10">
                <i @click="likeComment(item)" :class="`iconfont pointer ${item.newLike && 'new-like'} icon-zan${item.liked ? '' : '-o'}`" />
                <span class="pl_10 ft_12">{{numToStr(item.likedCount)}}</span>
                <i v-if="item.platform === '163'" class="iconfont icon-reply ml_20 pointer" style="vertical-align: -1px;" @click="reply(item)" />
                <el-popconfirm
                  v-if="item.canDelete || item.creator.id === user[item.creator.platform].id"
                  title="删除评论？"
                  placement="top"
                  @confirm="delComment(item.id)"
                  confirmButtonText="确认"
                  cancelButtonText="取消"
                >
                  <template #reference>
                    <i class="iconfont icon-delete ml_20 pointer" />
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <send-comment :info="info" :type="type" :onSendSuccess="() => getList(1)" />
  </div>
</template>

<script>
  import { computed, ref } from 'vue';
  import { numToStr } from "../utils/stringHelper";
  import timer from '../utils/timer';
  import SendComment from "./SendComment";
  import {mixInject} from "../utils/store/state";
  import request from "../utils/request";
  import { ElMessage } from 'element-plus';

  export default {
    name: "CommentInfo",
    props: {
      type: String,
      hot: Object,
      list: Object,
      info: Object,
      page: Object,
      getList: Function,
    },
    components: {
      SendComment,
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

      const listDom = ref();

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
        onScroll() {
          const dom = listDom.value;
          const { list, page } = props;

          if (!page && list.length >= page.total) {
            return;
          }
          if (page.pageNo * 20 > list.length) {
            return;
          }
          let h = 0;
          dom.children.forEach(({ offsetHeight }) => h += offsetHeight);
          (dom.scrollTop + dom.offsetHeight > (h - 100)) && props.getList && props.getList(page.pageNo + 1);
        },
        listDom,
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