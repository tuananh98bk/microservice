import config from '$config';
import Language from '$entities/Language';
import LanguageKey from '$entities/LanguageKey';
import LanguageTranslation from '$entities/LanguageTranslation';
import Member from '$entities/Member';
import Voice from '$entities/Voice';
import { CommonStatus, ErrorCode } from '$enums';
import { getKeyCacheLanguage, reformatFileLanguage, PagingParams, returnPaging } from '$helpers/utils';
import fs from 'fs';
import { exec as execCallback } from 'child_process';
import util from 'util';
import { getRepository } from 'typeorm';

interface CreatedVoiceParams {
  path: string;
  memberId: number;
}

export async function transcriptions(voiceId: number) {
  const repo = getRepository(Voice);
  const voice = await repo.findOne({ id: voiceId });
  return voice;
}

export async function createVoice(params: CreatedVoiceParams) {
  const repo = getRepository(Voice);
  return await repo.create(params);
}

export async function getListVoice(memberId: number, params: PagingParams) {
  const repo = getRepository(Voice);
  const builder = await repo
    .createQueryBuilder('v')
    .select([
      'v.id',
      'v.memberId',
      'v.path',
      'v.name',
      'v.status',
      'v.transcription',
      'v.transcriptionDetail',
      'v.createdDate',
    ])
    .where('v.memberId = :memberId AND v.status = :status', { memberId, status: CommonStatus.ACTIVE });
  const [data, totalItems] = await builder.getManyAndCount();
  return returnPaging(data, totalItems, params);
}

export async function voiceDetail(voiceId: number) {
  const repo = getRepository(Voice);
  const voice = await repo.find({ id: voiceId });
  if (!voice) throw ErrorCode.Voice_Not_Exist;
  return voice;
}

export async function transcription(voiceId: number) {
  const repo = getRepository(Voice);
  const voice = await repo.findOne({ id: voiceId });
  if (!voice) throw ErrorCode.Voice_Not_Exist;
  const path = voice;
  const exec = util.promisify(execCallback);
  await exec(`bash -c ./gmm-decode.sh ${voice.path}`);
  const readFile = util.promisify(fs.readFile);
  const lines: any = await readFile('transcription/one-best-text.txt');
  console.log(lines);
}
