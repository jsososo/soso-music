import { reactive, provide, inject } from 'vue';
import Storage from "../Storage";

const state = {
  // 用户信息
  user: {
    163: {},
    qq: {},
    soso: {},
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
  },
  // 播放列表
  playingList: {
    random: [],
    raw: [],
    map: {},
    trueList: [],
    history: [],
    index: 0,
  },
  // 正在播放的音乐
  playNow: {},
  playerStatus: {
    playing: false,
    loading: true,
  },
  downloadList: Storage.get('soso_music_download', true, '[]').map((v) => {
    if (!v.finished) {
      v.finished = true;
      v.waiting = false;
      v.errMsg = '下载中断';
    }
    return v;
  }),
  // 系统设置
  setting: {
    path: '',
    platform: '163', // 默认平台
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
    SERVER_PORT: '3090',
    codeMap: {
      PLAY_NEXT: '39',
      PLAY_PREV: '37',
      VOLUME_UP: '38',
      VOLUME_DOWN: '40',
      PLAY: '32',
      QUIT_SIMPLE: '27',
      TO_SIMPLE: ''
    },

    ...Storage.get('soso_music_setting', true, '{}'),
  },
}

const result = {};

Object.keys(state).forEach(k => {
  result[k] = [k, reactive(state[k])];
})

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