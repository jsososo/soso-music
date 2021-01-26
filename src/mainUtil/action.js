import { ipcMain, dialog } from 'electron';
import api from '../../server/api';
import path from 'path';

// 所有的 ipcMain 和 ipcRenderer 的事件沟通
export default (app) => {
  ipcMain.on('UPDATE_SERVER_POINT', (e, v) => {
    try {
      global.port = v;
      api(v);
      e.reply('REPLY_SERVER_PPINT', { result: true});
    } catch (err) {
      e.reply('REPLY_SERVER_PPINT', { result: false, errMsg: err.message});
    }
  })

  // 选择地址
  ipcMain.on('SHOW_SELECT_DIR', async (e, type) => {
    const {canceled, filePaths} = await dialog.showOpenDialog(app.win, {
      properties: ['openDirectory']
    }).catch(() => false);
    app.selectDir = app.selectDir || {};
    !canceled && (app.selectDir[type] = filePaths[0]);
    !canceled && e.reply('REPLY_SELECT_DIR', { type, path: filePaths[0] });
  })

  // 设置下载地址
  ipcMain.on('SET_DOWNLOAD_DIR', async (e, v) => {
    const path = v || app.getPath('downloads');
    app.selectDir = app.selectDir || {};
    app.selectDir.download = path;
    e.reply('REPLY_SELECT_DIR', { path, type: 'download' });
  })

  // 静默下载
  app.win.webContents.session.on('will-download', (event, item) => {
    // Set the save path, making Electron not to prompt a save dialog.
    const filePath = path.join(app.selectDir.download || app.getPath('downloads'), item.getFilename());
    item.setSavePath(filePath);

  })
}