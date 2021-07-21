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

  // @Post('/upload', [])
  // async upload(req: Request) {
  //   let sampleFile;
  //   let uploadPath;

  //   let files = [];
  //   if (req['files'] && req['files'].length > 0) {
  //     req['files'].forEach((f: any) => {
  //       files.push(f.key);
  //     });
  //     console.log(files);
  //   }

  //   if (req['files'] && req['files'].length > 0) {
  //     // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  //     sampleFile = req.body.files.sampleFile;
  //     uploadPath = __dirname + '/uploads/' + sampleFile.name;

  //     // Use the mv() method to place the file somewhere on your server
  //     sampleFile.mv(uploadPath, function (err) {
  //       if (err) return err;

  //       return 'File uploaded!';
  //     });
  //   }
  //   return 'File is not exist';
  // }

  // @Post('/upload', [s3Upload.upload.array('files', 3)])
  // async upload(req: Request) {
  //   let files = [];
  //   if (req['files'] && req['files'].length > 0) {
  //     req['files'].forEach((f: any) => {
  //       files.push(f.key);
  //       // TODO: Generate thumbnail if needed
  //       // try {
  //       //   if (/\.(gif|jpe?g|tiff|png|webp|bmp|svg|heic)$/gi.test(f.key)) {
  //       //     axios.get(awsGetThumb(f.key, '50x50'));
  //       //   }
  //       // } catch (e) {}
  //     });
  //   }
  //   return files;
  // }

  @Post('/upload', [upload.single('file')])
  async upload(req: Request) {
    let files = [];
    console.log(req['file']);
    if (req['file'] && req['file'].length > 0) {
      req['file'].forEach((f: any) => {
        files.push(f.filename);
        // TODO: Generate thumbnail if needed
        // try {
        //   if (/\.(gif|jpe?g|tiff|png|webp|bmp|svg|heic)$/gi.test(f.key)) {
        //     axios.get(awsGetThumb(f.key, '50x50'));
        //   }
        // } catch (e) {}
      });
    }
    return req['file']['filename'];
  }
}
