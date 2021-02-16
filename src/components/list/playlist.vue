<template>
  <div>
    <div
      v-for="aId in list"
      :key="`playlist-${aId}`"
      class="playlist-item"
      @click="changeUrlQuery({ aId }, '#/playlist/detail')"
    >
      <!--    <div v-if="playingListId == item.listId && isPlaying" class="playing-item-bg">-->
      <!--      <div v-for="(o, i) in new Array(100)" :key="`bg-item-${i}`" :class="`playing-bg-${i}`">-->
      <!--        <div class="bg-item-inside" />-->
      <!--      </div>-->
      <!--    </div>-->
      <block v-if="allList[aId].id === 'daily'">
        <div class="list-img daily-img">{{date}}</div>
      </block>
      <block v-else>
        <img :src="`${allList[aId].cover}?param=50y50`" v-error="`https://y.gtimg.cn/mediastyle/global/img/album_300.png`" class="list-bg-img" />
        <img :src="`${allList[aId].cover}?param=200y200`" v-error="`https://y.gtimg.cn/mediastyle/global/img/album_300.png`" class="list-img" />
      </block>
      <span class="list-name" v-html="allList[aId].name" />
      <span class="list-count" v-if="allList[aId].trackCount">{{allList[aId].trackCount}}</span>
      <div class="bottom-text">
        <!--      <el-tooltip-->
        <!--        class="item"-->
        <!--        effect="dark"-->
        <!--        content="心动模式"-->
        <!--        placement="top"-->
        <!--        v-if="selected === '163' && user.userId && userList['163'] && userList['163'].favListId === item.listId"-->
        <!--      >-->
        <!--        <i @click="toHeartMode(item.listId)" :class="`iconfont icon-heart heart-btn ${heartMode && 'hearting'}`" />-->
        <!--      </el-tooltip>-->
        <!--      <el-tooltip-->
        <!--        v-if="userList[selected] && !userList[selected].mine[item.listId]"-->
        <!--        class="item"-->
        <!--        effect="dark"-->
        <!--        :content="userList[selected].sub[item.listId] ? '已收藏' : '收藏'"-->
        <!--        placement="top"-->
        <!--      >-->
        <!--        <i @click="collectPlaylist(item)" :class="`collect-btn iconfont icon-${userList[selected].sub[item.listId] ? 'collected' : 'collect'}`" />-->
        <!--      </el-tooltip>-->
        <span class="list-creator" v-if="allList[aId].creator && allList[aId].creator.nick">
          By: <span v-html="allList[aId].creator.nick" />
          <span class="pl_20" v-if="allList[aId].playCount"><i class="iconfont icon-yinyue" />: {{numToStr(allList[aId].playCount)}}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import { changeUrlQuery, numToStr } from "../../utils/stringHelper";
  import {mixInject} from "../../utils/store/state";

  export default {
    name: "playlist",
    props: {
      list: Object,
    },
    setup() {
      const state = mixInject([ 'allList', 'setting' ])
      return {
        ...state,

        changeUrlQuery,

        numToStr,

        date: new Date().getDate(),
      }
    }
  }
</script>

<style scoped lang="scss">
  .playlist-item {
    position: relative;
    height: 60px;
    overflow: hidden;
    padding: 10px;
    opacity: 0.8;
    transition: 0.4s;
    box-shadow: 0 0 0 #0003;

    .list-bg-img {
      position: absolute;
      z-index: 0;
      opacity: 0.2;
      filter: blur(30px);
      width: 170px;
      height: 170px;
      top: -60px;
      transition: 0.3s;
    }
    .bottom-text {
      position: absolute;
      bottom: 0;
      color: #fff3;
      font-weight: bold;
      cursor: pointer;
      font-size: 16px;
      transition: 0.3s;
      left: 90px;

      .collect-btn, .heart-btn {
        margin-right: 15px;
        &.heart-btn {

          &.hearting {
            color: #F56C6C88;
            animation: hearting 1.4s infinite;

            @keyframes hearting {
              from, to, 40%, 50%, 60%, 70% {
                transform: scale(1);
              }
              45%, 65% {
                transform: scale(1.2);
              }
            }
          }
        }
      }
    }

    .list-creator{
      font-size: 14px;
      color: #fff5;
      transition: 0.3s;

      a {
        color: #fff5;
        transition: 0.3s;
      }
    }
    .list-img {
      border-radius: 5px;
      display: inline-block;
      transition: 0.3s;
      position: absolute;
      transform: rotate(0) scale(0.38) translate(-138px, -156px);
      top: 10px;
      left: 10px;
      width: 175px;
      height: 175px;
      font-size: 100px;
      line-height: 200px;
      font-weight: bold;
      color: #fff5;
      text-align: center;

      &.daily-img {
        border: 1px solid #fff6;
      }
    }
    .list-name {
      display: inline-block;
      vertical-align: top;
      font-size: 20px;
      color: #fffc;
      margin-left: 20px;
      transition: 0.3s;
      padding-left: 60px;
      white-space: nowrap;
    }
    .list-count {
      position: absolute;
      right: 10px;
      font-weight: bold;
      font-size: 44px;
      width: 80px;
      text-align: right;
      bottom: 5px;
      color: #fff4;
      transform: rotate(0) translate(0, 20px);
      transform-origin: bottom left;
      transition: 0.3s;
    }

    &:hover {
      opacity: 1;
      box-shadow: 0 4px 20px #0004;

      .bottom-text {
        color: #fffc;

        .hearting {
          color: #F56C6C;
        }
      }

      .list-creator {
        transform: translate(10px);
        color: #fffc;
      }

      .list-count {
        transform: rotate(-90deg) translate(-20px, 150%);
        text-align: center;
      }

      .list-name {
        transform: scale(1.1) translate(5px);
      }
      .list-img {
        transform: rotate(-30deg) scale(0.7) translate(-70px, -150px);
        opacity: 0.7;
      }
    }
  }
</style>