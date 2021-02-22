// import { mixInject } from "./store";
import arrayHelper from '../arrayHelper';
import request from "../request";
import {handleLyric, transUrl} from "../stringHelper";
import axios from 'axios';
import Download from "../download";
import Id3 from "browser-id3-writer";
import timer from "../timer";
import Storage from "../Storage";
import {ElMessage} from "element-plus";

// 更新歌曲信息，有链接的走这边，会顺带更新播放列表
export const updateSongInfo = (songInfo) => {
  const {allSongs, playingList, playNow} = window.$state;
  const arr = Array.isArray(songInfo) ? songInfo : [songInfo];

  let needUpdateList = false;
  arr.forEach(info => {
    const {aId, url} = info;
    allSongs[aId] = {...(allSongs[aId] || {}), ...info}
    needUpdateList = needUpdateList || (playingList[aId] && url);

    // 更新一下 playNow
    (aId === playNow.aId) && (Object.keys(info).forEach(k => playNow[k] = info[k]))
  })

  needUpdateList && (playingList.trueList = playingList.raw.filter((aId) => allSongs[aId].url));

}

// 获取单个歌曲的链接
export const getSingleUrl = async (aId, type = 'play') => {
  const {allSongs, setting} = window.$state;

  const s = allSongs[aId];
  if (!s.url) {
    return false;
  }

  const bId = s.bId || aId;
  const [_p, id] = bId.split('_');

  let url = s.url, br = 128000, songEndType = 'mp3';

  const brMap = new Proxy({
    128: 'url',
    320: '320'
  }, {
    get(v, k) {
      return v[k] ? v[k] : 'flac';
    }
  })

  const queryBr = setting[type === 'play' ? 'LISTEN_SIZE' : 'DOWN_SIZE'];

  if (s[brMap[queryBr]] && (url.indexOf('.m4a') === -1)) {
    url = s[brMap[queryBr]];
    br = {128: 128000, 320: 320000, flac: 960000}[queryBr] || 128000;
  } else if (!s.bPlatform) {
    try {
      const {data} = await request({
        api: 'SINGLE_URL',
        data: {
          id,
          mediaId: s.mediaId,
          br: queryBr,
          _p,
        }
      });
      url = data.url || url;
      br = data.br || br;
    } catch (err) {
      console.log('获取url失败了 =.=', id, aId, _p);
    }
  }

  (br > 320000) && (songEndType = 'flac');
  (url.indexOf('.m4a') > -1) && (songEndType = 'm4a');

  if (type === 'play') {
    s.pUrl = url;
    s.br = br;
  } else {
    s.dUrl = url;
    s.dBr = br;
  }

  return {
    url,
    songEndType,
    br,
  }
}

// 因为调用migu 音乐太费时了，所以改成队列的方式
const findMusic = {
  quene: [],
  num: 0,
  push(aId) {
    const {quene} = this;
    if (aId) {
      quene.unshift(aId);
    }
    if (this.num < 2 && quene.length) {
      const {allSongs, miguFind} = window.$state;
      this.num += 1;
      const aId = quene.shift();
      const song = allSongs[aId] || {name: '', ar: []};
      song.noUrl = true;
      const key = `${song.name.replace(/\(|\)|（|）/g, ' ')} ${song.ar.map((a) => a.name).join(' ')}`;

      const endCb = (data) => {
        miguFind[key] = {};
        if (data) {
          song.noUrl = false;
          const {bId, url, platform, flac} = data;
          miguFind[key] = data;
          song.bId = bId;
          song.url = url;
          song.bPlatform = platform;
          song.flac = flac;
          song.br = flac ? 960000 : 128000;
          song.pUrl = flac || url;
        }
        this.num -= 1;
        this.push();
      }

      if (miguFind[key]) {
        return endCb((miguFind[key]))
      }

      request({
        api: 'SONG_FIND',
        method: 'post',
        data: {
          list: [{
            key,
            id: aId,
            duration: song.duration,
          }],
          _p: song.platform,
        }
      }).then(({data}) => {
        endCb(data[aId]);
      }).catch(() => {
        endCb();
      })
    }
  },

}

