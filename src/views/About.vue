<template>
  <div class="about-page">
    <page-title :title="`ABOUT  v-${version}`" />
    <tab v-model="type" :tabs="tablist" />
    <div class="pt_15">
      <div class="version-txt">
        <span>v</span>
        <span class="version-num">{{version}}</span>
        <span v-if="versioinType" class="vertion-type">{{versioinType}}</span>
      </div>

      <div class="pt_20 about-content">
        <div v-if="type === 'about'">
          <div>
            <span @click="jumpOutside('https://github.com/jsososo/soso-music')">
              <i class="iconfont icon-git ft_20 pr_10" />
              <b class="link-span ft_20">soso music</b>
            </span>
            <div>
              项目基于 vue3 + electron + express
            </div>
          </div>
          <div>
            目前无版权/会员歌曲会通过查询咪咕音乐的形式爬取，为了防止高频的接口调用，采用队列查询，因此第一次完整的查询完全部歌曲会耗费一点时间，
            但是之后歌曲信息会被保存至本地，下次无需再查找
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
            <span class="link-span" @click="jumpOutside('https://github.com/jsososo/MiguMusicApi')">jsososo/MiguMusicApi</span>
            <br />
            <span class="link-span" @click="jumpOutside('https://github.com/jsososo/MixMusicApi')">jsososo/MixMusicApi</span>
          </div>
          <div v-if="versioinType === 'alpha' || versionType === 'beta'">
            当前版本为测试版
          </div>
        </div>

        <div v-else-if="type === 'history'">
          <div>测试版可以在 <span class="link-span" @click="jumpOutside('https://github.com/jsososo/soso-music/releases')">github</span> 获取</div>
          <div v-for="(item, index) in history" :key="`history-${item.version}-${index}`" class="history-item">
            <div class="mb_5">
              <span>{{item.created}}</span>
              <span class="version-num">{{item.version}}</span>
              <span class="version-type">{{item.versionType}}</span>
            </div>
            <div class="version-explain">
              {{item.explain}}
              <div v-if="!item.versionType">
                <span class="link-span" @click="jumpOutside(`http://app.jsososo.com/soso%20music%20Setup%20${item.version}.exe`)">windows 下载地址</span>
                <span class="link-span ml_10" @click="jumpOutside(`http://app.jsososo.com/soso%20music-${item.version}.dmg`)">mac 下载地址</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="type === 'todo'">
          <div v-for="(item, index) in todoList" :key="`todo-${item}-${index}`" style="margin-bottom: 5px;">
            {{item}}
          </div>
        </div>
      </div>

      <div class="pay-container">
        <div class="ft_20 pl_10">感谢支持</div>
        <img src="http://music.jsososo.com/img/pay-1.52708186.png" />
        <img src="http://music.jsososo.com/img/pay-2.d70586c2.jpeg" />
      </div>
    </div>
  </div>
</template>

<script>
  import PageTitle from "../components/PageTitle";
  import Tab from "../components/Tab";
  import { ref, reactive } from 'vue';
  import { shell } from 'electron';
  import request from "../utils/request";
  import { mixDomain as domain } from "../utils/store/action";
  import {replaceObj} from "../utils/util";
  import {mixInject} from "../utils/store/state";
  import { useRoute } from 'vue-router';

  export default {
    name: "About",
    components: {
      PageTitle,
      Tab,
    },
    setup() {
      const { setting } = mixInject('setting');
      const type = ref('about');

      const history = reactive([]);

      if (useRoute().query.type) {
        type.value = useRoute().query.type;
      }

      request({
        api: 'MIX_VERSION',
        domain,
      }).then(({ data }) => {
        replaceObj(history, data);
      })

      return {
        version: setting.version,
        versioinType: setting.versionType,
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
        history,
        todoList: [
          '心动模式',
          '开放快捷键编辑 & 全局快捷键',
          '电台',
          '加入播放列表逻辑优化',
          '测试版更新推送',
          '评论恢复提示',
          '优化qq cookie 时长问题',
          '开放自定义替换音源',
          '独立的集成式歌单',
          '。。。',
        ],
        jumpOutside: (url) => shell.openExternal(url),
      }
    }
  }
</script>

<style scoped lang="scss">
  .about-page {
    position: relative;
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

    .pay-container {
      position: absolute;
      right: 20px;
      top: 50px;
      font-weight: 900;

      img {
        width: 120px;
        margin: 10px;
      }
    }

    .about-content {
      line-height: 1.75em;
      width: calc(100% - 380px);

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