import config from '$config';
import Language from '$entities/Language';
import LanguageKey from '$entities/LanguageKey';
import LanguageTranslation from '$entities/LanguageTranslation';
import { ConfigKeys, ErrorCode, KeyCacheRedis } from '$enums';
import { convertToObject, getKeyCacheLanguage, returnPaging, reformatFileLanguage } from '$helpers/utils';
import { getConnection, getRepository, Repository } from 'typeorm';
import flatten from 'flat';
import { clearRedisData } from '$helpers/redis';
import LanguageEnv from '$entities/LanguageEnv';
import { updateVersionConfig } from './cms.config';

export enum CommonStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

export interface IListLanguage {
  status?: CommonStatus;
}

export interface IFileLanguage {
  environment: string;
}

export interface IAddLanguage {
  code: string;
  name: string;
  status: CommonStatus;
  viName: string;
  priority: number;
  flagIcon: string;
  isDefault: CommonStatus;
  createdAt?: string;
}

export interface IUpdateLanguage {
  code: string;
  name: string;
  status: CommonStatus;
  viName: string;
  priority: number;
  flagIcon: string;
  isDefault: CommonStatus;
  createdAt?: string;
}

export interface IListLanguageKey {
  skip: number;
  take: number;
  keyword: string;
  environments: string[];
}

export interface IAddLanguageKey {
  key: string;
  defaultValue: string;
  environment: string;
  translations: Array<{
    code: string;
    value: string;
    environment?: string;
    key?: string;
  }>;
}

export interface IGetFileLanguage {
  environment: string;
  code?: string;
}

export async function getListLanguage(params: IListLanguage) {
  const languageRepository = getRepository(Language);
  const queryBuilder = languageRepository.createQueryBuilder('l');

  if (params.status) {
    queryBuilder.andWhere('l.status = :status', { status: params.status });
  }

  const result = await queryBuilder.orderBy('l.isDefault', 'DESC').addOrderBy('l.priority', 'ASC').getMany();
  return result;
}

/**
 * The first language added is alway the default language.
 * If the new language added is the default language,
 * update the old language default to inactive.
 * @param params
 */
export async function addLanguage(params: IAddLanguage) {
  return await getConnection().transaction(async (transaction) => {
    const languageRepository = transaction.getRepository(Language);

    if (params.isDefault === CommonStatus.ACTIVE) {
      await languageRepository.update({ isDefault: CommonStatus.ACTIVE }, { isDefault: CommonStatus.INACTIVE });
    }

    if (params.isDefault === CommonStatus.INACTIVE) {
      const hasDefaultLanguage = await languageRepository.count({
        where: { status: CommonStatus.ACTIVE, isDefault: CommonStatus.ACTIVE },
      });

      if (!hasDefaultLanguage) {
        params.isDefault = CommonStatus.ACTIVE;
      }
    }

    await languageRepository.save(params);
  });
}

/**
 * LANGUAGE KEY
 */
export async function getListLanguageKey(params: IListLanguageKey) {
  const languageKeyRepository = getRepository(LanguageKey);
  const languageRepository = getRepository(Language);
  const queryBuilder = languageKeyRepository
    .createQueryBuilder('lk')
    .leftJoinAndMapMany(
      'lk.translations',
      LanguageTranslation,
      'lt',
      'lk.key = lt.key AND lk.environment = lt.environment'
    )
    .leftJoin(Language, 'l', 'l.code = lt.code AND l.status = :status', { status: CommonStatus.ACTIVE })
    .select(['lk.key', 'lk.defaultValue', 'lk.environment', 'lt.code', 'lt.value']);

  if (params.keyword) {
    queryBuilder.andWhere('(LOWER(lk.key) LIKE :keyword OR LOWER(lt.value LIKE :keyword))', {
      keyword: `%${params.keyword.toLocaleLowerCase()}%`,
    });
  }

  if (params.environments && params.environments.length) {
    queryBuilder.andWhere('lk.environment IN(:environments)', { environments: params.environments });
  }

  const [data, totalItems] = await queryBuilder.skip(params.skip).take(params.take).getManyAndCount();

  await assignLanguageTranslation(languageRepository, data);
  return returnPaging(data, totalItems, params);
}