// 批量获取 url
export const getBatchUrl = (list) => {
  const {allSongs} = window.$state;
  const map = {};

  // 把传进来的歌曲分类分好
  list.forEach((aId) => {
    const {platform} = allSongs[aId];
    map[platform] = map[platform] || [];
    map[platform].push(aId);
  })

  // 各个平台自己去获取
  Object.keys(map).forEach(platform => {
    const arr = map[platform];
    arr.reverse();

    // 这个接口一次查询99首
    while (arr.length) {
      const qArr = arr.splice(-99).map((id) => id.replace(`${platform}_`, ''));
      request({
        api: 'BATCH_URL',
        method: 'post',
        data: {
          id: qArr.join(','),
          _p: platform
        }
      }).catch(() => {
        return {data: {}}
      }).then(({data}) => {
        // 把查到的链接放入 allSongs，没有链接的放入 fArr
        const uArr = [];
        qArr.forEach((id) => {
          const aId = `${platform}_${id}`;
          const url = data[id];
          url ? uArr.push({
              aId,
              url,
              pUrl: url,
              br: 128000,
            }) :
            findMusic.push(aId);
        })

        updateSongInfo(uArr);
      })
    }
  })
}

// 歌曲的批量处理
export const handleSongs = (list) => {
  const {allSongs} = window.$state;
  const getUrlArr = [];
  list.forEach((s) => {
    s.url = s.url || (allSongs[s.aId] || {}).url;
    allSongs[s.aId] = {...(allSongs[s.aId] || {}), ...s};
    !allSongs[s.aId].url && !allSongs[s.aId].noUrl && (getUrlArr.push(s.aId));
  })

  getBatchUrl(getUrlArr);
  return list.map(({aId}) => aId);
}

// 批量处理歌单
export const handlePlayLists = (list) => {
  const {allList} = window.$state;
  return list.map((p) => {
    p.aId = p.aId || p.listId;
    allList[p.aId] = {...(allList[p.aId] || {}), ...p};
    allList[p.aId].list = (allList[p.aId].list || []).map((s) => typeof s === 'string' ? s : s.aId);
    return p.aId;
  })
}

// 查询歌单详情
export const queryPlayListDetail = async (aId) => {
  const [_p, id] = aId.split('_');
  const {data} = await request({
    api: 'PLAYLIST',
    data: {id, _p}
  }).catch(() => ({aId}))
  data && handlePlayLists([data]);
  if (data.list && (typeof data.list[0] === 'object')) {
    handleSongs(data.list);
    data.list = data.list.map(({aId}) => aId);
  }
  return data;
}

// 搜索
export const search = async ({keyword: key, type, pageNo, pageSize}) => {
  const _p = window.$state.setting.platform;
  const {data: {list, total}} = await request({
    api: 'SEARCH',
    data: {key, type, _p, pageSize, pageNo},
  })
  const {searchInfo} = window.$state;
  switch (Number(type)) {
    case 0:
      handleSongs(list);
      searchInfo.result[type] = list.map(({aId}) => aId);
      break;
    case 1:
      handlePlayLists(list);
      searchInfo.result[type] = list.map(({aId}) => aId);
      break;
    default:
      searchInfo.result[type] = list;
      break
  }
  searchInfo.total = total;
}

// 更新播放队列
export const updatePlayingList = (list, force) => {
  const {playingList, playNow} = window.$state;

  if (force) {
    playingList.raw = list;
    playingList.history = [playNow.aId];
    playingList.index = 0;
  } else {
    playingList.raw = arrayHelper.delDuplicate(playingList.raw, list);
  }
}

// 更新当前播放歌曲 & 且更新播放队列
export const updatePlaying = (aId, list, force = true) => {
  const {playNow} = window.$state;
  playNow.aId = aId;
  updatePlayingList(list, force);
}

// 上一首
export const playPrev = () => {
  const {playingList, allSongs, playNow, setting} = window.$state;
  const {history, index, trueList, random} = playingList;
  const {orderType} = setting;
  const {aId} = playNow;
  if (index > 0) {
    playingList.index -= 1;
    if (!history[playingList.index] || !allSongs[history[playingList.index]]) {
      return;
    }
    playNow.aId = history[playingList.index];
  }

  let i = 0;
  const list = orderType === 'suiji' ? random : trueList;
  i = list.indexOf(aId);
  i -= 1;
  if (i < 0) {
    i = list.length - 1;
  }
  if (!list[i] || !allSongs[list[i]]) {
    return;
  }
  playNow.aId = list[i];
  history.unshift(playNow.aId);
}

