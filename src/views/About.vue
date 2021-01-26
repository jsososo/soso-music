<template>
  <div class="about-page">
    <page-title :title="`ABOUT  v-${version}`" />
    <tab v-model="type" :tabs="tablist" />
    <div class="pt_15">
      <div class="version-txt">
        <span>v</span>
        <span class="version-num">{{version}}</span>
        <span class="vertion-type">{{versioinType}}</span>
      </div>

      <div class="pt_20 about-content">
        <div v-if="type === 'about'">
          <div>
            项目基于 vue3 + electron + express
          </div>
          <div>
            前端改造自：
            <br />
            <span class="link-span" @click="jumpOutside('https://github.com/jsososo/NeteaseMusic')">jsososo/NeteaseMusic</span>
          </div>
          <div>
            后端部分基于：
            <br />
            <span class="link-span" @click="jumpOutside('https://github.com/Binaryify/NeteaseCloudMusicApi')">Binaryify/NeteaseCloudMusicApi</span>
            <br />
            <span class="link-span" @click="jumpOutside('https://github.com/jsososo/QQMusicApi')">jsososo/QQMusicApi</span>
            <br />
            <span class="link-span" @click="jumpOutside('https://github.com/jsososo/MixMusicApi')">jsososo/MixMusicApi</span>
          </div>
        </div>

        <div v-else-if="type === 'history'">
          <div v-for="(item, index) in history" :key="`history-${item.version}-${index}`" class="history-item">
            <div class="mb_5">
              <span>{{item.created}}</span>
              <span class="version-num">{{item.version}}</span>
              <span class="version-type">{{item.versionType}}</span>
            </div>
            <div class="version-explain">
              {{item.explain}}
            </div>
          </div>
        </div>

        <div v-else-if="type === 'todo'">
          <div v-for="(item, index) in todoList" :key="`todo-${item}-${index}`" style="margin-bottom: 5px;">
            {{item}}
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

  export default {
    name: "About",
    components: {
      PageTitle,
      Tab,
    },
    setup() {
      const type = ref('about');

      return {
        version: '0.0.1',
        versioinType: 'alpha',
        type,
        tablist: [
          {
            val: 'about',
            text: '关于',
            color: 'red',
          },
          {
            val: 'history',
            text: '历史',
            color: 'green',
          },
          {
            val: 'todo',
            text: '未来',
            color: 'blue',
          }
        ],
        history: [
          {
            version: '0.0.1',
            versionType: 'alpha',
            explain: '超级先行版！',
            created: '21-1-26',
          }
        ],
        todoList: [
          '专辑页',
          '歌手页',
          '歌曲操作',
          '播放历史',
          '排行榜',
          '极简模式',
          '音频可视化',
          '。。。'
        ],
        jumpOutside(url) {
          console.log(url)
        },
      }
    }
  }
</script>

<style scoped lang="scss">
  .about-page {
    .version-txt {
      font-weight: bold;
      font-size: 18px;
      span {
        padding: 5px;
      }
      .version-num {
        font-size: 40px;
      }
      .vertion-type {
        vertical-align: top;
        display: inline-block;
        border: 1px solid #fff3;
        padding: 2px 5px;
        line-height: 16px;
        font-size: 14px;
        border-radius: 5px;
      }
    }

    .about-content {
      line-height: 1.75em;

      div {
        margin-bottom: 20px;
      }

      .link-span {
        text-decoration: underline;
        cursor: pointer;
      }

      .history-item {
        font-size: 16px;
        .version-num {
          display: inline-block;
          margin-left: 20px;
        }
        .version-type {
          display: inline-block;
          font-size: 12px;
          margin-left: 12px;
        }
        .version-explain {
          font-size: 14px;
          padding-left: 12px;
        }
      }
    }
  }
</style>