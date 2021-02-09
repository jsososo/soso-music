module.exports = {
  '/set': async (req, res) => {
    const { cookieObj } = req.body;
    Object.keys(cookieObj).forEach((k) => {
      // 有些过大的cookie 对登录校验无用，但是会导致报错
      if (cookieObj[k].length < 255) {
        console.log(k, cookieObj[k])
        res.cookie(k, cookieObj[k], {expires: new Date(Date.now() + 86400000)});
      }
    });
    return res.send({ result: 100, data: true });
  }
}