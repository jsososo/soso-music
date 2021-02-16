// 可以根据路由模式的不同，后面俩可以只引用一个
import { createRouter, createWebHashHistory } from 'vue-router'

// 构建我们的页面路由配置，可以看到，这里和原来的写法并无二致。
const routes = [
  {
    path: '/',
    component: () => import('./views/Index'),
  },
  {
    path: '/user',
    component: () => import('./views/User'),
  },
  {
    path: '/search',
    component: () => import('./views/Search'),
  },
  {
    path: '/playlist/detail',
    component: () => import('./views/PlaylistDetail'),
  },
  {
    path: '/download',
    component: () => import('./views/Download'),
  },
  {
    path: '/setting',
    component: () => import('./views/Setting'),
  },
  {
    path: '/playlist',
    component: () => import('./views/Playlist'),
  },
  {
    path: '/recommend',
    component: () => import('./views/Playlist'),
  },
  {
    path: '/about',
    component: () => import('./views/About'),
  },
  {
    path: '/album',
    component: () => import('./views/Album'),
  },
  {
    path: '/singer',
    component: () => import('./views/Singer'),
  },
  {
    path: '/comment',
    component: () => import('./views/Comment'),
  }
]

const router = createRouter({
  // 使用 hash 模式构建路由（ url中带 # 号的那种)
  history: createWebHashHistory(),
  // 使用 history 模式构建路由 （ url 中没有 # 号，但生产环境需要特殊配置）
  // history: createWebHistory(),
  routes
})
export default router