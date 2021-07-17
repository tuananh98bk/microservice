import Language from '$entities/Language';
import LanguageKey from '$entities/LanguageKey';
import LanguageTranslation from '$entities/LanguageTranslation';
import { getKeyCacheLanguage, reformatFileLanguage } from '$helpers/utils';
import config from '$config';
import { getRepository } from 'typeorm';
import { CommonStatus } from '$enums';

export async function getLanguage(environment: string) {
  const languageKeyRepository = getRepository(LanguageKey);
  const queryBuilder = languageKeyRepository
    .createQueryBuilder('lk')
    .select(['lk.key `key`', 'lt.code code', 'IFNULL(lt.value, lk.defaultValue) value'])
    .innerJoin(LanguageTranslation, 'lt', 'lk.key = lt.key AND lk.environment = lt.environment')
    .innerJoin(Language, 'l', 'l.status = :status AND lt.code = l.code', { status: CommonStatus.ACTIVE })
    .where('lk.environment = :environment', { environment })
    .cache(getKeyCacheLanguage(environment), config.cacheExpire);

  const data = await queryBuilder.getRawMany();
  return reformatFileLanguage(data, { environment });
}
