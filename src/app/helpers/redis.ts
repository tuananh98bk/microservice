import config from '$config';
import Redis from 'ioredis';

export const RedisConnection = new Redis({
  port: config.redis.port, // Redis port
  host: config.redis.host, // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: config.redis.password,
  db: config.redis.db,
});

export async function clearRedisData(mark: string = config.appName) {
  // Lấy ra list key có cùng mark.
  const keys = await RedisConnection.keys(mark + '*');

  // Xóa tất cả key có cùng mark đi.
  const clearData = keys.map((item) => {
    return RedisConnection.del(item);
  });
  // exec
  if (keys.length) await Promise.race(clearData);
}
