import { Request, Response, NextFunction } from 'express';
import { getMemberById } from '$services/app.auth';
import log from '$helpers/log';
const logger = log('Middle ware check token');
import { HttpError } from '$helpers/response';
import { verify } from 'jsonwebtoken';
import { promisify } from 'util';
import { ErrorCode, MemberStatus } from '$enums';
const verifyAsync = promisify(verify) as any;

/**Public data in the token */
interface IDecodeToken {
  id: number;
  status: MemberStatus;
}

export function checkTokenApp(req: Request, res: Response, next: NextFunction) {
  let token = req.headers['authorization'] || '';
  token = token.replace('Bearer ', '');
  if (!token) {
    throw new HttpError(ErrorCode.Token_Not_Exist);
  }

  verifyAsync(token, process.env.ACCESS_TOKEN_SECRET)
    .then(async (decoded: IDecodeToken) => {
      try {
        if (decoded.status === MemberStatus.INACTIVE || !decoded.status) {
          throw new HttpError(ErrorCode.Member_Blocked);
        }
        req.memberId = decoded.id;
        next();
      } catch (error) {
        next(new HttpError(error));
      }
    })
    .catch(() => {
      next(new HttpError(ErrorCode.Token_Expired, 401));
    });
}

export function checkRefreshTokenApp(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.body.refreshToken || '';
  if (!refreshToken) {
    logger.warn('Can not find the refresh token');
    throw new HttpError(ErrorCode.Refresh_Token_Not_Exist);
  }
  verifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    .then(async (decoded: IDecodeToken) => {
      try {
        const member = await getMemberById(decoded.id);
        if (!member) throw new HttpError(ErrorCode.Unknown_Error);
        if (member.status === MemberStatus.INACTIVE || !member.status) throw new HttpError(ErrorCode.User_Blocked);
        req.memberId = decoded.id;
        next();
      } catch (error) {
        next(new HttpError(error));
      }
    })
    .catch(() => {
      next(new HttpError(ErrorCode.Refresh_Token_Expire, 401));
    });
}
