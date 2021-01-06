// 默认设置50
let ONE_REM: number;
try {
  // xgraph下这段会抛错
  ONE_REM = parseInt(document.documentElement.style.fontSize, 10) || 50;
} catch (e) {
  ONE_REM = 50;
}
const SCALE = ONE_REM / 100;

/**
 * 像素转换
 * @param {Number} px - 750视觉稿像素
 * @return {Number} 屏幕上实际像素
 */
function px2hd(px: number): number {
  if (!px) {
    return 0;
  }
  return Number((px * SCALE).toFixed(1));
}

function is(type: string) {
  return (value: any) => {
    return Object.prototype.toString.call(value) === `[object ${type}]`;
  }
}

const isNumber = is('Number');
const isString = is('String');
const isArray = is('Array');
const isObject = is('Object');
const isFunction = is('Function')

function parsePadding(padding: any) {
  if (isNumber(padding) || isString(padding)) {
    return [padding, padding, padding, padding];
  }
  const top = padding[0];
  const right = padding[1] ? padding[1] : padding[0];
  const bottom = padding[2] ? padding[2] : top;
  const left = padding[3] ? padding[3] : right;
  return [ top, right, bottom, left ];
}

function batch2hd(value: any) {
  // 处理带px的数据
  if (isString(value) && /^-?\d+px$/.test(value)) {
    const num = value.substr(0, value.length - 2);
    return px2hd(Number(num));
  }
  if (isArray(value)) {
    return value.map((v: any) => {
      return batch2hd(v);
    });
  }
  if (isObject(value)) {
    const result: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const rst = batch2hd(value[key]);
        if (!rst) continue;
        if (key === 'padding' || key === 'margin') {
          const paddingArray = parsePadding(rst);
          result[`${key}Top`] = paddingArray[0];
          result[`${key}Right`] = paddingArray[1];
          result[`${key}Bottom`] = paddingArray[2];
          result[`${key}Left`] = paddingArray[3];
          continue;
        }
        result[key] = rst;
      }
    }
    return result;
  }
  // 默认直接返回
  return value;
}


export { isString, isArray, isObject, isFunction, batch2hd };