// 下一首
export const playNext = () => {
  const {playingList, allSongs, playNow, setting, playerStatus} = window.$state;
  const {orderType} = setting;
  const {history, index, trueList, random} = playingList;
  const {aId} = playNow;
  playingList.index += 1;
  if (index < history.length - 1) {
    return playNow.aId = history[playingList.index];
  }
  if (aId && playingList.history[playingList.history.length - 1] !== aId) {
    playingList.history.push(aId);
  }

  let i = 0;
  // if (trueList.length === 1) {
  //   window.VUE_APP.$message.info('还是这首！');
  //   window.pDom.play();
  //   return;
  // }
  let nextId = '';
  switch (orderType) {
    case 'suiji':
      i = random.indexOf(aId);
      i += 1;
      (i === trueList.length) && (i = 0);
      if (!allSongs[random[i]]) {
        return;
      }
      nextId = random[i];
      break;
    default:
      i = trueList.indexOf(aId);
      i += 1;
      if (i === trueList.length) {
        i = 0;
      }
      if (!allSongs[trueList[i]]) {
        return;
      }
      nextId = trueList[i]
      break;
  }
  (nextId === playNow.aId) && (playerStatus.pDom.currentTime = 0);
  nextId && (playNow.aId = nextId);

}

// 切歌
export const cutSong = (type) => ({
  next: playNext,
  prev: playPrev,
})[type]();

// 获取单首歌曲的 url
export const getUrl = async (id, br, _p) => {
  return request({
    api: 'SINGLE_URL',
    data: {
      id,
      br,
      _p
    }
  })
}

// 获取用户歌单
export const getUserList = async ({id, platform} = {}) => {
  const {user, setting} = window.$state;
  const _p = platform || setting.platform;
  const uId = id || user[_p].id;

  if (!uId) {
    return false
  }

  const {data} = await request({
    api: 'USER_PLAYLIST',
    data: {
      ownCookie: 1,
      id: uId,
      _p,
    }
  })

  const listIds = handlePlayLists(data)

  if (uId === user[_p].id) {
    user[_p].subList = user[_p].subList || {};
    user[_p].myList = user[_p].myList || {};

    user[_p].playlist = listIds;

    user[_p].favId = listIds[0];

    data.forEach(({creator: {id}, aId}) => {
      (`${id}` === `${uId}`) ?
        (user[_p].myList[aId] = 1) :
        (user[_p].subList[aId] = 1)
    })
  }

  return listIds;

}

// 网易云登录校验
export const get163LoginStatus = async () => {
  const {account, profile} = await request('LOGIN_STATUS').catch(() => ({}));
  if (!account) {
    return false;
  }
  const {user, setting, favSongMap} = window.$state;
  user['163'] = {
    ...account,
    ...profile,
    nick: profile.nickname,
    avatar: profile.avatarUrl,
    desc: profile.signature,
    logined: true,
  };
  setting.store_163 = setting.store_163 || user.id;
  getUserList({platform: '163'})
  try {
    const res = await request({
      api: '163_LIKELIST',
      data: {ud: user['163'].id}
    })
    const map = {};
    (res.ids || []).forEach(id => map[`163_${id}`] = 1);
    favSongMap[163] = map;
  } catch (err) {
    console.log('163 likelist err', err.message)
  }
  return true;
}

// qq 登录状态检查
export const getQQLoginStatus = async (c) => {
  const cookieObj = {};
  let cookie;
  if (c) {
    cookie = c;
    Storage.set('q_cookie', c);
    Storage.set('q_cookie_time', new Date().valueOf());
  } else {
    if (Storage.get('q_cookie_time') < new Date().valueOf() - 86400000) {
      Storage.set('q_cookie_time', 0);
      return false;
    }
    cookie = Storage.get('q_cookie');
  }
  const {setting, user, favSongMap} = window.$state;

  if (typeof cookie === 'string') {
    cookie.split(';').forEach((v) => {
      const [key, value] = v.replace(/\s/g, '').split('=');
      cookieObj[key] = value;
    })
  } else {
    return false
  }

  // 微信
  ((cookieObj.login_type / 1) === 2) && (cookieObj.uin = cookieObj.wxuin);
  cookieObj.uin = (cookieObj.uin || '').replace(/\D/g, '');

  const {uin} = cookieObj;

  if (!uin) {
    Storage.set('q_cookie_time', 0);
    return false;
  }
  const result = cookieObj['qm_keyst'];

  if (!result || result === setting.oldQmKeyst) {
    Storage.set('q_cookie_time', 0);
    return false;
  }

  setting.qCookie = cookie;
  user.qq.id = uin;
  user.qq.logined = true;
  setting.store_qq = setting.store_qq || uin;
  c && await request({api: 'SET_COOKIE', method: 'post', data: {cookieObj}})
  const {data: {creator}} = await request({api: 'QQ_USER_DETAIL', data: {id: user.qq.id}});
  user.qq = {
    ...user.qq,
    ...creator,
    avatar: creator.headpic,
  }
  getUserList({platform: 'qq'})
  try {
    const res = await request('QQ_SONG_LIST_MAP')
    const map = {};
    Object.keys(res.data.mid).forEach((mid) => map[`qq_${mid}`] = 1)
    favSongMap.qq = map;
  } catch (err) {
    console.log('qq favmap err', err.message);
  }
  return true;
}

