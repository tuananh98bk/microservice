import config from '$config';
import Language from '$entities/Language';
import LanguageKey from '$entities/LanguageKey';
import LanguageTranslation from '$entities/LanguageTranslation';
import Voice from '$entities/Voice';
import { CommonStatus } from '$enums';
import { getKeyCacheLanguage, reformatFileLanguage } from '$helpers/utils';
import { getRepository } from 'typeorm';

interface CreatedVoiceParams {}

export async function transcriptions(voiceId: number) {
  const repo = getRepository(Voice);
  const voice = await repo.findOne({ id: voiceId });
  return voice;
}

export async function createVoice(params: CreatedVoiceParams) {}
