import config from '$config';
import { KeyCacheRedis } from '$enums';
import flatten from 'flat';
import format from 'string-format';
import _ from 'lodash';

interface PagingParams {
  pageIndex: number;
  pageSize: number;
  start: number;
  [key: string]: any;
}

export function returnPaging(data: any, totalItems: number, params: any, metadata = {}) {
  return {
    data,
    totalItems,
    paging: true,
    pageIndex: params.pageIndex,
    totalPages: Math.ceil(totalItems / params.take),
    metadata,
  };
}

export function assignPaging(params) {
  params.pageIndex = Number(params.pageIndex) || 1;
  params.take = Number(params.take) || 10;
  params.skip = (params.pageIndex - 1) * params.take;
  return params;
}

/**
 * @param length(option) length of result.
 */
export function randomOTP(length: number = 6): string {
  const digits = '0123456789';
  const digitsLength = digits.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * digitsLength);
    result += digits[index];
  }
  return result;
}

export function convertToObject(data: Array<Object>, key: string): { [key: string]: Array<any> } {
  const result = {};
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    const keyEl = element[key];
    if (!result[keyEl]) {
      result[keyEl] = [];
    }
    delete element[key];
    result[keyEl].push(element);
  }
  return result;
}

export function getKeyCacheLanguage(environment: string) {
  return `${KeyCacheRedis.LANGUAGE}:${environment}`;
}

//! "When i wrote this code, only me and God knew how it works. Now only God knows..."
export function reformatFileLanguage(data: Array<any>, params: { code?: string; environment: string }) {
  const groupByLanguageCode = convertToObject(data, 'code');

  const languageObject = Object.keys(groupByLanguageCode).reduce((acc, cur) => {
    acc[cur] = groupByLanguageCode[cur].reduce((ac, cu) => {
      ac[cu.key] = cu.value;
      return ac;
    }, {});
    return acc;
  }, {});

  const result = flatten.unflatten(languageObject);
  if (params.code) {
    return result[params.code];
  }
  return result;
}

export function awsGetThumb(img: any, size: any) {
  if (img && img != '' && !img.startsWith('http') && !img.startsWith('https'))
    return size === ''
      ? format('{0}/{1}', config.awsUpload.downloadUrlThumb, img)
      : format('{0}/{1}/{2}', config.awsUpload.downloadUrlThumb, size, img);
  return img;
}

export function awsThumbFormat(img: string, w?: any, h?: any) {
  if (!img) return img;
  // if (!img) {
  //   if (w && h) return format('{0}/{1}x{2}/{3}', config.awsUpload.downloadUrl, w, h, config.avatar.default);
  //   else return format('{0}/{1}', config.awsUpload.downloadUrl, config.avatar.default);
  // }

  if (!img.startsWith('http')) {
    if (w && h && !img.includes('graph.facebook.com'))
      return format('{0}/{1}x{2}/{3}', config.awsUpload.downloadUrl, w, h, img);
    else return format('{0}/{1}', config.awsUpload.downloadUrl, img);
  } else {
    if (w && h && !img.includes('graph.facebook.com')) {
      img = img.replace(/%2F/g, '/');
      let arr_split = img.split('/');
      arr_split[arr_split.length - 1] = `${w}x${h}/${arr_split[arr_split.length - 1]}`;

      return arr_split.join('/');
    } else {
      return img;
    }
  }
}

/**
 *
 * @param obj object need to add thumb
 * @param path path to image field in object
 * @description assign thumb url for image property of object
 */
export function assignThumbUrl(obj: any | Array<any>, path: string) {
  _.flatten([obj]).forEach((item) => {
    const img = _.get(item, path) as string;
    const url = awsThumbFormat(img);
    _.set(item, path, url);

    [50].forEach((size) => {
      const url = awsThumbFormat(img, size, size);
      _.set(item, `${path}_${size}`, url);
    });
  });
  return obj;
}
