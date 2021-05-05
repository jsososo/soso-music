<template>
  <page-right-container class="comment-page">
    <comment-info
      :hot="playNow.hotComments || []"
      :page="page"
      :list="playNow.comments || []"
      :info="playNow"
      :getList="getList"
      type="song"
    />
  </page-right-container>
</template>

<script>
  import CommentInfo from "../components/CommentInfo";
  import PageRightContainer from "../components/PageRightContainer";
  import request from "../utils/request";
  import {mixInject} from "../utils/store/state";
  import {reactive, watch} from 'vue';
  export default {
    name: "Comment",
    components: { CommentInfo, PageRightContainer },
    setup() {
      const state = mixInject(['setting', 'playNow'])
      const { playNow } = state;
      const list = reactive([]);
      const page = reactive({ pageNo: 1, total: 0 })
      const getCommentList = async ({ del } = {}) => {
        const { songid, id, platform } = playNow;
        if (!id) {
          return;
        }
        const { data: { list = [], total = 0 }} = await request({
          api: 'COMMENT',
          data: {
            id: songid || id,
            pageNo: page.pageNo,
            platform,
          }
        })
        const arr = page.pageNo === 1 ? [] : playNow.comments;
        playNow.comments = [...arr, ...list.filter((id) => `${id}` !== del)];
        playNow.totalComments = total;
        page.total = total;
      }

      watch(() => playNow.aId, () => (page.pageNo = 1) && getCommentList(), { immediate: true });

      return {
        ...state,
        list,
        page,
        getList(pageNo, opt = {}) {
          (page.pageNo = pageNo) && getCommentList(opt);
        }
      }
    }
  }
</script>

<style scoped>

</style>