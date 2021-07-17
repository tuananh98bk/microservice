import { getRepository, EntityManager, getConnection, Repository } from 'typeorm';
import { LoginParams, Token, ChangePasswordParams } from '$interfaces/auth.interface';
import { ErrorCode, UserStatus } from '$enums';
import { compare, hash } from 'bcryptjs';
import User from '$entities/User';
import { sign, verify } from 'jsonwebtoken';
import { pick } from 'lodash';
import { promisify } from 'util';
import to from 'await-to-js';
import config from '$config';
const verifyAsync = promisify(verify) as any;

export async function login(params: LoginParams): Promise<Token> {
  return await getConnection().transaction(async (transaction: EntityManager) => {
    const userRepository = transaction.getRepository(User);
    const { username, password } = params;

    const user = await userRepository.findOne({ username: username }, { select: ['id', 'password'] });

    if (!user) throw ErrorCode.Username_Or_Password_Invalid;
    if (user.status === UserStatus.INACTIVE) throw ErrorCode.User_Blocked;

    const isTruePassword = await compare(password, user.password);
    if (!isTruePassword) throw ErrorCode.Username_Or_Password_Invalid;

    return generateTokenCms(user.id, transaction);
  });
}

export async function changePassword(userId: number, params: ChangePasswordParams) {
  const repoUser = getRepository(User);
  const { oldPassword, newPassword } = params;
  if (oldPassword === newPassword) throw ErrorCode.Invalid_Input;

  const user = await repoUser.findOne(userId, { select: ['password'] });
  if (!user) throw ErrorCode.User_Not_Exist;

  const isTruePassword = await compare(oldPassword, user.password);
  if (!isTruePassword) throw ErrorCode.Username_Or_Password_Invalid;

  const passwordHash = await hash(newPassword, Number(process.env.SALT_ROUNDS));
  await repoUser.update(userId, { password: passwordHash });
  return;
}

/**
 * Create token & refresh token for user CMS
 * Get list permissions & assign it into the token
 * if refresh the token expired => create new refresh token
 */
export async function generateTokenCms(userId: number, transaction: EntityManager): Promise<Token> {
  const userRepository = getRepository(User);
  const user = await getUserInformation(userRepository, userId);

  const dataEncode = pick(user, ['id', 'status', 'email', 'mobile', 'permissions']);
  const token = generateCMSAccessToken(dataEncode);
  const oldRefreshToken = user.refreshToken;
  const [error] = await to(verifyAsync(oldRefreshToken, config.auth.CMSRefreshTokenSecret));

  if (error) {
    const dataEncodeRefreshToken = pick(user, ['id', 'status', 'email', 'mobile']);
    const newRefreshToken = generateCMSRefreshToken(dataEncodeRefreshToken);
    await userRepository.update(userId, { refreshToken: newRefreshToken });
    return { token, refreshToken: newRefreshToken };
  }

  return { token, refreshToken: oldRefreshToken };
}

export async function createAccessToken(userId: number): Promise<string> {
  const userRepository = getRepository(User);
  const user = await getUserInformation(userRepository, userId);
  const dataEncode = pick(user, ['id', 'status', 'email', 'mobile', 'permissions']);
  return generateCMSAccessToken(dataEncode);
}

const generateCMSAccessToken = (dataEncode) => {
  return sign(dataEncode, config.auth.CMSAccessTokenSecret, {
    algorithm: 'HS256',
    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE),
  });
};

const generateCMSRefreshToken = (dataEncode) => {
  return sign(dataEncode, process.env.CMS_REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE),
  });
};

/**
 * Get common info & list permissions of the admin
 */
export async function getUserInformation(userRepository: Repository<User>, userId: number): Promise<User> {
  const user = await userRepository
    .createQueryBuilder('user')
    .select(['user.id', 'user.status', 'user.email', 'user.mobile', 'user.refreshToken'])
    .leftJoinAndMapMany('user.permissions', 'UserPermission', 'userPermission', 'user.id = userPermission.userId')
    .where('user.id = :userId', { userId: userId })
    .getOne();
  if (!user) throw ErrorCode.User_Not_Exist;
  user['permissions'] = user['permissions'].map((item) => item.permissionId);
  return user;
}

export async function getAdminInformation(userId: number): Promise<User> {
  const userRepository = getRepository(User);
  const user = userRepository.findOne(userId, { select: ['id', 'status', 'email', 'mobile'] });
  return user;
}
