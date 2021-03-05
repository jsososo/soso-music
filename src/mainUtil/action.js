import {ipcMain, dialog, Menu, Tray} from 'electron';
import api from '../../server/api';
import path from 'path';
import storage from 'electron-json-storage';

// 所有的 ipcMain 和 ipcRenderer 的事件沟通
export default (app) => {
  const quit = () => {
    app.exit(0);
    process.exit(0);
  }

  ipcMain.on('UPDATE_SERVER_POINT', (e, v) => {
    try {
      global.port = v;
      api(v);
      app.win.webContents.send('SET_SYSTEM_PLATFORM', process.platform);
      e.reply('REPLY_SERVER_PPINT', {result: true});
    } catch (err) {
      e.reply('REPLY_SERVER_PPINT', {result: false, errMsg: err.message});
    }
  })

  // 选择地址
  ipcMain.on('SHOW_SELECT_DIR', async (e, type) => {
    const {canceled, filePaths} = await dialog.showOpenDialog(app.win, {
      properties: ['openDirectory']
    }).catch(() => false);
    app.selectDir = app.selectDir || {};
    !canceled && (app.selectDir[type] = filePaths[0]);
    !canceled && e.reply('REPLY_SELECT_DIR', {type, path: filePaths[0]});
  })

  // 设置下载地址
  ipcMain.on('SET_DOWNLOAD_DIR', async (e, v) => {
    const path = v || app.getPath('downloads');
    app.selectDir = app.selectDir || {};
    app.selectDir.download = path;
    e.reply('REPLY_SELECT_DIR', {path, type: 'download'});
  })

  // 更新播放状态，根据这个来显示菜单
  ipcMain.on('UPDATE_PLAYING_STATUS', async (e, v) => {
    const { liked, logined, status, name } = v;
    // mainMenu.controls.like.enabled = logined;
    const likeLabel = liked ? '❤️ 不喜欢了~' : '🤍 喜欢ta！';
    const playLabel = status ? `⏸️ ${name || '暂停'}` : `▶️ ${name || '播放'}`;

    mainMenu.controls.like.visible = logined;
    mainMenu.controls.like.label = likeLabel;
    mainMenu.controls.play.label = playLabel;

    trayMenu.like.label = likeLabel;
    trayMenu.like.visible = logined;
    trayMenu.play.label = playLabel;

    Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenu));
    tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  })

  ipcMain.on('GET_HISTORY_DATA', (e) => {
    storage.get('history_data', ( err, data) => {
      e.reply('REPLY_HISTORY_DATA', data || {});
    })
  })

  ipcMain.on('APP_MINIMIZE', () => app.win.minimize());

  ipcMain.on('APP_HIDE', () => app.win.hide());

  // 保存播放历史数据
  ipcMain.on('UPDATE_HISTORY_DATA', (e, v) => storage.set('history_data', v))

  // 静默下载
  app.win.webContents.session.on('will-download', (event, item) => {
    // Set the save path, making Electron not to prompt a save dialog.
    const filePath = path.join(app.selectDir.download || app.getPath('downloads'), item.getFilename());
    item.setSavePath(filePath);
  })

  const proxyMenu = (template) => {
    const arr = (Array.isArray(template) ? template : template.submenu || [])
    arr.forEach((item, index) => {
      if (item.submenu) {
        arr[index] = proxyMenu(item)
      }
    })
    return new Proxy(template, {
      get(target, key) {
        return target[key] ? target[key] :
          (Array.isArray(target) ? target : target.submenu)
            .find(({ key: k }) => k === key);
      }
    })
  }
  const mainMenu = proxyMenu([
    {
      label: 'soso music',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => quit(),
        },
        {
          type: 'separator'
        },
        {
          label: '关于',
          role: 'about',
        },
      ]
    },
    {
      label: '操作',
      key: 'controls',
      submenu: [
        {
          label: '▶ 播放',
          key: 'play',
          click: () => app.win.webContents.send('PLAY_MUSIC'),
        },
        {
          label: '⏮ 上一首',
          click: () => app.win.webContents.send('PLAY_PREV'),
        },
        {
          label: '⏭ 下一首',
          click: () => app.win.webContents.send('PLAY_NEXT'),
        },
        {
          label: '喜欢',
          key: 'like',
          // visible: false,
          click: () => app.win.webContents.send('LIKE_MUSIC'),
        }
      ]
    },
    {
      label: "编辑",
      key: 'edit',
      submenu: [
        {label: '撤销', accelerator: "CmdOrCtrl+Z", selector: "undo:"},
        {label: '重做', accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
        {type: "separator"},
        {label: '剪切', accelerator: "CmdOrCtrl+X", selector: "cut:"},
        {label: '复制', accelerator: "CmdOrCtrl+C", selector: "copy:"},
        {label: '粘贴', accelerator: "CmdOrCtrl+V", selector: "paste:"},
        {label: '全选', accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
      ]
    }
  ]);

  const menu = Menu.buildFromTemplate(mainMenu);
  Menu.setApplicationMenu(menu);

  const tray = new Tray(path.join(__static, './16x16.png'))
  const trayMenu = proxyMenu([
    {
      label: '喜欢',
      key: 'like',
      // visible: false,
      click: () => app.win.webContents.send('LIKE_MUSIC'),
    },
    {
      label: '▶ 播放',
      key: 'play',
      click: () => app.win.webContents.send('PLAY_MUSIC'),
    },
    {
      label: '⏮ 上一首',
      click: () => app.win.webContents.send('PLAY_PREV'),
    },
    {
      label: '⏭ 下一首',
      click: () => app.win.webContents.send('PLAY_NEXT'),
    },
    {type: "separator"},
    {
      label: '显示',
      click() {
        app.win.show();
      }
    },
    {
      label: '隐藏',
      click() {
        app.win.hide();
      }
    },
    {
      label: '退出',
      accelerator: 'Command+Q',
      selector: 'terminate:',
      click() {
        quit();
      }
    }
  ])
  tray.setToolTip('soso music')
  tray.setContextMenu(Menu.buildFromTemplate(trayMenu))
  app.tray = tray;
  // 单击右下角小图标显示应用左键
  tray.on('click', function () {
    app.win.show();
  })
  // // 右键
  // tray.on('right-click', () => {
  //   app.win.popUpContextMenu();
  // });
}