import { CMS, Get, Post, Put, RequirePermission } from '$helpers/decorator';
import { Permissions } from '$enums';
import { checkRefreshTokenCMS } from '$middlewares/cms';
import { LoginRequest, ChangePasswordRequest, RequestTokenRequest, Token } from '$interfaces/auth.interface';
import { validate } from '$helpers/ajv';
import { loginSchema, changePasswordSchema, requestAccessTokenSchema } from '$validators/cms.auth';
import * as service from '$services/cms.auth';

@CMS('/auth')
export default class AuthController {
  /**
   * URL: {{domain}}/v1/cms/auth/login
   * This API not require access token.
   */
  @Post('/login', [])
  async login(req: LoginRequest) {
    const body = req.body;
    validate(loginSchema, body);
    return await service.login(body);
  }

  /**
   * URL: {{domain}}/v1/cms/auth/change-password
   * This API require access token.
   */
  @Put('/change-password')
  @RequirePermission([Permissions.RESOURCE_MANAGEMENT])
  async changePassword(req: ChangePasswordRequest) {
    const { userId, body } = req;
    validate(changePasswordSchema, body);
    await service.changePassword(userId, body);
    return;
  }

  /**
   * URL: {{domain}}/v1/cms/auth/request-access-token
   * This API require refresh token in the body.
   */
  @Post('/request-access-token', [checkRefreshTokenCMS])
  async requestAccessToken(req: RequestTokenRequest) {
    const userId = req.userId;
    const accessToken = await service.createAccessToken(userId);
    return { accessToken };
  }
}
