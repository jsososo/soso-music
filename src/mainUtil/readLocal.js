// 读取本地音乐
const fs = require('fs-extra');

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

  lrcArr.forEach((k, p) => {
    ['mp3', 'm4a', 'flac'].forEach((end) => {
      const s = k.replace(/\.lrc$/, `.${end}`);
      console.log(s);
      result[s] && (result[s].lrcPath = k);
    });
  })


  Object.values(result).forEach(({ path, lrcPath}, p) => {
    console.log(path, lrcPath)
    // const name = path.match(/\//)
    const info = {
      aId: `local_${path}`,
      localPath: path,
      platform: 'local',
    }
    fs.readFile(path, (err, buf) => {
      info.buf = buf
      app && app.win.webContents.send('ADD_LOCAL_FILE', info);
      // console.log(path, err, file)
    })
    if (lrcPath) {
      fs.readFile(lrcPath, (err, buf) => {
        info.rawLyric = buf.toString();
        app && app.win.webContents.send('ADD_LOCAL_FILE', info);
      })
    }
  })
}

export const loadFile = (path, app) => fs.readFile(path, (err, buf) => app.win.webContents.send('RPL_FILE_BUF', { path, buf }));

export default readLocal;
