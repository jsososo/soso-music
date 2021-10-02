export const clearObj = (obj) => {
  if (Array.isArray(obj)) {
    obj.length = 0;
  }
  Object.keys(obj).forEach((k) => delete obj[k]);
};

export const replaceObj = (o1, o2) => {
  clearObj(o1);
  Object.keys(o2).forEach((k) => (o1[k] = o2[k]));
};

export const throttle = (callback, ms) => {
  let pending = false;
  return function(...arg) {
    if (pending) {
      return;
    }
    pending = true;
    setTimeout(() => {
      pending = false;
      callback(...arg);
    }, ms);
  };
};
