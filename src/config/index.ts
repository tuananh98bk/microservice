export default {
  appName: process.env.APP_NAME || 'baseapi',
  domain: process.env.DOMAIN,
  environment: process.env.ENVIRONMENT,
  /** Default 3000 */
  serverPort: process.env.SERVER_PORT,
  /**Default is 1 days */
  cacheExpire: Number(process.env.CACHE_EXPIRE) || 86400000, // 1 Days
  /**Distance for search home, default  10 kilometers */
  distanceSearch: Number(process.env.DISTANCE_SEARCH) || 10, // Kilometer
  /** Mysql database information */
  database: {
    hostname: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    databaseName: process.env.DB_NAME,
  },
  /** Authentication information*/
  auth: {
    AccessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    RefreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    CMSAccessTokenSecret: process.env.CMS_ACCESS_TOKEN_SECRET,
    CMSRefreshTokenSecret: process.env.CMS_REFRESH_TOKEN_SECRET,
    SaltRounds: Number(process.env.SALT_ROUNDS),
    AccessTokenExpire: Number(process.env.ACCESS_TOKEN_EXPIRE),
    RefreshTokenExpire: Number(process.env.REFRESH_TOKEN_EXPIRE),
    VerificationCodeExpire: Number(process.env.VERIFICATION_CODE_EXPIRE),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
  },
  awsUpload: {
    domain: process.env.AWS_DOMAIN,
    downloadUrlThumb: process.env.AWS_DOWNLOAD_URL_THUMB,
    downloadUrl: process.env.AWS_DOWNLOAD_URL,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
  },
};
