module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {  // 这里是electron-builder的配置
        "productName":"soso music",
        "directories": {
          "output": "dist_electron"
        },
        "mac": {
          "icon": "./src/assets/img/icon/icon.icns"
        },
        "win": {
          "icon": "./src/assets/img/icon/icon.ico"
        }
      }
    }
  },
}