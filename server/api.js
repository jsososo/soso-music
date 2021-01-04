const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('./163Api/util/request')
const { cookieToJson } = require('./163Api/util/index')
const Cache = require('./qqApi/util/cache');
const MixRequest = require('./util/mixRequest');
const dataHandle = require('./mixApi/util/dataHandle');
const allApi = require('./routes');

const app = express();
/**/
global.cache = new Cache();

// CORS & Preflight request
// app.use((req, res, next) => {
//   if (req.path !== '/' && !req.path.includes('.')) {
//     res.set({
//       'Access-Control-Allow-Credentials': true,
//       'Access-Control-Allow-Origin': req.headers.origin || '*',
//       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//       'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//       'Content-Type': 'application/json; charset=utf-8',
//     })
//   }
//   req.method === 'OPTIONS' ? res.status(204).end() : next()
// })

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

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials','true');
  next();
})

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

      app.use(`/163api${route}`, (req, res) => {
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
      app.use(`/qqApi/${route}`, (req, res, next) => {
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
        req.cookies.uin = uin.replace(/\D/g, '');
        const callback = handler;
        callback(req, res, next);
      });
      break;
    case 'mixApi':
      app.use(`/mixApi/${route}`, (req, res, next) => {
        const router = express.Router();
        req.query = {
          ...req.query,
          ...req.body,
        };
        req.query.platform = req.query['_p'].toLowerCase();
        const RouterMap = handler;
        Object.keys(RouterMap).forEach((path) => {
          const func = (req, res, next) => RouterMap[path]({
            req,
            res,
            next,
            dataHandle: new dataHandle(req.query.platform),
            platform: req.query.platform,
            request: new MixRequest({ req, res }).request,
          });
          router.post(path, func);
          router.get(path, func);
        });
        router(req, res, next);
      });
      break;
  }
})
// 网易云接口
// fs.readdirSync(path.join(__dirname, '163Api/module'))
//   .forEach((file) => {
//     if (!file.endsWith('.js')) return
//     let route =
//       file in special
//         ? special[file]
//         : '/' + file.replace(/\.js$/i, '').replace(/_/g, '/')
//
//     let question = require(`./163Api/module/${file}`);
//
//     app.use(`/163api${route}`, (req, res) => {
//       if (typeof req.query.cookie === 'string') {
//         req.query.cookie = cookieToJson(req.query.cookie)
//       }
//       let query = Object.assign(
//         {},
//         { cookie: req.cookies },
//         req.query,
//         req.body,
//         req.files,
//       )
//
//       question(query, request)
//         .then((answer) => {
//           console.log('[OK]', decodeURIComponent(req.originalUrl))
//           res.append('Set-Cookie', answer.cookie)
//           res.status(answer.status).send(answer.body)
//         })
//         .catch((answer) => {
//           console.log('[ERR]', decodeURIComponent(req.originalUrl), {
//             status: answer.status,
//             body: answer.body,
//           })
//           if (answer.body.code == '301') answer.body.msg = '需要登录'
//           res.append('Set-Cookie', answer.cookie)
//           res.status(answer.status).send(answer.body)
//         })
//     })
//   })

// qq 音乐接口
// fs.readdirSync(path.join(__dirname, 'qqApi/routes'))
//   .forEach((file) => {
//     const filename = file.replace(/\.js$/, '');
//     app.use(`/qqApi/${filename}`, (req, res, next) => {
//       global.response = res;
//       global.req = req;
//       req.query = {
//         ...req.query,
//         ...req.body,
//       };
//       // qq 登录
//       let uin = (req.cookies.uin || '');
//       // login_type 2 微信登录
//       if (Number(req.cookies.login_type) === 2) {
//         uin = req.cookies.wxuin;
//       }
//       req.cookies.uin = uin.replace(/\D/g, '');
//       const callback = require(`./qqApi/routes/${filename}`);
//       callback(req, res, next);
//     });
//   })


// mixApi 接口
// fs.readdirSync(path.join(__dirname, 'mixApi/routes')).reverse().forEach(file => {
//   const filename = file.replace(/(\.js|\.ts)$/, '');
//   if (filename === 'index') {
//     return;
//   }
//   app.use(`/mixApi/${filename}`, (req, res, next) => {
//     const router = express.Router();
//     req.query = {
//       ...req.query,
//       ...req.body,
//     };
//     req.query.platform = req.query['_p'].toLowerCase();
//     const RouterMap = require(`./mixApi/routes/${filename}`);
//     Object.keys(RouterMap).forEach((path) => {
//       const func = (req, res, next) => RouterMap[path]({
//         req,
//         res,
//         next,
//         dataHandle: new dataHandle(req.query.platform),
//         platform: req.query.platform,
//         request: new MixRequest({ req, res }).request,
//       });
//       router.post(path, func);
//       router.get(path, func);
//     });
//     router(req, res, next);
//   });
// });


const server = (port) => {
  console.log(`listen on http://localhost:${port}`);
  app.server = app.listen(port);
}

module.exports = server;

