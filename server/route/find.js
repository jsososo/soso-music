const Search = require('../mixApi/routes/search');
const Url = require('../mixApi/routes/url');

module.exports = {
  // 查找，根据关键词从其他平台获取播放链接
  async ['/']({req, res, request, platform, dataHandle, R, port}) {
    const {list = []} = req.query;
    let updateFind = false;
    const reqFunction = async ({id, key, duration, noMatch = []}) => {
      try {
        if (platform !== 'migu') {
          const { data: s = {}} = await request({
            domain: `http://localhost:${port}/miguApi`,
            url: 'song/find',
            data: { keyword: key, duration, noMatch }
          }).catch(() => ({}))
          if (s && s.cid) {
            updateFind = true;
            s.platform = 'migu';
            s.url = s[128] || s[320] || s.flac;
            return [id, s];
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
        console.log('hello world',queryRes.data.list)
        const findSong = (queryRes.data.list || [])
          .filter(({ cid }) => noMatch.indexOf(cid) === -1)
          .find((item) => {
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

    console.log(list);
    Promise.all(list.map((obj) => reqFunction(obj)))
      .then(async (resArr) => {
        const sendResult = {};
        const data = {};
        let fp = '';
        resArr.forEach(([id, s]) => {
          if (s.platform === 'migu') {
            return sendResult[id] = {
              ...s,
              bId: s.cid,
              platform: 'migu',
            }
          }
          if (s.cid && !s.url) {
            data[id] = s.cid;
            fp = s.platform;
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
        return res.send({
          result: 100,
          data: sendResult,
        });
      })
  }
}