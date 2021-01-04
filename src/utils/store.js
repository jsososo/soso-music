import { ref, provide, inject } from 'vue';

const store = {
  // 用户信息
  user: {
    163: {},
    qq: {},
    soso: {},
  },
  // 下载信息
  downloadInfo: {
    count: 0,
  },
  // 搜索信息
  searchInfo: {

  },
}

const result = {};

Object.keys(store).forEach(k => {
  result[k] = [k, ref(store[k])];
})

const mixHandle = (type, keys) => {
  const func = { provide, inject }[type];
  const obj = {};
  if (typeof keys === 'string') {
    obj[keys] = func(...result[keys])
  } else if (Array.isArray(keys)) {
    keys.forEach(k => {
      obj[k] = func(...result[k])
    })
  }
  return obj;
}

export const mixProvide = (keys) => mixHandle('provide', keys);

export const mixInject = (keys) => mixHandle('inject', keys);


export default result;