import { HttpError, HttpErrorController } from '$helpers/response';
import { NextFunction, Request, Response } from 'express';
import log from '$helpers/log';
import { ErrorCode } from '$enums';
import config from '$config';
import { getLanguageOfServer } from '$helpers/language';

export const handleError = async (
  error: HttpError | HttpErrorController,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode, errorCode, errorKey, devMessage } = error;
  loggingError(req, error);
  const serverLanguage = await getLanguageOfServer();
  const customerLanguageCode = req.headers['language'] || 'ja';
  const errorMessage = serverLanguage?.[customerLanguageCode]?.Error?.[errorKey] || errorKey;
  const responseData = {
    success: false,
    errorCode,
    errorKey,
    errorMessage,
    data: null,
    devMessage,
  };

  return res.status(statusCode).send(responseData);
};

function loggingError(req: Request, error) {
  const method = req.method;
  const fullPath = req.originalUrl;
  const body = req.body || [];
  const logger = error.logger ? error.logger : log('INFO');
  delete error.logger;

  switch (error.errorCode) {
    case ErrorCode.Unknown_Error:
      const err = error['rawError'] || error;
      logger.error(err);
      break;

    case ErrorCode.Invalid_Input:
      logger.error(error.devMessage);
      break;

    default:
      logger.error(`${error.errorKey}${error.devMessage ? `\nReason: ${error.devMessage}` : ''}`);
      break;
  }
  logger.error(`Method: ${method} | FullPath: ${fullPath} | Body: ${JSON.stringify(body)}\n`);
}
