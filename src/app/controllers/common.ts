import { COMMON, Get, Post, Put, RequirePermission } from '$helpers/decorator';
import { Request, Response } from 'express';
import axios from 'axios';
import * as common from '$services/common';
import upload from '$middlewares/s3Upload';
import { awsGetThumb } from '$helpers/utils';

@COMMON('')
export default class AuthController {
  @Get('/language', [])
  async language(req: Request) {
    const environment = req.query.environment as string;
    return await common.getLanguage(environment);
  }

  @Get('/upload', [])
  async getUpload(req: Request, res: Response) {
    res.send(`<form action="http://localhost:3000/common/upload" method="post" enctype="multipart/form-data">
        <label>Choose file you want to upload:
          <input name="foo" type="file" multiple> 
        </label>  
        <button>Upload</button>
      </form>`);
  }

  @Post('/upload', [upload.single('file')])
  async upload(req: Request) {
    let files = [];
    console.log(req['file']);
    if (req['file'] && req['file'].length > 0) {
      req['file'].forEach((f: any) => {
        files.push(f.filename);
        // TODO: Generate thumbnail if needed
        // try {a
        //   if (/\.(gif|jpe?g|tiff|png|webp|bmp|svg|heic)$/gi.test(f.key)) {
        //     axios.get(awsGetThumb(f.key, '50x50'));
        //   }
        // } catch (e) {}
      });
    }
    return req['file']['filename'];
  }
}
