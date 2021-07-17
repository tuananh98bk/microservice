import _ from 'lodash';
import Language from '$entities/Language';
import LanguageEnv from '$entities/LanguageEnv';
import LanguageKey from '$entities/LanguageKey';
import LanguageTranslation from '$entities/LanguageTranslation';
import { ErrorCode, KeyCacheRedis } from '$enums';
import { getRepository } from 'typeorm';
import { CommonStatus } from '$enums';
import { getKeyCacheLanguage, reformatFileLanguage } from './utils';
import config from '$config';
import { clearRedisData } from './redis';

const SERVER_ENV = 'SERVER';
export async function initServerLanguageData() {
  const languageRepo = getRepository(Language);
  const languageEnvRepo = getRepository(LanguageEnv);
  const languageKeyRepo = getRepository(LanguageKey);
  const languageTranslationRepo = getRepository(LanguageTranslation);

  let languages = await languageRepo.find();
  if (!languages?.length) {
    // Create default language
    await languageRepo.insert([
      { code: 'en', name: 'English', status: 1, viName: 'Tiếng Anh', priority: 0, flagIcon: '', isDefault: 1 },
      { code: 'ja', name: 'Japanese', status: 1, viName: 'Tiếng Nhật', priority: 0, flagIcon: '', isDefault: 0 },
      { code: 'vi', name: 'Vietnamese', status: 1, viName: 'Tiếng Việt', priority: 0, flagIcon: '', isDefault: 0 },
    ]);
    languages = await languageRepo.find();
  }

  let languageEnvs = await languageEnvRepo.find();
  if (!languageEnvs?.length) {
    // Create default language env
    await languageEnvRepo.insert([
      { code: 'APP', name: 'APP', status: 1 },
      { code: 'CMS', name: 'CMS', status: 1 },
      { code: 'SERVER', name: 'SERVER', status: 1 },
    ]);
    languageEnvs = await languageEnvRepo.find();
  }

  let languageKeys = await languageKeyRepo.find({ environment: SERVER_ENV });
  let languageTranslations = await languageTranslationRepo.find({ environment: SERVER_ENV });

  // Create language key and translation
  let languageKeyData: LanguageKey[] = [];
  let languageTranslationData: LanguageTranslation[] = [];
  Object.keys(ErrorCode)
    .filter((x) => !/^\d+$/.test(x)) // remove number key
    .forEach((errorCode) => {
      const key = `Error.${errorCode}`;
      // Create language key
      const isLanguageKeyExisted = languageKeys.some((x) => x.key === key && x.environment === SERVER_ENV);
      if (!isLanguageKeyExisted) {
        languageKeyData.push({
          key: key,
          defaultValue: `${errorCode}`,
          environment: SERVER_ENV,
        });
      }
      // Create language translation
      languages.forEach((language) => {
        const isLanguageTranslationExisted = languageTranslations.some(
          (x) => x.key === key && x.environment === SERVER_ENV && x.code === language.code
        );
        if (!isLanguageTranslationExisted) {
          languageTranslationData.push({
            key: key,
            code: language.code,
            environment: SERVER_ENV,
            value: `${language.code}: ${errorCode}`,
          });
        }
      });
    });
  await languageKeyRepo.insert(languageKeyData);
  await languageTranslationRepo.insert(languageTranslationData);
  if (languageTranslationData?.length) {
    await clearRedisData(KeyCacheRedis.LANGUAGE);
  }
}

export async function getLanguageOfServer() {
  const languageKeyRepository = getRepository(LanguageKey);
  const queryBuilder = languageKeyRepository
    .createQueryBuilder('lk')
    .select(['lk.key `key`', 'lt.code code', 'IFNULL(lt.value, lk.defaultValue) value'])
    .innerJoin(LanguageTranslation, 'lt', 'lk.key = lt.key AND lk.environment = lt.environment')
    .innerJoin(Language, 'l', 'l.status = :status AND lt.code = l.code', { status: CommonStatus.ACTIVE })
    .where('lk.environment = :environment', { environment: SERVER_ENV })
    .cache(getKeyCacheLanguage(SERVER_ENV), config.cacheExpire);

  const data = await queryBuilder.getRawMany();
  return reformatFileLanguage(data, { environment: SERVER_ENV });
}