// 获取日推
export const getDaily = async (platform) => request({api: 'DAILY_PLAYLIST', data: {ownCookie: 1}}, platform)

// 第一次登录的时候调用
export const initLogin = () => {
  Promise.all([get163LoginStatus(), getQQLoginStatus()])
    .then(loginRes => {
      const platform = ['163', 'qq'];
      loginRes.forEach((res, i) => res && getDaily(platform[i]));
    })
}

// 获取歌词
export const getLyric = async (aId) => {
  const {allSongs} = window.$state;
  const s = allSongs[aId];
  const {data: {lyric, trans}} = await request({api: 'LYRIC', data: {id: s.id, _p: s.platform}})
  let lyricObj = {};
  lyric && handleLyric(lyric, 'str', lyricObj);
  trans && handleLyric(trans, 'trans', lyricObj);
  !lyric && !trans && (
    lyricObj = {
      0: {
        str: '没有歌词哟，好好享受',
      },
    });

  updateSongInfo({aId, lyric: lyricObj, rawLyric: lyric, rawTrans: trans})
}

// 获取下载的歌名
const getDownName = (aId, endType) => {
  const {allSongs, setting} = window.$state;
  const s = (typeof aId === 'string') ? allSongs[aId] : aId;
  const arName = (s.ar || []).map(({name}) => name).join('/');
  let filename;
  switch (setting.DOWN_NAME / 1) {
    case 2:
      filename = `${s.name}-${arName}`;
      break;
    case 3:
      filename = s.name;
      break;
    default:
      filename = `${arName}-${s.name}`;
      break;
  }
  return `${filename}.${endType}`;
}

// 下载歌词
const downLyric = async (info) => {
  const {allSongs, setting} = window.$state;
  let {aId, rawLyric, rawTrans} = info;
  if (!rawLyric) {
    await getLyric(aId);
    info = {...info, ...allSongs[aId]}
    rawLyric = info.rawLyric;
    rawTrans = info.rawTrans;
  }

  if (!rawLyric) {
    return false;
  }

  let lyric = rawLyric;

  if (setting.DOWN_TRANS && rawTrans) {
    const lyricArr = lyric.split('\n');
    const transArr = info.rawTrans.split('\n');
    const result = [];
    lyricArr.forEach((str) => {
      result.push(str);
      const times = str.match(/\[\d+:\d+.\d+\]/);
      if (times) {
        const transStr = transArr.find((v) => v.indexOf(times[0]) > -1);
        transStr && result.push(transStr);
      }
    })
    lyric = result.join('\n');
  }

  setTimeout(() => {
    Download(lyric, getDownName(info, 'lrc'))
  }, 3000)
}

// 下载歌曲，并把同时下载的数量控制在3
export const downReq = async (info) => {
  const {downloadList, setting, downloadInfo} = window.$state;
  if (!info || downloadInfo.count >= 3) {
    return;
  }
  downloadInfo.count += 1;
  const {dUrl, filename, name, ar, al, songEndType} = info;
  let picData;
  const getDInfo = () => downloadList.find((v) => v.dId === info.dId);
  info.waiting = false;
  info.progress = 0;
  let {data} = await axios({
    url: transUrl(dUrl),
    responseType: 'arraybuffer',
    onDownloadProgress: ({loaded, total}) => getDInfo().progress = (loaded / total * 100).toFixed(2) / 1,
  }).catch((err) => {
    getDInfo().errMsg = err.message;
    return {};
  });

  if (info.al.picUrl) {
    try {
      const pic = await axios({
        url: al.picUrl,
        responseType: 'arraybuffer',
      })
      picData = pic.data;
    } catch (err) {
      console.log('下载图片失败：', err.message);
    }
  }

  if (!data) {
    downloadInfo.count -= 1;
    return getDInfo().finished = true;
  }

  // 填写 id3 信息
  const writer = new Id3(data);
  writer.setFrame('TIT2', name)
    .setFrame('TPE1', ar.map(a => a.name))
    .setFrame('TALB', al.name)
    .setFrame('TRCK', data.trackNo || '');
  info.publishTime && writer.setFrame('TYER', timer(info.publishTime).str('YYYY'));
  picData && writer.setFrame('APIC', {type: 3, data: picData, description: al.name});
  (songEndType !== 'm4a') && writer.addTag();

  const downLink = document.createElement('a')
  downLink.download = filename;
  //字符内容转换为blod地址
  downLink.href = writer.getURL();
  // 链接插入到页面
  document.body.appendChild(downLink)
  downLink.click()
  // 移除下载链接
  document.body.removeChild(downLink)

  getDInfo().finished = true;
  getDInfo().successed = true;
  setting.DOWN_LYRIC && downLyric(info);
  downloadInfo.count -= 1;
}

