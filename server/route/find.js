const Search = require('../mixApi/routes/search');
const Url = require('../mixApi/routes/url');
const storage = require('electron-json-storage');

module.exports = {
  // 查找，根据关键词从其他平台获取播放链接
  async ['/']({req, res, request, platform, dataHandle, R, port}) {
    const {list = []} = req.query;
    global.findMap = global.findMap || {};
    const {findMap} = global;
    let updateFind = false;
    const reqFunction = async ({id, key, duration}) => {
      try {
        if (platform !== 'migu') {
          if (findMap[key]) {
            const s = findMap[key];
            return [id, s.cid, 'migu', s.url, s.flac];
          }
          const { data: s = {}} = await request({
            domain: `http://localhost:${port}/miguApi`,
            url: 'song/find',
            data: { keyword: key, duration }
          }).catch(() => ({}))
          if (s && s.cid) {
            updateFind = true;
            findMap[key] = s;
            return [id, s.cid, 'migu', s.url, s.flac];
          }
        }
        const _p = {
          163: 'qq',
          qq: '163',
          migu: 'qq',
        }[platform] || 'qq';
        const queryRes = await Search["/"]({
          req: {
            query: {
              key,
              pageNo: 1,
              pageSize: 5,
            }
          },
          platform,
          request,
          dataHandle,
        })
        const findSong = (queryRes.data.list || []).find((item) => {
          if (duration) {
            return (item.duration <= duration + 3) && (item.duration >= duration - 3)
          }
          return true;
        });
        if (!findSong) {
          return [id, ''];
        }
        return [id, findSong.id, findSong.platform];
      } catch {
        return [id, ''];
      }
    }

    Promise.all(list.map((obj) => reqFunction(obj)))
      .then(async (resArr) => {
        const sendResult = {};
        const data = {};
        let fp = '';
        resArr.forEach(([id, fId, p, u, fu]) => {
          if (p === 'migu') {
            return sendResult[id] = {
              url: u,
              flac: fu,
              bId: fId,
              platform: 'migu',
            }
          }
          if (fId) {
            data[id] = fId;
            fp = p;
          }

        });
        const urlRes = await Url["/batch"]({
          req: {query: {id: Object.values(data).join(',')}},
          request,
          platform: fp,
          R,
        }).catch(err => {
          console.log('song/find url res', err.message)
        });
        Object.keys(data).forEach((k) => {
          if (urlRes[data[k]]) {
            sendResult[k] = {
              url: urlRes[data[k]],
              bId: data[k],
              bPlatform: fp,
            };
          }
        })
        updateFind && storage.set('find_data', findMap);
        return res.send({
          result: 100,
          data: sendResult,
        });
      })
  }
}