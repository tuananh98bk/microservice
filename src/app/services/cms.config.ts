import Config from '$entities/Config';
import { ConfigKeys, ErrorCode, KeyCacheRedis } from '$enums';
import { EntityManager, getConnection, getRepository } from 'typeorm';

export async function getListConfig(params: any) {
  const configRepo = getRepository(Config);
  const configs = configRepo
    .createQueryBuilder('config')
    .select([
      'config.key',
      'config.name',
      'config.value',
      'config.type',
      'config.order',
      'config.metadata',
      'config.isSystem',
      'config.createdBy',
    ]);

  if (params.keyword) configs.where('config.name like :name', { name: `%${params.keyword}%` });

  return await configs.getMany();
}

export async function updateConfig(key: string, params) {
  await getConnection().queryResultCache.remove([KeyCacheRedis.CONFIG]);
  return await getRepository(Config).update(key, params);
}

export async function getDetailConfig(key: string) {
  const config = await getRepository(Config).findOne(key);
  if (!config) ErrorCode.Not_Found;
  return config;
}

// Insert key config if not exists.
// Increment value of key.
// Clear cache redis.
export async function updateVersionConfig(transaction: EntityManager, configKeys: ConfigKeys) {
  await transaction.query(
    'INSERT INTO config (`key`, `name`, `value`, `is_system`, `created_by`, `order`) ' +
      'SELECT temp.* FROM ( ' +
      'SELECT ? as `key`, ? as `name`, 0 as `value`, 1 as is_system, 1 as created_by, 0 as `order`) as temp ' +
      'WHERE NOT EXISTS ( SELECT `key` FROM config WHERE `key` = ?) LIMIT 1',
    [configKeys, configKeys, configKeys]
  );
  await transaction.query('UPDATE config SET `value` = IFNULL(`value`, 0) + 1  WHERE `key` = ?', [configKeys]);
  await transaction.connection.queryResultCache.remove([KeyCacheRedis.CONFIG]);
}
