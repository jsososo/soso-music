/*
*  数字转换（保留小数、四舍五入等）
*  @a: 输入的数字
*  @b: 保留小数位数，默认保留整数
*  @c: 是否四舍五入。0，默认，四舍五入；1，全部进位；-1，全部舍弃
* */

const num = (a, b = 0, c = 0) => {
  a = Number(a || 0);
  const d = {
    '1': 'ceil',
    '-1': 'floor',
    '0': 'round',
  }[c] || 'round';
  return Math[d](Number(a)).toFixed(b);
};

export const Abs = (a, b, c) => num(Math.abs(a), b, c);

export default num;
