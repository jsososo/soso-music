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
          "icon": "./src/assets/img/icon/icon.ico",
          "target": [
            "nsis",  //打包为nsis安装文件
            "zip"   //打包为安装文件zip
          ]
        },
        "nsis": {   //nsis配置参数
          "oneClick": false,    //可单击打开
          "allowToChangeInstallationDirectory": true,    //允许用户选择安装位置
          "perMachine": true
        }
      }
    }
  },
}