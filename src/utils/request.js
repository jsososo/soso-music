import apiList from './apiList';
import timer from './timer';
import axios from 'axios';
import Storage from "./Storage";

const request = (param, platform) => {
  let obj = param;
  if (typeof param === 'string') {
    obj = { api: param };
  }
  if (Storage.get('q_cookie_time') < new Date().valueOf() - 86400000) {
    Storage.set('q_cookie_time', 0);
    Storage.set('q_cookie', '');
    window.$state.user.qq.logined = false;
  }
  const { method = 'get', api, data = {} } = obj;
  data._t = param.cache ? 0 : new Date().getTime();
  data._p = data._p || data.platform || platform;
  data.ownCookie = 1;
  let url =  apiList[api];
  if (method === 'get') {
    url += `?${Object.keys(data).map((k) => `${k}=${encodeURI(data[k])}`).join('&')}`
  } else {
    url += '?_t=' + data._t;
  }
  const { setting } = window.$state;
  let domain = param.domain || `http://localhost:${setting.SERVER_PORT}`

  return axios({
    method,
    url: `${domain}${url}`,
    data,
    headers: {
      'Host-Check': btoa(timer().str('YYYYMMDD')),
    },
    timeout: 30000,
  }).then((res) => {
    res.data = res.data || {};

    resolve(res.data)
  }, (err) => {
    if (err.msg || err.message) {
      // window.VUE_APP.$message.error(err.msg || err.message);
    }
  });
};

export default request;