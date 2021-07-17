import log from '$helpers/log';
import { Request, Response, NextFunction } from 'express';
const logger = log('Middle ware check token');
import { HttpError } from '$helpers/response';
import { verify } from 'jsonwebtoken';
import { getAdminInformation } from '$services/cms.auth';
import { promisify } from 'util';
import { ErrorCode, Permissions, UserStatus } from '$enums';
import config from '$config';
const verifyAsync = promisify(verify) as any;

export function checkTokenCms(req: Request, res: Response, next: NextFunction) {
  let token = req.headers['authorization'] || '';
  token = token.replace('Bearer ', '');
  if (!token) {
    throw new HttpError(ErrorCode.Token_Not_Exist);
  }

  verifyAsync(token, config.auth.CMSAccessTokenSecret)
    .then(async (decoded: any) => {
      try {
        // FIXME: Caching permission & status
        const user = await getAdminInformation(decoded.id);
        if (user.status === UserStatus.INACTIVE || !user.status) {
          throw new HttpError(ErrorCode.User_Blocked);
        }
        req.userId = decoded.id;
        req.permissions = decoded.permissions || [];
        next();
      } catch (error) {
        next(new HttpError(error));
      }
    })
    .catch(() => {
      next(new HttpError(ErrorCode.Token_Expired, 401));
    });
}

export function checkRefreshTokenCMS(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.body.refreshToken || '';
  if (!refreshToken) {
    logger.warn('Can not find the refresh token');
    throw new HttpError(ErrorCode.Refresh_Token_Not_Exist);
  }

  verifyAsync(refreshToken, process.env.CMS_REFRESH_TOKEN_SECRET)
    .then(async (decoded: any) => {
      try {
        const user = await getAdminInformation(decoded.id);
        if (!user) throw new HttpError(ErrorCode.Unknown_Error);
        if (user.status === UserStatus.INACTIVE || !user.status) throw new HttpError(ErrorCode.User_Blocked);
        req.userId = decoded.id;
        next();
      } catch (error) {
        next(new HttpError(error));
      }
    })
    .catch(() => {
      next(new HttpError(ErrorCode.Refresh_Token_Expire, 401));
    });
}

export function checkPermission(permissions: Permissions[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const hasOwnPermission = permissions.some((permission) => req.permissions.includes(permission));
    if (!hasOwnPermission) {
      next(new HttpError(ErrorCode.Permission_Denied, 403, 'You do not have permission to access this resource.'));
    }
    next();
  };
}
