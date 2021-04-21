import { ipcRenderer } from 'electron';

export default class PlayHistory {
  constructor() {

  }

  initHistory(data) {
    this._history = data;
  }

  _history = {};

  // 按最近播放排序
  get list() {
    return Object.values(this._history)
      .sort((a, b) => b.lastListen - a.lastListen)
  }

  // 按总播放次数排序
  get times() {
    return Object.values(this._history)
      .sort((a, b) => b.historyCount - a.historyCount)
  }

  // 按最近一周播放排序
  get week() {
    return Object.values(this._history)
      .filter(v => {
        v.weekListen = v.listenTime.filter((t) => t >= new Date().valueOf() - 86400000 * 7);
        return v.weekListen.length;
      })
      .sort((a, b) => b.weekListen.length - a.weekListen.length)
  }

  push(aId) {
    const { allSongs } = window.$state;

    const history = this._history;
    let s = history[aId];
    if (!s) {
      s = {
        historyCount: 0,
        listenTime: [],
      };
      [
        'aId', 'bId', 'platform', 'bPlatform', 'al', 'ar', 'name', 'id',
        'songid', 'publishTime', 'mvId', 'trackNo', 'duration', 'localPath'
      ]
        .forEach((k) => s[k] = allSongs[aId][k]);
      history[aId] = s;
    }

    const now = new Date().valueOf();

    s.historyCount += 1;
    s.lastListen = now;
    s.listenTime.push(now);

    ipcRenderer.send('UPDATE_HISTORY_DATA', JSON.parse(JSON.stringify(history)));
  }
}
