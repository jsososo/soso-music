const request = require('../qqApi/util/request');

module.exports = {
  '/get': async (req, res) => {
    const { data: { userCookie } = { data: { userCookie: {}}}} = await request( {
      url: 'http://music.jsososo.com/apiQ/user/cookie',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      }
    })
    global.userCookie = userCookie;
    res.send({ result: 100 });
  }
}