import { app, protocol, BrowserWindow, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import action from './mainUtil/action';


const isDevelopment = process.env.NODE_ENV !== 'production'


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const win = new BrowserWindow({
    width: 980,
    height: 600,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      webviewTag: true,
    }
  })
  win.setMenu(null);
  win.on('close', function (e) {
    e.preventDefault();
    !win.isVisible() ? (app.exit(0) && winLyric.exit(0) && process.exit(0)) : win.hide();
  })

  const winLyric = new BrowserWindow({
    width: screenSize.width * 0.7,
    height: 300,
    x: screenSize.width * 0.15,
    y: screenSize.height - 300,
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    devTools: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    clickThrough: 'pointer-events',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      webviewTag: false,
    }
  })
  // winLyric.setIgnoreMouseEvents(true)
  winLyric.setMenu(null);
  winLyric.hide();
  winLyric.on('close', function (e) {
    e.preventDefault();
    winLyric.hide();
  })

  // win.webContents.openDevTools();
  app.win = win;
  app.winLyric = winLyric;
  winLyric.setSkipTaskbar(true);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    winLyric.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/windowLyric`)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
    if (!process.env.IS_TEST) winLyric.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    winLyric.loadURL('app://./index.html#/windowLyric')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()

  app.win && app.win.show();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  await createWindow();

  action(app);

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}