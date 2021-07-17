import { Request } from 'express';
import { CMS, Get, Post, Put, RequirePermission } from '$helpers/decorator';
import { validate } from '$helpers/ajv';
import * as language from '$services/cms.language';
import {
  addLanguageSchema,
  getListLanguageKeySchema,
  getListLanguageSchema,
  updateLanguageSchema,
  addLanguageKeySchema,
  getFileLanguageSchema,
  uploadFileLanguageSchema,
} from '$validators/cms.language';
import { assignPaging } from '$helpers/utils';
import { Permissions } from '$enums';

@CMS('/language')
export default class CMSLanguageController {
  @Post('/list', [])
  async getListLanguage(req: Request) {
    const body = req.body;
    validate(getListLanguageSchema, body);
    const response = await language.getListLanguage(body);
    return response;
  }

  @Post('/add-language')
  @RequirePermission([Permissions.LANGUAGE_MANAGEMENT])
  async addLanguage(req: Request) {
    const body = req.body;
    validate(addLanguageSchema, body);
    const response = await language.addLanguage(body);
    return response;
  }

  @Post('/list-language-key')
  @RequirePermission([Permissions.LANGUAGE_MANAGEMENT])
  async getListLanguageKey(req: Request) {
    validate(getListLanguageKeySchema, req.body);
    const body = assignPaging(req.body);
    const result = await language.getListLanguageKey(body);
    return result;
  }

  @Put('/add-language-key')
  @RequirePermission([Permissions.LANGUAGE_MANAGEMENT])
  async addLanguageKey(req: Request) {
    const body = req.body;
    validate(addLanguageKeySchema, req.body);
    const result = await language.addLanguageKey(body);
    return result;
  }

  @Put('/update-language-key')
  @RequirePermission([Permissions.LANGUAGE_MANAGEMENT])
  async updateLanguageKey(req: Request) {
    const body = req.body;
    validate(addLanguageKeySchema, req.body);
    const result = await language.updateLanguageKey(body);
    return result;
  }

  /**
   * Do not required permission in this API
   * @param req
   */
  @Post('/get-file-language', [])
  async getFileLanguage(req: Request) {
    const body = req.body;
    body.environment = body.environment || 'APP';
    validate(getFileLanguageSchema, body);
    const result = await language.getFileLanguage(body);
    return result;
  }

  @Post('/upload-file-language')
  @RequirePermission([Permissions.LANGUAGE_MANAGEMENT])
  async uploadFileLanguage(req: Request) {
    const body = req.body;
    validate(uploadFileLanguageSchema, body);
    const result = await language.uploadLanguageFile(body);
    return result;
  }

  @Post('/list-environments')
  @RequirePermission([Permissions.LANGUAGE_MANAGEMENT])
  async getListEnvironments(req: Request) {
    const result = await language.getListEnvironments();
    return result;
  }
}
