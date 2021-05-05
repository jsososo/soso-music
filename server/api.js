const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('./163Api/util/request')
const { cookieToJson } = require('./163Api/util/index')
const Cache = require('./qqApi/util/cache');
const MixRequest = require('./util/mixRequest');
const dataHandle = require('./mixApi/util/dataHandle');
const transRouter = require('./route/trans');
const allApi = require('./routes');
const MiguRequest = require('./miguApi/util/request');
const cheerio = require('cheerio');
const MiguUtil = require('./miguApi/util/util')
const MiguSongSaver = require('./miguApi/util/SongSaver').default;
const findFunc = require('./route/find');
const JSONStorage = require('electron-json-storage');
const axios = require('axios');
const dialog = require('electron').dialog;

const app = express();
/**/
global.cache = new Cache();
global.userCookie = {};

global.findMigu = {};
global.findId = {};
JSONStorage.getMany(['find_migu', 'find_id'], (err, data) => {
  try {
    if (data) {
      global.findMigu = JSON.parse(data.find_migu || '{}');
      global.findId = JSON.parse(data.find_id || '{}');
    }
  } catch (err) {
    console.error(err);
  }
})

const songSaver = new MiguSongSaver();
// CORS & Preflight request
app.use((req, res, next) => {
  if (req.path !== '/' && !req.path.includes('.')) {
    res.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    })
  }
  req.method === 'OPTIONS' ? res.status(204).end() : next()
})

let port;

// cookie parser
app.use((req, res, next) => {
  req.cookies = {}
  ;(req.headers.cookie || '').split(/\s*;\s*/).forEach((pair) => {
    let crack = pair.indexOf('=')
    if (crack < 1 || crack == pair.length - 1) return
    req.cookies[
      decodeURIComponent(pair.slice(0, crack)).trim()
      ] = decodeURIComponent(pair.slice(crack + 1)).trim()
  })
  next()
})

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// static
app.use(express.static(path.join(__dirname, 'public')))

// router
const special = {
  'daily_signin': '/daily_signin',
  'fm_trash': '/fm_trash',
  'personal_fm': '/personal_fm',
}


Object.keys(allApi).forEach((k) => {
  const pathArr = k.split('_');
  const type = pathArr.shift();
  let route = pathArr.join('/');
  const handler = allApi[k];
  if (route === 'index') {
    return;
  }
  switch (type) {
    case '163Api':
      route =
        route in special
          ? special[route]
          : `/${route}`;

      app.use(`/163api${route}`, (req, res, next) => {
        if (typeof req.query.cookie === 'string') {
          req.query.cookie = cookieToJson(req.query.cookie)
        }
        let query = Object.assign(
          {},
          { cookie: req.cookies },
          req.query,
          req.body,
          req.files,
        )
        if (req.path !== '/') {
          return next();
        }

        handler(query, request)
          .then((answer) => {
            console.log('[OK]', decodeURIComponent(req.originalUrl))
            res.append('Set-Cookie', answer.cookie)
            res.status(answer.status).send(answer.body)
          })
          .catch((answer) => {
            console.log('[ERR]', decodeURIComponent(req.originalUrl), {
              status: answer.status,
              body: answer.body,
            })
            if (answer.body.code == '301') answer.body.msg = '需要登录'
            res.append('Set-Cookie', answer.cookie)
            res.status(answer.status).send(answer.body)
          })
      });
      break;
    case 'qqApi':
      Object.keys(handler).forEach((path) => {
        app.use(`/qqApi/${route}${path}`, (req, res, next) => {
          const router = express.Router();
          global.response = res;
          global.req = req;
          req.query = {
            ...req.query,
            ...req.body,
          };
          // qq 登录
          let uin = (req.cookies.uin || '');
          // login_type 2 微信登录
          if (Number(req.cookies.login_type) === 2) {
            uin = req.cookies.wxuin;
          }
          req.query.ownCookie = 1;
          req.cookies.uin = uin.replace(/\D/g, '');

          router.post('/', handler[path]);
          router.get('/', handler[path]);
          router(req, res, next);
        })
      });
      break;
    case 'mixApi':
      Object.keys(handler).forEach((path) => {
        app.use(`/mixApi/${route}${path}`, (req, res, next) => {
          const router = express.Router();
          req.query = {
            ...req.query,
            ...req.body,
          };
          req.query.platform = req.query['_p'].toLowerCase();
          const R = new MixRequest({ req, res, port });
          let h = handler[path];
          if (`${route}${path}` === 'song/find') {
            h = findFunc['/']
          }
          const func = (req, res, next) => h({
            req,
            res,
            next,
            dataHandle: new dataHandle(req.query.platform),
            platform: req.query.platform,
            request: R.request,
            R,
            port,
          });
          router.post('/', func);
          router.get('/', func);
          router(req, res, next);
        })
      });
      break;
    case 'miguApi':
      Object.keys(handler).forEach((path) => {
        app.use(`/miguApi/${route}${path}`, (req, res, next) => {
          const router = express.Router();
          req.query = {
            ...req.query,
            ...req.body,
          };
          const func = (req, res, next) => handler[path]({
            req,
            res,
            next,
            request: new MiguRequest.request({ req, res, next }),
            cheerio,
            songSaver,
            ...MiguUtil,
          });
          router.post('/', func);
          router.get('/', func);
          router(req, res, next);
        });
      })
      break;
  }
})

app.use('/trans', (req, res, next) => {
  const router = express.Router();
  router.get('/', transRouter['/']);
  router(req, res, next);
})
app.use('/cookie', (req, res, next) => {
  const router = express.Router();
  router.post('/set', require('./route/cookie')['/set']);
  router(req, res, next);
})

app.use('/check', (req, res, next) => {
  const router = express.Router();
  router.get('/', require('./route/check'));
  router(req, res, next);
})


const server = (p) => {
  app.server && app.server.close();
  port = p;
  console.log(`listen on http://localhost:${p}`);
  app.server = app.listen(p);
  app.server.on('error', function (err) {
    axios.get(`http://localhost:${port}/check`)
      .then((res) => {
        if (res.data !== 'hello world') {
          dialog.showErrorBox('服务异常', `${port}端口被占用，请更换`)
        }
      })
      .catch((err) => {
        dialog.showErrorBox('服务异常', `${port}端口被占用，请更换`)
      })
  })
}

// server(4001)
module.exports = server;

