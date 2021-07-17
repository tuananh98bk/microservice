import { Response } from 'express';
import { ErrorCode } from '$enums';
import { Logger } from 'log4js';
import config from '$config';

export class HttpError extends Error {
  public errorCode: number;
  public statusCode: number;
  public errorKey: string;
  public devMessage: string;

  constructor(error: Error | HttpError | number, statusCode?: number, devMessage: any = '') {
    super();
    if (error.hasOwnProperty('errorCode')) {
      this.errorCode = error['errorCode'];
      this.statusCode = error['statusCode'] || 400;
    } else {
      this.errorCode = typeof error === 'number' ? error : Number(error.message) | 0;
      this.statusCode = statusCode || 400;
    }

    this['rawError'] = error;
    this.errorKey = ErrorCode[this.errorCode];
    this.devMessage = config.environment === 'development' && devMessage ? devMessage : '';
  }
}

export class HttpErrorController extends Error {
  public errorCode: number;
  public statusCode: number;
  public errorKey: string;
  public logger: Logger;
  public devMessage: string;

  constructor(error: Error | HttpError, logger: Logger, statusCode?: number) {
    super();
    if (error.hasOwnProperty('errorCode')) {
      this.errorCode = error['errorCode'];
      this.statusCode = error['statusCode'] || 400;
    } else {
      this.errorCode = typeof error === 'number' ? error : Number(error.message) | 0;
      this.statusCode = statusCode || 400;
    }

    this['rawError'] = error;
    this.errorKey = ErrorCode[this.errorCode];
    this.devMessage = config.environment === 'development' && error['devMessage'] ? error['devMessage'] : '';
    this.logger = logger;
  }
}

export const done = (res: Response, data: any = null, statusCode: number = 200) => {
  if (data && data.paging === true) {
    return res.status(statusCode).send({
      success: true,
      totalPages: data.totalPages,
      pageIndex: data.pageIndex,
      totalItems: data.totalItems,
      data: data.data,
      ...data.metadata,
    });
  }
  return res.status(statusCode).send({ data, success: true });
};
