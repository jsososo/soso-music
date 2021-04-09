import { watch, toRaw } from 'vue';
import {getLyric, search, updatePlayingList, downReq, setWinLyric, updateSongInfo} from './action';
import Storage from "../Storage";
import { useRoute, useRouter } from 'vue-router';
import { ipcRenderer } from 'electron';
import { ElMessage } from "element-plus";
import request from "../request";

// 监听变化
export const allWatch = (state) => {
  window.$state = state;
  const {
    searchInfo,
    playNow,
    allSongs,
    playingList,
    playerStatus,
    setting,
    downloadList,
    downloadInfo,
    favSongMap,
    user,
  } = state;

  const route = useRoute();
  const router = useRouter();

  // 监听 播放歌曲，喜欢状态，登录状态等，用来控制 menu & trayMenu 的相关显示
  watch(() => [playNow.aId, playerStatus.playing, playNow.liked, user.qq, user['163']], () => {
    ipcRenderer.send('UPDATE_PLAYING_STATUS', {
      name: playNow.name,
      liked: playNow.liked || (playNow.platform && favSongMap[playNow.platform][playNow.aId]),
      logined: !!(user[playNow.platform] || {}).logined,
      status: playerStatus.playing,
    })
  })

  // 监听路由变化，前进后退存储
  watch(() => route.fullPath, (v) => {
    const { isBack, isReBack, history, back } = state.router;
    if (isBack && history.length > 1) {
      state.router.isBack = false;
      return back.unshift(history.pop());
    }
    if (isReBack && back.length) {
      state.router.isReBack = false;
      return history.push(back.shift());
    }
    history.push(v);
    state.router.back = [];
  })

  // 监听 soso music 账号信息变更
  watch(() => state.user.soso, (v) => Storage.set('soso_user', v, true))

  // 触发了路由后退
  watch(() => state.router.isBack, (v) => v && (state.router.history.length > 1) && router.back());

  // 触发了路由前进
  watch(() => state.router.isReBack, (v) => v && (state.router.back.length) && router.push(state.router.back[0]));

  // 查找到的 咪咕音乐信息
  watch(state.miguFind, (v) => Storage.set('soso_music_migu_find', toRaw(v), true));

  // 设置
  watch(() => Object.values(setting), () => Storage.set('soso_music_setting', toRaw(setting), true))

  watch(() => setting.volume, (v) => playerStatus.pDom && (playerStatus.pDom.volume = v / 100));

  // 搜索
  watch(() => [searchInfo.pageNo, searchInfo.keyword, searchInfo.type, searchInfo.platform], async (
    newVal,
    oldVal
  ) => {
    (newVal[0] === oldVal[0]) && (searchInfo.pageNo = 1)
    if (searchInfo.pageNo > 1 && searchInfo.isQuerying) {
      return;
    }
    await search(searchInfo);
  })

  // 更新正在播放的音乐
  watch(() => playNow.aId, async (aId, oldAId) => {
    const s = allSongs[aId];
    const { id, songid, platform, al } = s;
    const oldS = allSongs[oldAId];
    !playNow.localPath && (playNow.liked = favSongMap[platform][aId]);

    // 网易云的歌曲，有一个打卡
    if (oldS && oldS.platform === '163') {
      request({
        api: 'SCROBBLE',
        data: {
          id,
          sourceid: al.id || 'daily',
          time: Math.round(playerStatus.currentTime),
        }
      })
    }

    // 一首歌结束时进度过半，就加入播放历史
    (playerStatus.percentage > 0.5) && state.playHistory.push(oldAId);

    // mediaSession，可以让系统支持切歌播放等
    if ('mediaSession' in navigator && window.MediaMetadata) {
      const { name, ar = [], al = {} } = s;
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: name,
        artist: ar.map((v) => v.name).join('/'),
        album: al.name,
        artwork: [
          {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '96x96'},
          {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '128x128'},
          {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '192x192'},
          {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '256x256'},
          {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '384x384'},
          {src: al.picUrl || 'http://p2.music.126.net/ftPcA5oCeIQxhiNmEpmtKw==/109951163926974610.jpg', sizes: '512x512'},
        ]
      });
    }

    !playingList[aId] && updatePlayingList([aId]);
    Object.keys(playNow).forEach((k) => delete playNow[k]);
    Object.keys(s).forEach(k => playNow[k] = s[k]);
    (!s.lyric) && !s.localPath &&  getLyric(aId);
    setWinLyric();

    if (!s.localPath) {
      const { data: { list = [], total = 0 }} = await request({
        api: 'COMMENT',
        data: {
          id: songid || id,
          platform,
          hot: 1,
        }
      })
      playNow.hotComments = list;
      playNow.totalComments = total;
    } else {
      ipcRenderer.send('LOAD_FILE_BUF', playNow.localPath);
    }

    Storage.set('soso_music_last_play', playNow.aId);
  })

  // 更新正在播放的列表
  watch(() => playingList.raw, (raw) => {
    !playingList[playNow.aId] && raw.push(playNow.aId);

    // 筛选出有音乐的列表
    playingList.trueList = raw.filter((aId) => allSongs[aId].url);

    // 存到 localStorage 下次登录可能会有用
    Storage.set('soso_music_last_list', raw.map((aId) => ({
      ...allSongs[aId],
      pUrl: undefined,
      url: undefined,
      noUrl: undefined,
    })), true);
  })

  // 监听正在播放的列表，用来更新随机列表
  watch(() => playingList.trueList, (trueList) => {
    // 随机算法
    const random = [...trueList];
    for (let i = random.length - 1; i > 1; i--) {
      const r = Math.floor(Math.random() * i);
      [random[r], random[i]] = [random[i], random[r]];
    }
    // 把正在播放的挪到第一个
    const index = random.indexOf(playNow.aId);
    [random[0], random[index]] = [random[index], random[0]];
    playingList.random = random;
    playingList.history = [];
    playingList.index = 0;
  })

  // 更新播放、暂停状态，并同步给对应的dom
  watch(() => playerStatus.playing, (v) => {
    const { pDom } = playerStatus;
    if (v) {
      pDom ? pDom.play() : (playerStatus.playing = false)
    } else {
      pDom && pDom.pause();
    }
  })

  // 当正在下载的歌曲小于3，就继续下载
  watch(() => downloadInfo.count, (v) => (v < 3) && downReq(downloadList.filter((v) => v.waiting).pop()))

  // 更新后端端口
  watch(() => setting.SERVER_PORT, (v) => ipcRenderer.send('UPDATE_SERVER_POINT', v));

  // 监听播放进度
  watch(() => playerStatus.currentTime, (v) => {
    // 计算播放进度百分比
    playerStatus.percentage = v / playerStatus.duration;
    // 计算出当前展示歌曲
    const key = Math.floor(v * 1000);
    const { winLyric = {}, lyric } = playNow;
    const { keys = [], list = [] } = winLyric;
    const nextIndex = keys.findIndex((v) => Number(v) > key);
    const index = nextIndex < 0 ? (keys.length - 1) : nextIndex - 1;
    const nextKey = Number(keys[nextIndex]);
    if (index !== winLyric.index && keys && keys[index]) {
      winLyric.index = index;
      list[index%2] = lyric[keys[index]];
      list[nextIndex%2] = lyric[nextKey];

      Storage.set('soso_music_win_lyric', winLyric, true)
    }
  })

  // 监听download
  watch(downloadList, (v) =>
    Storage.set('soso_music_download', toRaw(v).map((s) => ({...s, ajax: undefined})), true)
  );

  // 更新了后端的端口
  ipcRenderer.on('REPLY_SERVER_PPINT', (e, { result, errMsg }) => {
    result ?
      ElMessage.success('启动成功！') :
      ElMessage.error(`启动失败，建议：${errMsg}`)
  })

  // 选择文件夹地址
  ipcRenderer.on('REPLY_SELECT_DIR', (e, { path, type }) => {
    const { setting } = window.$state;
    switch (type) {
      case 'download':
        path && (setting.DOWN_DIR = path);
        break;
    }
  })

  // 是否显示桌面歌词
  ipcRenderer.on('REPLY_SHOW_LYRIC_WINDOW', (e, val) => {
    // console.log('show win lyric reply', val);
    state.setting.SHOW_WIN_LYRIC = val;
  })

  ipcRenderer.on('RPL_FILE_BUF', (e, { path, buf }) => {
    const aId = `local_${path}`;
    const s = allSongs[aId];
    s.file = new File([buf], aId);
    s.url = s.pUrl = URL.createObjectURL(s.file);
    if (aId === playNow.aId) {
      playNow.pUrl = playNow.url = s.url;
    }
  })


  // 返回了听歌历史数据
  ipcRenderer.on('REPLY_HISTORY_DATA', (e, v) => state.playHistory.initHistory(v))

  ipcRenderer.on('SET_SYSTEM_PLATFORM', (e, v) => state.setting.SYSTEM_PLATFORM = v);

  ipcRenderer.on('ADD_LOCAL_FILE', (e, v) => updateSongInfo(v))

  return state;
}