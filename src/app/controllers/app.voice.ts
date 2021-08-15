import { COMMON, APP, Get, Post, Put, RequirePermission } from '$helpers/decorator';
import { Request, Response } from 'express';
import axios from 'axios';
import * as common from '$services/common';
import upload from '$middlewares/s3Upload';
import { awsGetThumb } from '$helpers/utils';
import { transcriptions } from '$services/app.voice';

@APP('/voices')
export default class AuthController {
  @Get('/')
  async getListVoice(req: Request) {
    const voiceId = Number(req.query.voiceId);
    return transcriptions(voiceId);
  }

  @Get('/:voiceId')
  async getVoiceDetail(req: Request) {
    const voiceId = Number(req.query.voiceId);
    return transcriptions(voiceId);
  }

  @Put('/:voiceId/transcription')
  async transcriptVoice(req: Request) {
    const voiceId = Number(req.query.voiceId);
    return transcriptions(voiceId);
  }

  @Put('/:voiceId/transcription')
  async updateVoice(req: Request) {
    const voiceId = Number(req.query.voiceId);
    return transcriptions(voiceId);
  }

  @Post('/')
  async createVoice(req: Request) {
    const voiceId = Number(req.query.voiceId);
    return transcriptions(voiceId);
  }
}
