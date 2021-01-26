import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

//全局注册自定义指令，用于判断当前图片是否能够加载成功，可以加载成功则赋值为img的src属性，否则使用默认图片


/**
 * 检测图片是否存在
 * @param url
 */
let imageIsExist = function(url) {
  return new Promise((resolve) => {
    var img = new Image();
    img.onload = function () {
      if (this.complete == true){
        resolve(true);
        img = null;
      }
    }
    img.onerror = function () {
      resolve(false);
      img = null;
    }
    img.src = url;
  })
}

createApp(App)
  .use(router)
  .use(ElementPlus)
  .directive('error', async (el, { value }) => !(await imageIsExist(el.src)) && el.setAttribute('src', value))
  .mount('#app')