// 触发下载
export const download = async (aId, info) => {
  window.event && window.event.stopPropagation();
  const {allSongs, downloadList} = window.$state;
  const s = info || allSongs[aId];
  const {br, songEndType, url} = await getSingleUrl(aId, 'download');

  const dInfo = {
    ...s,
    waiting: true,
    filename: getDownName(s, songEndType),
    lyric: undefined,
    progress: 0,
    finished: false,
    successed: false,
    br,
    dUrl: url,
    dId: `${aId}${(new Date().valueOf()).toString(36)}`
  }
  downloadList.unshift(dInfo);
  // 如果下载列表本地存储最大 2000
  (downloadList.length > 2000) && downloadList.pop();
  downReq(dInfo);
}

// 添加/删除 歌曲至歌单
export const addSong2Playlist = async ({aId, pId, type, toast = true}) => {
  const {allSongs, allList, user, listInfo, favSongMap, playNow} = window.$state;
  const s = allSongs[aId];
  if (!s) {
    return;
  }
  await request({
    api: 'SONG_PLAYLIST',
    data: {
      id: s.songid || s.id,
      mid: s.mid,
      pId,
      type,
      platform: s.platform,
    }
  })
  let l
  switch (s.platform) {
    case 'qq':
      l = Object.values(allList).find(({dirid, userId}) => userId === user.qq.id && dirid === pId);
      if (pId === 201) {
        favSongMap.qq[s.aId] = !!type;
        (s.aId === playNow.aId) && (playNow.liked = !!type)
      }
      break;
    case '163':
      l = allList[`${s.platform}_${pId}`];
      if (`${s.platform}_${pId}` === user['163'].favId) {
        favSongMap['163'][s.aId] = !!type;
        (s.aId === playNow.aId) && (playNow.liked = !!type)
      }
      break;
  }
  if (l) {
    type ?
      l.list.unshift(aId) :
      (l.list = l.list.filter((v) => v !== aId))

    listInfo.aId === l.aId && (listInfo.list = l.list);
  }

  toast && ElMessage.success('操作成功');
}

// 喜欢/不喜欢 音乐
export const likeMusic = async (aId) => {
  window.event && window.event.stopPropagation();
  const {allSongs, favSongMap, user, allList, playNow} = window.$state;
  const {platform} = allSongs[aId] || {};
  if (!user[platform] || !user[platform].id) {
    return ElMessage.warning('先登录');
  }
  const type = !favSongMap[platform][aId] / 1

  let pId;
  switch (platform) {
    case 'qq':
      pId = 201;
      break;
    case '163':
      pId = allList[user[platform].favId].id;
      break;
  }
  (aId === playNow.aId) && (playNow.liked = !!type);
  await addSong2Playlist({aId, pId, type, toast: false});
  favSongMap[platform][aId] = type;
  ElMessage.success(type ? '爱上！' : '爱过～')
}

// 一些通用的歌曲操作处理
export const mixSongHandle = {
  download,
  addToPlaying(list) {
    window.event.stopPropagation();
    updatePlayingList(list);
  },
  removeFromPlayinig(list) {
    window.event.stopPropagation();
    updatePlayingList(window.$state.playingList.raw.filter((id) => id.indexOf(list) === -1), true)
  },
  likeMusic,
  delSongFromList(aId, pId) {
    window.event.stopPropagation();
    addSong2Playlist({aId, pId, type: 0})
  }
}
