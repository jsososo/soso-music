// 读取本地音乐
const fs = require('fs-extra');

// 根据文件夹读取本地音频列表
const readLocal = (paths, app) => {
  const result = {};
  const lrcArr = [];
  paths.forEach((p) => {
    try {
      fs.readdirSync(p)
        .forEach((file) => {
          if (file.match(/\.(mp3|flac|m4a)$/)) {
            result[`${p}/${file}`] = { path: `${p}/${file}` };
          }
          if (file.match(/\.(lrc)$/)) {
            lrcArr.push(`${p}/${file}`);
          }
        })
    } catch (err) {
      console.log(err.message, p);
    }
  })

  lrcArr.forEach((k) => {
    ['mp3', 'm4a', 'flac'].forEach((end) => {
      const s = k.replace(/\.lrc$/, `.${end}`);
      result[s] && (result[s].lrcPath = k);
    });
  })

  // 先返回所有的文件路径
  app.win.webContents.send('RPL_FILE_PATHS', { paths, result: Object.keys(result)});

  Object.values(result).forEach(({ path, lrcPath}, p) => {
    // const name = path.match(/\//)
    const info = {
      aId: `local_${path}`,
      localPath: path,
      platform: 'local',
    }

    app.loadFile.push(info);

    app.loadFile.pathMap[info.aId] = info;
  })
}

// 只加载 buffer
export const loadSingleFile = (path, app) => fs.readFile(path, (err, buf) => app.win.webContents.send('RPL_FILE_BUF', { path, buf }));

export default readLocal;
