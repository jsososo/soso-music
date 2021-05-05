import { reactive, provide, inject } from 'vue';
import Storage from "../Storage";
import PlayHistory from "../PlayHistory";

const state = {
  // 用户信息
  user: {
    163: {},
    qq: {},
    soso: {
      ...Storage.get('soso_user', true, '{}'),
      logined: false,
    },
  },
  // 下载信息
  downloadInfo: {
    count: 0, // 正在下载中的歌曲，不算 waiting 状态
  },
  // 搜索信息
  searchInfo: {
    keyword: '',
    type: 0,
    result: {},
    pageNo: 1,
    pageSize: 20,
    total: 0,
    platform: '163',
  },
  // 全部音乐
  allSongs: {},
  // 全部歌单
  allList: {},
  // 喜欢的歌曲
  favSongMap: {
    qq: {},
    163: {},
    migu: {},
    local: {}, // 本地，用来防止报错
  },
  // 播放列表
  playingList: new Proxy({
    random: [],
    raw: [],
    trueList: [],
    history: [],
    index: 0,
  }, {
    get(target, key) {
      return target[key] ? target[key] :
        target.raw.find((aId) => aId === key)
    },
  }),
  // 正在播放的音乐
  playNow: {},
  playerStatus: {
    playing: false,
    loading: true,
  },
  // 下载列表
  downloadList: new Proxy(Storage.get('soso_music_download', true, '[]').map((v) => {
    if (!v.finished) {
      v.finished = true;
      v.waiting = false;
      v.errMsg = '下载中断';
    }
    return v;
  }), {
    get(target, p) {
      return target[p] ? target[p] :
        target.find(({dId}) => dId === p);
    }
  }),
  // 歌单信息和歌单中的歌曲列表，放在这里是为了方便对歌曲收藏取消操作时好同步数据
  listInfo: {},
  // 将歌曲添加到歌单
  handleSong: {
    aId: '',
    selected: '',
    list: [],
  },
  // 发送评论的窗口
  commentInfo: {
    open: false,
    content: '',
    name: '',
    reply: null,
    loading: false,
  },
  router: {
    history: ['/'],
    back: [],
    isBack: false,
    isReBack: false,
  },
  // 系统设置
  setting: {
    path: '',
    mode: 'default', // 模式
    volume: 100, // 音量
    orderType: 'suiji',
    tab: 'default',
    DOWN_SIZE: 'flac', // 下载格式
    LISTEN_SIZE: '128', // 播放格式
    DOWN_LYRIC: true, // 下载歌词
    DOWN_FILTER: false,
    DOWN_NAME: '1', // 下载文件名类型
    DOWN_TRANS: true, // 下载歌词翻译
    DOWN_DIR: '', // 下载路径
    qCookie: '',
    SERVER_PORT: '3090', // 服务端口
    store_qq: '',
    store_163: '',
    DRAW_MUSIC: true,
    DRAW_MUSIC_TYPE: '1',
    DRAW_MUSIC_STYLE: 'rect',
    HISTORY_TAB: 'list',
    SYSTEM_PLATFORM: '',
    MAIN_CONTENT: 'info', // 主内容显示
    SHOW_SIMPLE_TRANS: false, // 极简模式，显示翻译
    SHOW_SIMPLE_COVER: true, // 极简模式，显示专辑封面
    SHOW_WIN_LYRIC: false, // 桌面歌词
    INIT_LIST: '1', // 下次登录时的播放列表，-1 表示未设置，逻辑按0处理，0 表示使用推荐歌单，1 表示记住上一次记录，2 表示网易云日推
    appId: (() => {
      const getRandom = (num) => Number(`${num}`.split('').sort(() => Math.random() - 0.5).join('')).toString(36);
      const randomT = getRandom(new Date().valueOf());
      const randomN = getRandom(Math.round(Math.random() * 99999));
      return randomN + randomT;
    })(),
    localFolders: [], // 本地文件夹，用于读取本地歌曲
    ...Storage.get('soso_music_setting', true, '{}'),
    platform: '163', // 默认平台
    version: '1.2.0',
    versionType: '',
  },
  codeMap: {
    PLAY_NEXT: '39',
    PLAY_PREV: '37',
    VOLUME_UP: '38',
    VOLUME_DOWN: '40',
    PLAY: '32',
    QUIT_SIMPLE: '27',
    GO_SIMPLE: 'ctrl-83',
  },
  miguFind: {...Storage.get('soso_music_migu_find', true, '{}')},
  playHistory: new PlayHistory(),
  _localFiles: new Set(), // node 读取到的本地歌曲列表
  localFiles: new Set(), // 校验过的本地歌曲列表，应该比上面的短
  localBlackList: new Set(Storage.get('local_black_list', true, '[]')), // 本地黑名单
  bgInfo: {
    brightness: 60,
    grayscale: 0,
    blur: 30,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    ...Storage.get('bg_info', true, '{}')
  },
}

const result = {};

Object.keys(state).forEach(k => result[k] = [k, reactive(state[k])])

const mixHandle = (type, keys) => {
  const func = { provide, inject }[type];
  const obj = {};
  const singleProvide = (k) => {
    if (!result[k]) {
      return;
    }
    obj[k] = func(...result[k]);
    if (type === 'provide')
      obj[k] = result[k][1]
  }
  if (typeof keys === 'string') {
    singleProvide(keys)
  } else if (Array.isArray(keys)) {
    keys.forEach(k => singleProvide(k))
  }
  return obj;
}

export const mixProvide = (keys) => mixHandle('provide', keys);

export const mixInject = (keys) => mixHandle('inject', keys);

export const allProvide = () => mixProvide(Object.keys(state));


export default result;