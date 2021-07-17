import { COMMON, Get, Post, Put, RequirePermission } from '$helpers/decorator';
import { Request } from 'express';
import axios from 'axios';
import * as common from '$services/common';
import s3Upload from '$middlewares/s3Upload';
import { awsGetThumb } from '$helpers/utils';

@COMMON('')
export default class AuthController {
  @Get('/language', [])
  async login(req: Request) {
    const environment = req.query.environment as string;
    return await common.getLanguage(environment);
  }
  @Post('/upload', [s3Upload.upload.array('files', 3)])
  async upload(req: Request) {
    let files = [];
    if (req['files'] && req['files'].length > 0) {
      req['files'].forEach((f: any) => {
        files.push(f.key);
        // TODO: Generate thumbnail if needed
        // try {
        //   if (/\.(gif|jpe?g|tiff|png|webp|bmp|svg|heic)$/gi.test(f.key)) {
        //     axios.get(awsGetThumb(f.key, '50x50'));
        //   }
        // } catch (e) {}
      });
    }
    return files;
  }
}
