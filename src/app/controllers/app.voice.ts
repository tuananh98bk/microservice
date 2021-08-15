import { COMMON, APP, Get, Post, Put, RequirePermission } from '$helpers/decorator';
import { Request, Response } from 'express';
import axios from 'axios';
import * as common from '$services/common';
import upload from '$middlewares/s3Upload';
import { awsGetThumb } from '$helpers/utils';
import { transcriptions } from '$services/app.voice';

@APP('/voices')
export default class AuthController {
  @Get('/:voiceId')
  async language(req: Request) {
    const voiceId = Number(req.query.voiceId);
    return transcriptions(voiceId);
  }
}