/**
 * assign null value
 */
export async function assignLanguageTranslation(languageRepository: Repository<Language>, data: Array<any>) {
  const languages = await languageRepository.find({
    where: { status: CommonStatus.ACTIVE },
    select: ['code'],
    order: { isDefault: 'DESC' },
  });

  data.forEach((item) => {
    item['translations'] = languages.map((element) => {
      const el = item['translations'].find((x) => x.code === element.code);
      const value = el?.value ?? null;
      return { code: element.code, value };
    });
  });
}

export async function addLanguageKey({ translations, ...params }: IAddLanguageKey) {
  await getConnection().transaction(async (transaction) => {
    const languageKeyRepository = transaction.getRepository(LanguageKey);
    const languageTranslationRepository = transaction.getRepository(LanguageTranslation);

    translations.forEach((item) => {
      item.environment = params.environment;
      item.key = params.key;
    });
    await languageKeyRepository.save(params);
    await languageTranslationRepository.save(translations);
    await clearRedisData(KeyCacheRedis.LANGUAGE);
    await updateVersionConfig(transaction, ConfigKeys.LANGUAGE_VERSION);
  });
}

export async function updateLanguageKey({ translations, ...params }) {
  await getConnection().transaction(async (transaction) => {
    const languageKeyRepository = transaction.getRepository(LanguageKey);
    const languageTranslationRepository = transaction.getRepository(LanguageTranslation);

    await languageTranslationRepository.delete({ key: params.key, environment: params.environment });

    translations.forEach((item) => {
      item.environment = params.environment;
      item.key = params.key;
    });

    await languageKeyRepository.save(params);
    await languageTranslationRepository.save(translations);
    await clearRedisData(KeyCacheRedis.LANGUAGE);
    await updateVersionConfig(transaction, ConfigKeys.LANGUAGE_VERSION);
  });
}

/**
 * Get and unflatten key language
 * @param params
 */
export async function getFileLanguage(params: IGetFileLanguage) {
  const languageKeyRepository = getRepository(LanguageKey);
  const queryBuilder = languageKeyRepository
    .createQueryBuilder('lk')
    .select(['lk.key `key`', 'lt.code code', 'IFNULL(lt.value, lk.defaultValue) value'])
    .innerJoin(LanguageTranslation, 'lt', 'lk.key = lt.key AND lk.environment = lt.environment')
    .innerJoin(Language, 'l', 'l.status = :status AND lt.code = l.code', { status: CommonStatus.ACTIVE })
    .where('lk.environment = :environment', { environment: params.environment })
    .cache(getKeyCacheLanguage(params.environment), config.cacheExpire);

  const data = await queryBuilder.getRawMany();
  return reformatFileLanguage(data, params);
}

export async function uploadLanguageFile({ environment, code, languages }) {
  const flatData = flatten(languages);
  const keys = Object.keys(flatData);

  const params = keys.reduce(
    (acc, cur) => {
      acc.languageTranslation.push({
        key: cur,
        code,
        environment,
        value: flatData[cur],
      });
      acc.languageKey.push({
        key: cur,
        environment,
        defaultValue: cur,
      });
      return acc;
    },
    { languageKey: [], languageTranslation: [] }
  );

  return await getConnection().transaction(async (transaction) => {
    const languageKeyRepository = transaction.getRepository(LanguageKey);
    const languageTranslationRepository = transaction.getRepository(LanguageTranslation);
    await languageKeyRepository.save(params.languageKey);
    await languageTranslationRepository.save(params.languageTranslation);
    await clearRedisData(KeyCacheRedis.LANGUAGE);
    await updateVersionConfig(transaction, ConfigKeys.LANGUAGE_VERSION);
  });
}

export async function getListEnvironments() {
  const languageEnvironmentRepository = getRepository(LanguageEnv);
  const environments = await languageEnvironmentRepository.find({ status: CommonStatus.ACTIVE });
  return environments;
}
