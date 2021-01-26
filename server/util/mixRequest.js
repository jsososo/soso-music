const axios = require('axios');
const StringHelper = require('../mixApi/util/StringHelper');

class MixRequest {
  constructor({ req, res, port }) {
    const { platform } = req.query || {};

    this.port = port
    this.domain = this.hostMap[platform];
    this.req = req;
    this.res = res;
    this.request = this.request.bind(this);
  }

  get hostMap() {
    const port = this.port;
    return {
      qq: `http://localhost:${port}/qqApi`,
      163: `http://localhost:${port}/163Api`,
    }
  }

  updateDomain(platform) {
    this.domain = this.hostMap[platform];
  }

  async request(obj) {
    try {
      if (typeof obj === 'string') {
        obj = {
          url: obj,
          data: {},
        }
      }
      obj.method = obj.method || 'get';

      let { url, data, trueUrl, domain } = obj;

      url = `${domain || this.domain}/${url}`;

      trueUrl && (url = trueUrl);

      delete this.req.headers['content-type'];
      delete this.req.headers['Content-Type'];
      if (obj.method === 'get') {
        obj.url = StringHelper.changeUrlQuery(data, url);
        delete obj.data;
      }

      obj.headers = this.req.headers;

      console.log('\nrequest url: ', obj.url);

      const res = await axios(obj);

      return res.data;
    } catch (err) {
      if (err.message.indexOf('timeout') > -1) {
        return {};
      }
      this.res.send(err.message);
    }
  }
}

module.exports = MixRequest;