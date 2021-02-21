// 这个文件用来生成 routes.js，避免原先的动态读取 require 方式无法进行进行打包等操作

const fs = require('fs-extra');
const path = require('path');

const pathMap = {};
[
  '163Api/module',
  'mixApi/routes',
  'qqApi/routes',
  'miguApi/routes',
].forEach((p) => {
  fs.readdirSync(path.join(__dirname, p))
    .forEach((file) => {
      if (file.match(/\.ts$/)) {
        return
      }
      pathMap[
        `${p}_${file}`
          .replace(/\//g, '_')
          .replace(/\.js/g, '')
          .replace(/_module|_routes/g, '')
        ] = `./${p}/${file}`;
    })
})

const js = `
module.exports = {
\t${Object.keys(pathMap).map((k) => `'${k}': require('${pathMap[k]}')`).join(',\n\t')}
}
`
fs.writeFileSync(path.join(__dirname, 'routes.js'), js);