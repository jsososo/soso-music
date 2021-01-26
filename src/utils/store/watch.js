import { watch, toRaw } from 'vue';
import {getLyric, search, updatePlayingList} from './action';
import Storage from "../Storage";
import { ipcRenderer } from 'electron';
import { ElMessage } from "element-plus";

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
  } = state;

  // 设置
  watch(() => Object.values(setting), () => Storage.set('soso_music_setting', toRaw(setting), true))

  // 搜索
  watch(() => [searchInfo.keyword, searchInfo.type, searchInfo.pageNo, searchInfo.platform], async (
    newVal,
    oldVal
  ) => {
    if (newVal[2] !== oldVal[2]) {
      searchInfo.pageNo = 1;
    }

    await search(searchInfo);
  })

  // 更新正在播放的音乐
  watch(() => playNow.aId, async (aId) => {
    const s = allSongs[aId];
    !playingList.map[aId] && updatePlayingList([aId]);
    Object.keys(playNow).forEach((k) => delete playNow[k]);
    Object.keys(s).forEach(k => playNow[k] = s[k]);
    !s.lyric && getLyric(aId);
  })

  // 更新正在播放的列表
  watch(() => playingList.raw, (raw) => {
    const map = {};
    const trueList = [];

    (raw.indexOf(playNow.aId) < 0) && raw.push(playNow.aId);

    // 筛选出有音乐的列表
    raw.forEach((aId) => {
      map[aId] = true;
      allSongs[aId].url && trueList.push(aId);
    })
    playingList.map = map;
    playingList.trueList = trueList;
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

  // 更新后端端口
  watch(() => setting.SERVER_PORT, (v) => ipcRenderer.send('UPDATE_SERVER_POINT', v));

  // 计算播放进度比例
  watch(() => playerStatus.currentTime, (v) => playerStatus.percentage = v / playerStatus.duration)

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

  ipcRenderer.on('REPLY_SELECT_DIR', (e, { path, type }) => {
    const { setting } = window.$state;
    switch (type) {
      case 'download':
        path && (setting.DOWN_DIR = path);
        break;
    }
  })

  return state;
}